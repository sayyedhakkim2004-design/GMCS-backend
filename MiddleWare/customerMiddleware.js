import jwt from "jsonwebtoken";

export const verifyCustomerToken = async (req, res, next) => {
    try {

        const token = req.cookies?.CustomerResetToken;
        if (!token) {
            return res.status(400).json({ success: false, message: "Token Not Found" });
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (decode.purpose !== "reset") {
            return res.status(400).json({ success: false, message: "Reset Access Not Valid" })
        }
        req.email = decode.email;
        next();

    }
    catch (err) {
        return res.status(400).json({ success: false, message: err.message })
    }
}

export const isGuestUser = async (req, res, next) => {
  const token = req.cookies?.customerId;

  if (!token) {
    req.user = { userId: null ,role:"Guest"}; // ✅ object
    return next();
  }

  try {
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = {
      userId: verifyToken.id || null, // ✅ always object
      role:verifyToken.role
    };
    

  } catch (err) {
    req.user = { userId: null }; // ✅ fallback
  }

  next();
};