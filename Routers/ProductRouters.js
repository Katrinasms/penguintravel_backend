import express from "express";
import asyncHandler from "express-async-handler";
import Product from "../Model/ProductModel.js";
// import { admin, protect } from "./../Middleware/AuthMiddleware.js";
import mongoose from "mongoose";


const productRoute  = express.Router();

// GET ALL PRODUCT
productRoute.get(
    "/",
    asyncHandler(async (req, res) => {
      const pageSize = 9;
      const page = Number(req.query.pageNumber) || 1;
      const keyword = req.query.keyword
        ? {
            categories: {
              $regex: req.query.keyword,
              $options: "i",
            },
          }
        : {};
      const count = await Product.countDocuments({ ...keyword });
      console.log(count);
      // let seq_array = shuffle(Array.from(Array(count).keys()));

      
      // const resequencedID = [];
      // for (let i = 0; i < seq_array.length; i++) {
      //   // const random = Math.floor(Math.random() * count);
      //   const doc = await Product.findOne({ ...keyword }).skip(seq_array[i]).exec();
      //   resequencedID.push(doc._id);
      //   console.log("id", doc._id);
      // }
      // const products = await Product.find({ _id: { $in: resequencedID }});



      const products = await Product.find({ ...keyword })
        .sort({ _id: -1 });
      res.json({ products, page, pages: Math.ceil(count / pageSize) });
    })
)




//GET RANDOM Three Image
productRoute.get(
  "/random",
  asyncHandler(async (req, res) => {
    const count = await Product.countDocuments();
    const randomIds = [];
    for (let i = 0; i < 3; i++) {
      const random = Math.floor(Math.random() * count);
      const doc = await Product.findOne().skip(random).exec();
      randomIds.push(doc._id);
      // console.log("id", doc._id);
    }

    
    const product = await Product.find({ _id: { $in: randomIds }});

    if (product) {
      // console.log("getrandomProduct", product)
      res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not Found");
    }
  })
);



// ADMIN GET ALL PRODUCT WITHOUT SEARCH AND PEGINATION
// productRoute.get(
//   "/all",
//   protect,
//   admin,
//   asyncHandler(async (req, res) => {
//     const products = await Product.find({}).sort({ _id: -1 });
//     res.json(products);
//   })
// );


// GET SINGLE PRODUCT
productRoute.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const product = await Product.findById(req.params.id);
      if (product) {
        // console.log("getproductbyid", product)
        res.json(product);
      } else {
        res.status(404);
        throw new Error("Product not Found");
      }
    })
  );





// PRODUCT REVIEW
// productRoute.post(
//   "/:id/review",
//   protect,
//   asyncHandler(async (req, res) => {
//     const { rating, comment } = req.body;
//     const product = await Product.findById(req.params.id);

//     if (product) {
//       const alreadyReviewed = product.reviews.find(
//         (r) => r.user.toString() === req.user._id.toString()
//       );
//       if (alreadyReviewed) {
//         res.status(400);
//         throw new Error("Product already Reviewed");
//       }
//       const review = {
//         name: req.user.name,
//         rating: Number(rating),
//         comment,
//         user: req.user._id,
//       };

//       product.reviews.push(review);
//       product.numReviews = product.reviews.length;
//       product.rating =
//         product.reviews.reduce((acc, item) => item.rating + acc, 0) /
//         product.reviews.length;

//       await product.save();
//       res.status(201).json({ message: "Reviewed Added" });
//     } else {
//       res.status(404);
//       throw new Error("Product not Found");
//     }
//   })
// );



// // DELETE PRODUCT
// productRoute.delete(
//   "/:id",
//   protect,
//   admin,
//   asyncHandler(async (req, res) => {
//     const product = await Product.findById(req.params.id);
//     if (product) {
//       await product.remove();
//       res.json({ message: "Product deleted" });
//     } else {
//       res.status(404);
//       throw new Error("Product not Found");
//     }
//   })
// );


// // CREATE PRODUCT
// productRoute.post(
//   "/",
//   protect,
//   admin,
//   asyncHandler(async (req, res) => {
//     const { name, price, description, image, countInStock } = req.body;
//     const productExist = await Product.findOne({ name });
//     if (productExist) {
//       res.status(400);
//       throw new Error("Product name already exist");
//     } else {
//       const product = new Product({
//         name,
//         price,
//         description,
//         image,
//         countInStock,
//         user: req.user._id,
//       });
//       if (product) {
//         const createdproduct = await product.save();
//         res.status(201).json(createdproduct);
//       } else {
//         res.status(400);
//         throw new Error("Invalid product data");
//       }
//     }
//   })
// );

// // UPDATE PRODUCT
// productRoute.put(
//   "/:id",
//   protect,
//   admin,
//   asyncHandler(async (req, res) => {
//     const { name, price, description, image, countInStock } = req.body;
//     const product = await Product.findById(req.params.id);
//     if (product) {
//       product.name = name || product.name;
//       product.price = price || product.price;
//       product.description = description || product.description;
//       product.image = image || product.image;
//       product.countInStock = countInStock || product.countInStock;

//       const updatedProduct = await product.save();
//       res.json(updatedProduct);
//     } else {
//       res.status(404);
//       throw new Error("Product not found");
//     }
//   })
// );

export default productRoute;
