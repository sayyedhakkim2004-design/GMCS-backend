import { customer } from "../Config/Mongodb.js";
import bcrypt from "bcryptjs";
import sibApiV3sdk from "sib-api-v3-sdk";
import { generateOtp } from "../utils/otpGenerator.js";
import jwt from "jsonwebtoken";

const client = sibApiV3sdk.ApiClient.instance
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;
const transacEmail = new sibApiV3sdk.TransactionalEmailsApi();

export const createCustomer = async (req, res) => {
    try {
        const { name, phoneNumber, email, password } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: "Name Required" });
        }
        if (!phoneNumber) {
            return res.status(400).json({ success: false, message: "Phone Number Required" });
        }
        if (!email) {
            return res.status(400).json({ success: false, message: "Email Required" });
        }
        if (!password) {
            return res.status(400).json({ success: false, message: "Password Required" });

        }
        const isEmail = await customer.findOne({ email });
        if (isEmail) {
            return res.status(400).json({ success: false, message: "Email Already Exists" })
        }
        const isPhone = await customer.findOne({ phoneNumber });
        if (isPhone) {
            return res.status(400).json({ success: false, message: "PhoneNumber Already Exists" })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newCustomer = new customer({
            name,
            phoneNumber,
            email,
            password: hashedPassword
        });
        await newCustomer.save();

        const customerId = jwt.sign({ id: customer._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
        res.cookie("customerId", customerId, {
            httpOnly: true,
            secures: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        })
        return res.status(200).json({ success: true, message: "Customer Created Successfully " })

    }
    catch (err) {
        return res.status(400).json({ success: false, message: err.message })
    }
}

export const verifyCustomer = async (req, res) => {
    try {

        const { email, password } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email Required" });
        }
        if (!password) {
            return res.status(400).json({ success: false, message: "Password Required" });
        }
        const IsCustomer = await customer.findOne({ email });
        if (!IsCustomer) {
            return res.status(401).json({ success: false, message: "Email Not Found" });
        }
        const validatePassword = await bcrypt.compare(password, IsCustomer.password);
        if (!validatePassword) {
            return res.status(401).json({ success: false, message: "Invalid Password" });
        }
        const customerId = jwt.sign({ id: IsCustomer._id, role: "customer" }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
        res.cookie("customerId", customerId, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000

        })

        return res.status(200).json({ success: true, message: "Customer Verified" });
    }
    catch (err) {
        return res.status(400).json({ success: false, message: err.message })
    }
}

export const viewcustomer = async (req, res) => {
    try {
        let { page = 1, limit = 2 } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        const skip = (page - 1) * limit;
        const total = await customer.countDocuments();
        // ✅ paginated data
        const customers = await customer.find()
            .skip(skip)
            .limit(limit);

        // ✅ total count


        res.json({
            success: true,
            data: customers,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
export const deleteCustomer = async (req, res) => {
    try {

        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ success: false, message: "Customer Not Found" });
        }
        await customer.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: "Customer Deleted Successfully" });
    }
    catch (err) {
        return res.status(400).json({ success: false, message: err.message })
    }
}

//customer reset password
export const sendOtp = async (req, res) => {
    try {

        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email Required" });
        }
        const isEmail = await customer.findOne({ email });
        if (!isEmail) {
            return res.status(400).json({ success: false, message: "Customer Not Found" });
        }

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await customer.findOneAndUpdate(
            { email },
            { otp, expiresAt },
            { upsert: true }
        )
        await transacEmail.sendTransacEmail({
            to: [{ email }],
            sender: {
                email: process.env.BREVO_SENDER_EMAIL,
                name: "Galaxy"
            },
            subject: "customers Reset password Otp",
            htmlContent: `
            <h2>otp:${otp}</h2>
            <p>your reset password otp is vaild for 5 minutes</p>`
        })
        return res.status(200).json({ success: true, message: "otp send to your email" })
    }
    catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
}
//customer Otp Verify
export const verifyOtp = async (req, res) => {
    try {

        const { email, otp } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email Required" });
        }
        if (!otp) {
            return res.status(400).json({ success: false, message: "Otp Required" });
        }
        const record = await customer.findOne({ email });
        if (!record) {
            return res.status(401).json({ success: false, message: "Customer not Found" });
        }
        if (Date.now() > record.expiresAt) {
            return res.status(400).json({ success: false, message: "Otp Expired" });
        }
        if (record.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid Otp" });
        }
        const resetToken = jwt.sign({ email, purpose: "reset" }, process.env.JWT_SECRET_KEY, { expiresIn: "5m" });
        res.cookie("CustomerResetToken", resetToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 24 * 60 * 60 * 1000
        });
        return res.status(200).json({ success: true, message: "Otp Verified" });
    }
    catch (err) {
        console.log(err)
        return res.status(400).json({ success: false, message: err.message });
    }
}

//customer reset password
export const resetPassword = async (req, res) => {
    try {

        const { password } = req.body;
        const email = req.email;
        if (!password) {
            return res.status(400).json({ success: false, message: "Password Required" });
        }
        const isCustomer = await customer.findOne({ email });
        if (!isCustomer) {
            return res.status(400).json({ success: false, message: "Customer Not Found" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await customer.findOneAndUpdate(
            { email },
            { password: hashedPassword }
        );

        await customer.updateOne(
            { email },
            { $unset: { otp: "", expiresAt: "" } }
        );
        return res.status(200).json({ success: true, message: "Password Reset Successfully" });
    }
    catch (err) {
        console.log(err)
        return res.status(400).json({ success: false, message: err.message });
    }
}



