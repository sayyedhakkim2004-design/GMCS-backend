import express from "express";
import { createCustomer, deleteCustomer, resetPassword, sendOtp, verifyCustomer, verifyOtp, viewcustomer } from "../Controllers/customerController.js";
import { verifyCustomerToken } from "../MiddleWare/customerMiddleware.js";

const customerRoute=express.Router();

customerRoute.post("/create",createCustomer);
customerRoute.post("/verify",verifyCustomer);
customerRoute.get("/view",viewcustomer);
customerRoute.delete("/delete/:id",deleteCustomer);

customerRoute.post("/reset",sendOtp);
customerRoute.post("/verify-otp",verifyOtp);
customerRoute.post("/reset-password",verifyCustomerToken,resetPassword)

export default customerRoute;