import express from "express";
import User from "./Model/UserModel.js";
import users from "./test_data/user.js";
import asyncHandler from "express-async-handler";
import Product from "./Model/ProductModel.js";
import product_data from './test_data/product.js'
import * as fs from 'fs';


const ImportData = express.Router();

ImportData.post(
  "/user",
  asyncHandler(async (req, res) => {
    await User.remove({});
  
    const importUser = await User.insertMany(users);
    res.send({ importUser });
  })
);


ImportData.post(
  "/product",
  asyncHandler(async (req, res) => {
    await Product.remove({});
    //generate photo from users
    //loop
    // const new_product_data = await product_data.map((product) =>{
    //   const photo_file= fs.readFileSync("./asset/2.png");
    //   console.log("photo_file",photo_file)
    //   product.imageSrc = photo_file;
    //   // const new_product = [...product, ]

    //   return product;
    //   // return {
    //   //   ...product,
    //   //   imageSrc: photo_file
    //   // }
    //   // product.photoBuffer = new Buffer.from(photo_file).toString('binary');
    //   // product_data
    // })
    // console.log("product_data",new_product_data)
    const importProduct = await Product.insertMany(product_data);
    res.send({ importProduct });
  })
);



export default ImportData;