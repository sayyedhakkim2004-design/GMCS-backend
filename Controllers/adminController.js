import { admin } from "../Config/Mongodb.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateOtp } from "../utils/otpGenerator.js";

import dotenv from "dotenv";
dotenv.config();


import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();



//create Admin 

export const createAdmin = async (req, res) => {
    try {
        const { email, password, branch } = req.body;

        const userCount = await admin.countDocuments();

        if (userCount >= 3) {
            return res.status(403).json({ success: false, message: "Only 3 Accounts Allowed" });
        }
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is Required" });
        }
        if (!password) {
            return res.status(400).json({ success: false, message: "Password is Required" });
        }
        if (!branch) {
            return res.status(400).json({ success: false, message: "Branch Reqired" });
        }
        const existingUser = await admin.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "Admin Already Exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const adminData = new admin({
            email,
            password: hashedPassword,
            branch
        });

        await adminData.save();
        return res.status(201).json({ success: true, message: "Admin Created Successfully" });
    }

    catch (err) {
        return res.status(400).json({ success: false, message: err.message })
    }
}

//verify Admin 
export const verifyAdmin = async (req, res) => {
    try {
        const { email, password ,branch} = req.body;
        if (!email ) {
            return res.status(401).json({ success: false, message: "Email is Empty" });
        }
        if (!password) {
            return res.status(401).json({ success: false, message: "Password is Empty" });
        }
        const adminData = await admin.findOne({ email });
        if (!adminData) {
            return res.status(401).json({ success: false, message: "Admin Not Found" });
        }
        const validatePassword = await bcrypt.compare(password, adminData.password)

        if (!validatePassword) {
            return res.status(401).json({ success: false, message: "Invalid Password" })
        }

        const role = email && password ? "admin" : "user"

        const token = jwt.sign({ id: adminData._id, role: role }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000
        });
        return res.status(200).json({ success: true, message: "Admin Verified" });

    }
    catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
}

//view Admin
export const viewAdmin = async (req, res) => {
    try {
        const adminData = await admin.find();
        if(!adminData){
            return res.status(400).json({success:false,message:"Admin Not Found"})
        }
        res.json(adminData);
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message })
    }
}

//reset password

export const resetpassword = async (req, res) => {
    try {
        const { email } = req.body;
        const isEmail = await admin.findOne({ email });
        if (!isEmail) {
            return res.status(400).json({ success: false, message: "Email Not Found" });
        }
        const otp = generateOtp()
        const expiresAt = new Date(Date.now() + 24* 60* 60 * 10000);
        await admin.findOneAndUpdate(
            { email },
            { otp, expiresAt },
            { upsert: true }
        )

        await tranEmailApi.sendTransacEmail({
            to: [{ email }],
            sender: {
                email: process.env.BREVO_SENDER_EMAIL,
                name: "Hakkim"
            },
            subject: "Your OTP Code",
            htmlContent: `
        <h2>Your OTP is: ${otp}</h2>
        <p>This OTP is valid for 5 minute.</p>
      `
        });
        return res.status(200).json({ success: true, message: "OTP Send Successfully" });

    }
    catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, message: err.message });
    }
}

//verify password reset otp
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is Empty" })
        }
         if (!otp) {
            return res.status(400).json({ success: false, message: "OTP is Empty" })
        }
        const record = await admin.findOne({ email });
        if (!record) {
            return res.status(400).json({ success: false, message: "Email Not Found" });
        }

        if (Date.now() > record.expiresAt) {
            return res.status(400).json({ success: false, message: "OTP Expires" });
        }
        if (record.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });

        }
        const resetToken = jwt.sign({ email, purpose: "reset" }, process.env.JWT_SECRET_KEY, { expiresIn: "5m" });
        res.cookie("resetToken", resetToken, {
            httpOnly: true,   // 🔒 prevents JS access
            secure: false,  
            sameSite:"lax",  // true in production (HTTPS)
            maxAge: 24 *60 * 60 * 1000 // 5 min
        });


        return res.status(200).json({ success: true, message: "OTP Verified Successfully", resetToken });

    }
    catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, message: err.message })
    }
}

//reset new password
export const resetNewPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const email = req.email;
        const adminData = await admin.findOne({ email });
        if (!adminData) {
            return res.status(400).json({ success: false, message: "Admin Not Found" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await admin.findOneAndUpdate(
            { email }, { password: hashedPassword }
        );

        await admin.updateOne(
            { email },
            { $unset: { otp: "", expiresAt: "" } }
        );

        return res.status(200).json({ success: true, message: "Password Reset Successfull" });

    }

    catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, message: err.message });
    }
}