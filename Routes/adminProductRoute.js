import express from "express";
import {addProduct,getProduct,updateProduct,deleteProduct} from "../Controllers/adminProductController.js"


const adminProductRouter=express.Router();

adminProductRouter.post("/create",addProduct);
adminProductRouter.get("/view",getProduct);
adminProductRouter.patch("/update/:id",updateProduct);
adminProductRouter.delete("/delete/:id",deleteProduct);

export default adminProductRouter;