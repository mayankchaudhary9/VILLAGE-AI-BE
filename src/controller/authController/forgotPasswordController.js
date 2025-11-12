import { pool, poolConnect } from "../../config/db.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

// Twilio setup
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);


class ForgotPasswordController {
  async sendOTP (req, res) {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({
        message: "Phone number required",
        error: true,
        success: false,
      });
    }

    
    await poolConnect;
    const result = await pool.request().query(`SELECT * FROM villageAIUsers WHERE phone='${phone}'`);
    if (result.recordset.length === 0){
      return res.status(404).json({
        message: "No user found with this phone number",
        error: true,
        success: false,
      });
    }
      
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min expiry

    await pool
      .request()
      .query(`INSERT INTO otp_requests (phone, otp, expires_at) VALUES ('${phone}', '${otp}', '${expiresAt.toISOString()}')`);

    // Send OTP via Twilio SMS
    await client.messages.create({
      body: `Your Village AI Awareness password reset OTP is ${otp}. It expires in 30 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phone}`,
    });

    res.status(201).json({
      message: "OTP sent successfully",
      error: false,
      success: true,
    });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

async verifyOTP (req, res) {
  try {
    const { phone, otp } = req.body;
    await poolConnect;

    const result = await pool
      .request()
      .query(`SELECT * FROM otp_requests WHERE phone='${phone}' AND otp='${otp}' AND is_used=0`);

    if (result.recordset.length === 0){
      return res.status(400).json({
        message: "Invalid OTP",
        error: true,
        success: false,
      });
    }

    const otpData = result.recordset[0];
    if (new Date(otpData.expires_at) < new Date()){
      return res.status(400).json({
        message: "OTP expired",
        error: true,
        success: false,
      });
    }
      
    await pool.request().query(`UPDATE otp_requests SET is_used=1 WHERE id=${otpData.id}`);

    res.status(201).json({
      message: "OTP verified successfully",
      error: false,
      success: true,
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
};

async resetPassword (req, res) {
  try {
    const { phone, newPassword } = req.body;
    if (!phone || !newPassword){
      return res.status(400).json({
        message: "Phone and new password required",
        error: true,
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await poolConnect;

    await pool
      .request()
      .query(`UPDATE villageAIUsers SET password='${hashedPassword}' WHERE phone='${phone}'`);

    res.status(201).json({
      message: "Password reset successfully",
      error: false,
      success: true,
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
};
}

export default new ForgotPasswordController;