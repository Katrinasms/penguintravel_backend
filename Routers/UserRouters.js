import express from "express";
import asyncHandler from "express-async-handler";
import User from "../Model/UserModel.js"
import generateToken from "../utils/generateToken.js";
import {protect} from "../Middleware/AuthMiddleware.js";
// ,admin
const userRouter  = express.Router();

//register
userRouter.post(
    "/",
    asyncHandler(async (req, res) => {
      const { name, email, password } = req.body;
      // console.log(name,email,password);
  
      if(email && name && password){
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error("User already exists");
          }
      
          const user = await User.create({
            name,
            email,
            password,
          });
      
          if (user) {
            res.status(201).json({
              _id: user._id,
              name: user.name,
              email: user.email,
              isAdmin: user.isAdmin,
              credit:user.credit,
              token: generateToken(user._id),
            });
          } else {
            res.status(400);
            throw new Error("Invalid User Data");
          }
      }else{
        res.status(400);
        throw new Error("Invalid User Input");
      }
      
     
    })
  );

  userRouter.post(
    "/gooReg",
    asyncHandler(async (req, res) => {
      const { name, email, gid } = req.body;
      // console.log(name,email,gid);
  
      if(email && name && gid){
        const userExists = await User.findOne({ email });
        if (userExists) {
            // res.status(400);
            // throw new Error("User already exists");
            res.json({
              isExist: true,
              isGoogle: true,
              _id: userExists._id,
              name: userExists.name,
              email: userExists.email,
              credit:userExists.credit,
              isAdmin: userExists.isAdmin,
              token: generateToken(userExists._id),
              createdAt: userExists.createdAt,
              
             })
          }else{
            const user = await User.create({
              name,
              email,
              password: gid,
            })
            if (user) {
              res.status(201).json({
                isExist: false,
                isGoogle: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                credit:user.credit,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
              });
            } else {
              res.status(400);
              throw new Error("Invalid User Data");
            }
          }
      }else{
        res.status(400);
        throw new Error("Invalid User Input");
      }
      
     
    })
  );

  // Login
userRouter.post(
    "/login",
    asyncHandler(async( req, res) => {
        const {email, password} = req.body
        const user = await User.findOne({email});
        if(user && await user.matchPassword(password)){
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                credit:user.credit,
                token: generateToken(user._id),
                createdAt: user.createdAt,
                
            })
        }else {
            res.status(401)
            throw new Error("Invalid Email or Password")
        }
    })
)

userRouter.get(
  "/profile",
  protect,
  asyncHandler(async( req, res) => {
      const user = await User.findById(req.user.id)
      if (user){
          res.json({
              _id: user._id,
              name: user.name,
              email: user.email,
              credit:user.credit,
              isAdmin: user.isAdmin,
              createdAt: user.createdAt,
              token: generateToken(user._id),
          })
      }else {
          res.status(404)
          throw new Error("User Not Found")
      }
     
  })
)

//deduct credit
userRouter.put(
  "/updateCredit",
  protect,
  asyncHandler(async( req, res) => {
      // res.send("User Profile")
      const user = await User.findById(req.user.id)
      if (user){
           user.credit = req.body.credit || user.credit
           const updateUser = await user.save()
           res.json({
              _id: updateUser._id,
              name: updateUser.name,
              email: updateUser.email,
              isAdmin: updateUser.isAdmin,
              createdAt: updateUser.createdAt,
              credit: updateUser.credit,
              token: generateToken(updateUser._id)
           })
      }else {
          res.status(404)
          throw new Error("User Not Found")
      }
     
  })
)





  export default userRouter;