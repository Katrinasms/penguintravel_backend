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
// const stripeInstance = stripe('sk_test_51Mbk2bG0cN7nz7SxQE4xPQaAzfkYaKLIJVjYkq0g07ZyjnerUsCnkXXwlqEUZZUkOmzWVjnxzlaUCp4gMxmZ8RgD00D30hGD7S');
const stripeInstance = stripe('pk_live_51Mbk2bG0cN7nz7SxnBSQ6RW5BqJOtZv49CJYZTF55889GFrH0iYplgloSEaEUh0sICqtXexEwuZayKYPO9OaGcfV003flJshCt');

import asyncHandler from "express-async-handler";
import bodyParser from "body-parser";


// const stripePromise = loadStripe("pk_test_51Mbk2bG0cN7nz7SxS0MMm7hnsW4lQdlYegxiOdhWORtwPgQtfBSdQCdfLbLuxHjGhgwDgsrVlwEsPV3It0F5McaW00C0FwwGtq");


dotenv.config();
connectDatabase();

const app = express()

const port = 5001
// app.use("/webhook", bodyParser.raw({ type: "*/*" }));

app.use(express.json());
app.use(cors({ origin: '*' }))

app.get('/', (req, res) => {
    res.send('Hello World!')
  })


const endpointSecret = "123";

app.post('/webhooks', express.raw({type: 'application/json'}),(request, response) => {
    // console.log("loading")
    const sig = request.headers['stripe-signature'];
  
    let event;
  
    try {
      
      event = stripeInstance.webhooks.constructEvent(request.body, sig, endpointSecret);
      // console.log("Webhook verified")
    } catch (err) {
      // console.log(`Webhook Error:${err.message}`)
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    let data;
    data = event.data.object;
    // eventType = event.type;
    // }else{

    //   data = request.body.data.object;
    //   eventType = request.body.type;
    // }
  
    // Handle the event
    if(event.type ==="checkout.session.completed"){
      stripeInstance.customers
        .retrieve(data.customer)
        .then(
          (customer) => {
            // console.log("customer");
            // console.log(customer);
            // console.log("data:", data)
            updateCredit(customer)
          }
        )
        .catch((err)=> console.log(err.message))

    }
    // Return a 200 response to acknowledge receipt of the event
    response.send().end();
});





app.use("/api/products",productRoute);
app.use("/api/import",ImportData);
app.use("/api/users",userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/stripe", stripeRouter);




app.post(
  "/createCredit",
  asyncHandler(async (req, res) => {
    const {
      userId,
      credit_add
    } = req.body;
    // console.log("/createCredit",req.body)

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




//Second Strip tried
app.post('/create-checkout-session', async (req, res) => {

  const customer = await stripeInstance.customers.create({
    metadata:{
      userId: req.body.userInfo._id,
      toPaid: req.body.toPaid
    }
  })

  // console.log("in server~", req.body)
  const session = await stripeInstance.checkout.sessions.create({

    line_items: [
      {
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
    success_url: `https://penguin-travel-frontend-61p7.vercel.app/success`,
    cancel_url: `https://penguin-travel-frontend-61p7.vercel.app/buycredit`,
  });
 
  res.send({url:session.url})
  // console.log("session.url",session.url)
  
 });

 //create credit
 const updateCredit = async(customer) => {

    try{

    const user = await User.findById(customer.metadata.userId)
    // console.log("update User credit",customer.metadata)
    // console.log("update User credit", user.credit)
    if (user){
          user.credit =  user.credit + parseFloat(customer.metadata.toPaid)*2;
          const updateUser = await user.save()
          // console.log("update User", updateUser)
  
    }
       
     
    }catch(err) {
      console.log(err);
    }
 }


// const endpointSecret = "whsec_bVVmQqjTzbijzhAvUbuVuZBMco5IZXb8";


//  app.post('/webhooks', express.raw({type: 'application/json'}),(request, response) => {
//     console.log("loading")
//     const sig = request.headers['stripe-signature'];
  
//     let event;
  
//     try {
      
//       event = stripeInstance.webhooks.constructEvent(request.body, sig, endpointSecret);
//       console.log("Webhook verified")
//     } catch (err) {
//       console.log(`Webhook Error:${err.message}`)
//       response.status(400).send(`Webhook Error: ${err.message}`);
//       return;
//     }
//     let data;
//     data = event.data.object;
//     // eventType = event.type;
//     // }else{

//     //   data = request.body.data.object;
//     //   eventType = request.body.type;
//     // }
  
//     // Handle the event
//     if(event.type ==="checkout.session.completed"){
//       stripeInstance.customers
//         .retrieve(data.customer)
//         .then(
//           (customer) => {
//             console.log("customer");
//             console.log(customer);
//             console.log("data:", data)
//             updateCredit(customer)
//           }
//         )
//         .catch((err)=> console.log(err.message))

//     }
//     // Return a 200 response to acknowledge receipt of the event
//     response.send().end();
//  });

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
