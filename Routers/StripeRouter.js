import express from "express";
import dotenv from "dotenv"
import stripe from 'stripe';
const stripeInstance = stripe("sk_test_51Mbk2bG0cN7nz7SxQE4xPQaAzfkYaKLIJVjYkq0g07ZyjnerUsCnkXXwlqEUZZUkOmzWVjnxzlaUCp4gMxmZ8RgD00D30hGD7S");
import cors from 'cors';

const stripeRouter = express.Router()
dotenv.config();
// app.use(cors({ origin: '*' }))


const YOUR_DOMAIN = 'http://localhost:3000';
stripeRouter.post('/create-checkout-session', async (req, res) => {
    // console.log("in server~", req)
    const session = await stripeInstance.checkout.sessions.create({
  
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: 'price_1McPmMG0cN7nz7SxG6qotH9C',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success`,
      cancel_url: `${YOUR_DOMAIN}/payment/coffee`,
    });
  
    // res.redirect(303, session.url);
    res.send({url:session.url})
});

 
export default stripeRouter;