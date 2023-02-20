import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
    name:{
        type:String,
        require: true
    },
    email:{
        type:String,
        require: true,
        unique: true
    },
    password:{
        type:String,
        require:true
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
      },
    credit:{
        type:Number,
        required: true,
        default: 2,
    }

}, {
    timestamps: true
})

//Login
userSchema.methods.matchPassword = async function(enterPassword){
    return await bcrypt.compare(enterPassword, this.password);
}


//Register
userSchema.pre("save", async function (next) {
    console.log("password", this.isModified("password"));
    if (!this.isModified("password")) {
      next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });

const User = mongoose.model("User", userSchema);

export default User