import userService from "../../services/authService/userService.js";

class UserController {
  async registerUser (req, res) {
    try {
      const { name, aadhaar, phone, pincode, city, state, password, confirmPassword } = req.body;
      if (!name || !phone || !password || !pincode || !confirmPassword ) {
        return res.status(400).json({
          message: "Please fill all the required field",
          error: true,
          success: false,
        });
      }
      await userService.registerUser({ name, aadhaar, phone, pincode, city, state, password, confirmPassword });

      return res.status(201).json({
        message: "Registration successful",
        error: false,
        success: true,
      });
    } catch (err) {
      return res.status(500).json({ 
        message: err.message || err,
        error: true,
        success: false,
      });
    }
  };

  async loginUser (req, res) {
    try {
      const { phone, password } = req.body;
      if (!phone || !password) {
        return res.status(400).json({
          message: "please provide phone and password!",
          error: true,
          success: false,
         });
      }
      const data = await userService.loginUser({ phone, password });
      return res.status(200).json({
        message: "Login successful",
        error: false,
        success: true,
        token: data.token,
        user: data.user
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message || err,
        error: true,
        sucess: false,
      });
    }
  };


  async logoutUser(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          message: "Token is found",
          error: true,
          success: false,
        });
      }

      const token = authHeader.split(" ")[1];
      await userService.logoutUser(token);

      return res.status(200).json({
        message: "Logout successful",
        error: false,
        success: true,
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message || err,
        error: true,
        success: false,
      });
    }
  }

}
export default new UserController();