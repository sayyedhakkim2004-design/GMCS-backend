import jwt from "jsonwebtoken"


export const verifyToken = (req, resizeBy, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return resizeBy.status(400).json({ success: false, message: "your not logged in" })
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (decode.role !== "admin") {
            return resizeBy.status(400).json({ success: false, message: "Admin Access Only" })
        }
        next();
    }
    catch (err) {
        console.log(err);
        return resizeBy.status(400).json({ success: false, err: err.message })
    }

}

export const verifyResetToken = (req, res, next) => {
    try {
        const token = req.cookies?.resetToken;
        if (!token) {
            return res.status(400).json({ success: false, message: "token not found" });
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (decode.purpose !== "reset") {
            return res.status(400).json({ success: false, message: "invalid token" });
        }
        req.email = decode.email;
        next();
    }
    catch (err) {
        return res.status(400).json({ success: false, err: err.message });
    }
}