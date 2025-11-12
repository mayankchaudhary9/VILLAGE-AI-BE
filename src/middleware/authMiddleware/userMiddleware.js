import jwt from "jsonwebtoken";
import userDao from "../../dao/authDao/userDao.js"; 
import dotenv from "dotenv";
dotenv.config();

export async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        message: "token not provided",
        error: true,
        success: false,
      });
    }

    const token = authHeader.split(" ")[1];

    // Check if token is blacklisted
    const isBlacklisted = await userDao.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(403).json({
        message: "Token has been invalidated. Please login again.",
        error: true,
        success: false,
      });
    }

    // Verify token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    if(!decoded) {
      return res.status(401).json({
        message: "Unauthorized token",
        error: true,
        success: false,
      })
    }
    req.user = decoded; // attach user info to req for later use
    next();
  } catch (err) {
    return res.status(500).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}
