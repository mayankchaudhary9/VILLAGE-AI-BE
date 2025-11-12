import { sql, pool, poolConnect } from "../../config/db.js";

class UserDao {
  // Check if user exists by phone
  async findUserByPhone(phone) {
    await poolConnect;
    const request = pool.request();
    request.input("phone", sql.NVarChar, phone);
    const user = await request.query(
      "SELECT * FROM villageAIUsers WHERE phone = @phone"
    );
    return user.recordset[0];
  }

  // Insert new user
  async createUser({ name, aadhaar, phone, pincode, city, state, password, confirmPassword }) {
    await poolConnect;
    const request = pool.request();
    request.input("name", sql.NVarChar, name);
    request.input("aadhaar", sql.NVarChar, aadhaar || null);
    request.input("phone", sql.NVarChar, phone);
    request.input("pincode", sql.NVarChar, pincode);
    request.input("city", sql.NVarChar, city);
    request.input("state", sql.NVarChar, state);
    request.input("password", sql.NVarChar, password);
    request.input("confirmPassword", sql.NVarChar, confirmPassword);
    await request.query(`
      INSERT INTO villageAIUsers (name, aadhaar, phone, pincode, city, state, password, confirmPassword)
      VALUES (@name, @aadhaar, @phone, @pincode, @city, @state, @password, @confirmPassword)
    `);
  }

  // Find user for login by phone
  async findUserForLogin( phone ) {
    await poolConnect;
    const request = pool.request();
    if (phone) {
      request.input("input", sql.NVarChar, phone);
      const result = await request.query("SELECT * FROM villageAIUsers WHERE phone = @input");
      return result.recordset[0];
    }
  }

   async blacklistToken(token) {
    await pool.request()
      .input("token", sql.VarChar, token)
      .query("INSERT INTO BlacklistedTokens (token, createdAt) VALUES (@token, GETDATE())");
  }

  async isTokenBlacklisted(token) {
    const result = await pool.request()
      .input("token", sql.VarChar, token)
      .query("SELECT 1 FROM BlacklistedTokens WHERE token = @token");
    return result.recordset.length > 0;
  }

}

export default new UserDao();
