import express from "express";
import dotenv from "dotenv"
import cors from 'cors';
import {connectDatabase,createbucket} from "./config/MongoDb.js";
import ImportData from "./dataImport.js";
import userRouter from "./Routers/UserRouters.js";
import productRoute from "./Routers/ProductRouters.js";
import orderRouter from './Routers/OrderRouters.js'
import stripeRouter from "./Routers/StripeRouter.js"; 
import stripe from 'stripe';
import Credit from "./Model/CreditModel.js";
import User from "./Model/UserModel.js";
const stripeInstance = stripe('sk_test_51Mbk2bG0cN7nz7SxQE4xPQaAzfkYaKLIJVjYkq0g07ZyjnerUsCnkXXwlqEUZZUkOmzWVjnxzlaUCp4gMxmZ8RgD00D30hGD7S');
import asyncHandler from "express-async-handler";


// const stripePromise = loadStripe("pk_test_51Mbk2bG0cN7nz7SxS0MMm7hnsW4lQdlYegxiOdhWORtwPgQtfBSdQCdfLbLuxHjGhgwDgsrVlwEsPV3It0F5McaW00C0FwwGtq");


dotenv.config();
connectDatabase();

const app = express()
const port = 5001
app.use(express.json());
app.use(cors({ origin: '*' }))


app.get('/', (req, res) => {
    res.send('Hello World!')
  })

app.use("/api/products",productRoute);
app.use("/api/import",ImportData);
app.use("/api/users",userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/stripe", stripeRouter);


//First Strip tried - start//
const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripeInstance.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "hkd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});
//End Strip tried - end//

//Second Strip tried
const YOUR_DOMAIN = 'http://localhost:3000';
app.post('/create-checkout-session', async (req, res) => {

  const customer = await stripeInstance.customers.create({
    metadata:{
      userId: req.body.userInfo._id,
      toPaid: req.body.toPaid
    }
  })

  console.log("in server~", req.body)
  const session = await stripeInstance.checkout.sessions.create({

    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price_data:{
          currency:"usd",
          product_data:{
            name: "Credit Buying"
          },
          unit_amount: req.body.toPaid * 100,
        },
        quantity: 1,
      },
      
    ],
    mode: 'payment',
    customer: customer.id,
    success_url: `${YOUR_DOMAIN}/success`,
    cancel_url: `${YOUR_DOMAIN}/buycredit`,
  });
 
  res.send({url:session.url})
  console.log("session.url",session.url)
  
 });



app.post(
  "/createCredit",
  asyncHandler(async (req, res) => {
    const {
      userId,
      credit_add
    } = req.body;
    console.log("/createCredit",req.body)

    if (!userId && !credit_add) {
      res.status(400);
      throw new Error("No credit");
      return;
    } else {
      const credit = new Credit({
        userId,
        credit_add,
   
      });

      const createCredit = await credit.save();
      res.status(201).json(createCredit);
    }
  })
);

// const createCreditPayment = async()


 //create credit
 const updateCredit = async(customer) => {
    // const newCredit = new Credit({
    //   userId: customer.metadata.userId,
    //   credit_add: customer.metadata.toPaid
    // })
    

    // try {
    //   const savedCredit = await newCredit.save();
    //   console.log("Processed Order:", savedCredit);
    // }catch(err){
    //   console.log(err);
    // }

    try{
      // const credit = await Credit.findById(customer.metadata.userId)
    
      // credit.payment_status = "success"
      // const updateCredit = await credit.save()
      // console.log("Update Credit:", updateCredit);
      // customer.metadata.credit_add

    const user = await User.findById(customer.metadata.userId)
    console.log("update User credit",customer.metadata)
    console.log("update User credit", user.credit)
    if (user){
          user.credit =  user.credit + parseFloat(customer.metadata.toPaid)*2;
          const updateUser = await user.save()
          console.log("update User", updateUser)
  
    }
       
    
     
    }catch(err) {
      console.log(err);
    }



 }

 let endpointSecret;
  // endpointSecret = "whsec_65d02c1bec75dc957e1a17522841f9ec9f497ef80d0d6408394a556094b943f7";

 app.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
    const sig = request.headers['stripe-signature'];
    let data;
    let eventType;
  
    if(endpointSecret){
    let event;
  
    try {
      event = stripeInstance.webhooks.constructEvent(request.body, sig, endpointSecret);
      console.log("Webhook verified")
    } catch (err) {
      console.log(`Webhook Error:${err.message}`)
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    data = event.data.object;
    eventType = event.type;
    }else{

      data = request.body.data.object;
      eventType = request.body.type;
    }
  
    // Handle the event
    if(eventType ==="checkout.session.completed"){
      stripeInstance.customers
        .retrieve(data.customer)
        .then(
          (customer) => {
            console.log("customer");
            console.log(customer);
            console.log("data:", data)
            updateCredit(customer)
          }
        )
        .catch((err)=> console.log(err.message))

    }
    // Return a 200 response to acknowledge receipt of the event
    response.send().end();
 });

//Second Strip tried - end

const PORT = process.env.PORT || 5001 ;

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})


// {
//   // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
//   price: 'price_1McPmMG0cN7nz7SxG6qotH9C',
//   quantity: 1,
// },
