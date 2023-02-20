import mongoose from "mongoose";

const creditSchema = new mongoose.Schema({
    userId : {
        type:String, 
        required: true,
    },
    credit_add: {
        type:Number,
        default:0,
    },
    payment_status: {
        type:String,
        default:"pending",
        required: true,
    }
    },
    {
    timestamps: true,
    }
)


const Credit = mongoose.model("Credit", creditSchema);
  
export default Credit;