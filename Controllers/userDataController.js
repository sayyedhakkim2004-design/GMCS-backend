import express from "express";
import { users } from "../Config/Mongodb.js";




const app = express();

//GET the users order data
export const UserGetData = async (req, res) => {
    try {

        const { userId, role } = req.user; // from middleware



        if (req.user?.role == "customer") {
            const data = await users.find({ userId });
            return res.status(200).json({
                success: true,
                data
            });
        }
        else if (req.user?.role == "Guest") {
            return res.status(200).json({ success: false, message: "You are Not Log In" });
        }
        else {

            const data = await users.find();
            return res.status(200).json({
                success: true,
                data
            });
        }

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


export const dashboardData = async (req, res) => {
    try {
        let { page = 1, limit = 6 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;
        const total = await users.countDocuments();
        const data = await users.find().skip(skip).limit(limit);;
        return res.status(200).json({
            success: true,
            data,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    }

    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}



//post the orders from user
export const orderData = async (req, res) => {
    try {
        const { userName, phoneNumber, product, amount } = req.body;
        const { userId } = req.user;

        if (!userName) {
            return res.status(400).send({ success: false, message: "Name Fleid is Empty" });

        }
        if (!phoneNumber) {
            return res.status(400).send({ success: false, message: "Phone Number Fleid is Empty" });

        }
        if (!product) {
            return res.status(401).send({ success: false, message: "Product Fleid is Empty" });

        }
        if (!amount) {
            return res.status(400).send({ success: false, message: "Amount Fleid is Empty" });

        }

        const datas = new users({
            userId,
            userName,
            phoneNumber,
            product,
            amount
        });

        await datas.save();
        return res.status(200).send({ success: true, message: "Data saved successfully" });
    }
    catch (err) {
        console.log(err);
        return res.status(400).send({ success: false, message: err.message })
    }
}

//delete the users ordered data
export const deleteData = async (req, res) => {
    try {
        const id = req.params.id;

        await users.findByIdAndDelete(id);
        res.status(201).json({ success: true, message: "deleted successfully" });

    }
    catch (err) {
        console.log(err)
        res.status(400).json({ success: false, message: err.message })
    }
}

//Edit user's Order data
export const editData = async (req, res) => {
    try {
        const { userName, phoneNumber, product, amount } = req.body;
        const id = req.params.id;
        const user = await users.findById(id);
        const updateUser = {};
        if (userName) {
            updateUser.userName = userName;
        }
        if (phoneNumber) {
            updateUser.phoneNumber = phoneNumber;
        }
        if (product) {
            updateUser.product = product;
        }
        if (amount) {
            updateUser.amount = amount;

        }


        const updatedUser = await users.findByIdAndUpdate(id, updateUser, { new: true, runValidator: true })
        return res.status(201).json({ success: true, message: "users order details updated" })
    }
    catch (err) {
        return res.status(400).json({ success: false, message: err.message })
    }
}







