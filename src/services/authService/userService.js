import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userDao from "../../dao/authDao/userDao.js";

class UserService {
  async registerUser({ name, aadhaar, phone, pincode, city, state, password, confirmPassword }) {
    const existing = await userDao.findUserByPhone(phone);
    if (existing) {
      throw new Error("Phone number already registered");
    }

    const hashed = await bcrypt.hash(password, 10);
    const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 10);
    await userDao.createUser({ name, aadhaar, phone, pincode, city, state, password: hashed, confirmPassword: hashedConfirmPassword});

    return { message: "User registered successfully" };
  }

  async loginUser({ phone, password }) {
    const user = await userDao.findUserForLogin(phone);
    if (!user) throw new Error("User not registered");

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) throw new Error("Incorrect password");

    const token = jwt.sign(
      { id: user.id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
    };
  }

  async logoutUser(token) {
    await userDao.blacklistToken(token);
    return { message: "Logout successful" };
  }
}

export default new UserService();
