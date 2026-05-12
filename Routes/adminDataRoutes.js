import express from "express"
import{viewAdmin,verifyAdmin,createAdmin, resetpassword, verifyOtp, resetNewPassword} from "../Controllers/adminController.js"
import {verifyResetToken} from "../MiddleWare/adminMiddleware.js"

const adminRouter=express.Router();


//Admin Routes
adminRouter.post("/create",createAdmin)
adminRouter.post("/verify",verifyAdmin)
adminRouter.get("/view",viewAdmin)

adminRouter.post("/reset",resetpassword);
adminRouter.post("/verify-otp",verifyOtp);
adminRouter.post("/reset-password",verifyResetToken,resetNewPassword)

export default adminRouter;
