import express from "express";
import { deleteData, UserGetData,orderData,editData,dashboardData } from "../Controllers/userDataController.js";
import {isGuestUser} from "../MiddleWare/customerMiddleware.js"

const authRouter=express.Router();

//Users Order Routes
authRouter.get("/users",isGuestUser,UserGetData);
authRouter.post("/orders",isGuestUser,orderData);
authRouter.delete("/delete/:id",isGuestUser,deleteData);
authRouter.patch("/edit/:id",isGuestUser,editData);
authRouter.get("/customer",dashboardData);






export default authRouter;