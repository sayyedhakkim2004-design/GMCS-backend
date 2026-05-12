
import express from "express"
import cors from "cors"
import mongoose from "mongoose";
import dotenv from "dotenv"
import authRouter from "./Routes/userDataRoutes.js";
import adminRouter from "./Routes/adminDataRoutes.js";
import cookieParser from "cookie-parser";
import customerRoute from "./Routes/customerRoute.js"
import adminProductRouter from "./Routes/adminProductRoute.js";





const app=express()
dotenv.config();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5174",
  credentials: true
}));
app.use(cookieParser());


//Mongodb Connection

if (!process.env.mongoURI) {
    console.error("Mongo URI is NOT defined in .env");
    process.exit(1);
}
mongoose.connect(process.env.mongoURI)
.then(()=>{
    console.log("MongoDb Connected Successfully")
})
.catch((err)=>{
    console.log(err);
    console.log("Error Occured",err.message)
})

//user Data routes
app.use("/api/v1",authRouter);
app.use("/api/v1/admin",adminRouter)
app.use("/api/v1/customer",customerRoute);
app.use("/api/v1/product",adminProductRouter)
app.get("/test", (req, res) => {
  res.send("Test Route Working");
});

app.listen(process.env.PORT,()=>{
    console.log(`App is Listening to the Server ${process.env.PORT} `)
})
