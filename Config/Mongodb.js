import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "customer",
        default: null
    },
    userName: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: false
    },
    product: [{
        type: mongoose.Schema.Types.String,
        required: true
    }],
    amount: {
        type: mongoose.Schema.Types.Number,
        required: true
    },




},

    {
        timestamps: true
    }

)
const adminSchema = new mongoose.Schema({
    email: {
        type: mongoose.Schema.Types.String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    branch: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    otp: {
        type: mongoose.Schema.Types.String
    },
    expiresAt: {
        type: mongoose.Schema.Types.Date
    }

},

    {
        timestamps: true
    })

const customerSchema = new mongoose.Schema({
    email: {
        type: mongoose.Schema.Types.String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: mongoose.Schema.Types.String,
        required: true,

    },
    name: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    phoneNumber: {
        type: mongoose.Schema.Types.String,
        required: true,
        unique: true
    },
    otp: {
        type: mongoose.Schema.Types.String
    },
    expiresAt: {
        type: mongoose.Schema.Types.Date
    }

},

    {
        timestamps: true
    })

const productSchema = new mongoose.Schema({
    productName: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    productRate: {
        type: mongoose.Schema.Types.Number,
        required: true,
    },
    isAvailable: {
        type: mongoose.Schema.Types.Boolean,
        required: true
    }
},

    {
        timestamps: true
    })


export const users = mongoose.models.userSchema || mongoose.model("users", userSchema);
export const admin = mongoose.models.adminschema || mongoose.model("admin", adminSchema);
export const customer = mongoose.models.customerSchema || mongoose.model("customer", customerSchema);
export const product = mongoose.models.productSchema || mongoose.model("product", productSchema);
