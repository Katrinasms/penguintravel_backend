import mongoose from "mongoose";
import multer from 'multer';
// import {GridFsStorage} from "multer-gridfs-storage";
// import multer from 'multer'
import {GridFsStorage} from 'multer-gridfs-storage'
import Grid from 'gridfs-stream'
import methodOverride from'method-override'

mongoose.set("strictQuery", false);
const connectDatabase = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        })
        console.log(`MongoDB Connected`);
    }catch (error){
        console.log("Error", error.message)
        process.exit(1)
    }
}


const createbucket = () => {
    let bucket;
    mongoose.connection.on("connected", ()=>{
    var db = mongoose.connections[0].db;
    bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "newBucket"
    });
    console.log("bucket",bucket);
})}


// const create2ndbucket = ()=>{
//     const mongoURI = 'mongodb://localhost:27017/fileU';
//     const conn = mongoose.createConnection(mongoURI);
//     let gfs;
//     conn.once('open', () => {
//         // Init stream
//         gfs = Grid(conn.db, mongoose.mongo);  
//         gfs.collection('uploads');
//       });
//       const storage = new GridFsStorage({
//         url: mongoURI,
//         file: (req, file) => {
//           return new Promise((resolve, reject) => {
//               const filename = file.originalname;
//               const fileInfo = {
//                 filename: filename,
//                 bucketName: 'uploads'
//               };
//               resolve(fileInfo);
//           });
//         }
//       });
//       return multer({ storage})

// }



export  {connectDatabase,createbucket};

