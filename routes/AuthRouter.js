const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../db/userModel");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
// dki
router.post("/user", async (req, res) => {
  const {
    login_name,
    password,
    first_name,
    last_name,
    location,
    description,
    occupation,
  } = req.body;

  if (!login_name || !password || !first_name || !last_name) {
    return res
      .status(400)
      .send(
        "Thiếu thông tin bắt buộc (login_name, password, first_name, last_name)"
      );
  }

  try {
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return res.status(400).send("Tên đăng nhập đã tồn tại!");
    }

    const newUser = await User.create({
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation,
    });

    res.status(200).json({ _id: newUser._id, login_name: newUser.login_name });
  } catch (err) {
    res.status(400).send("Lỗi khi đăng ký: " + err.message);
  }
});
// dn
router.post("/admin/login", async (req, res) => {
  const { login_name, password } = req.body;

  try {
    const user = await User.findOne({ login_name });

    if (!user || user.password !== password) {
      return res.status(400).send("Tên đăng nhập hoặc mật khẩu không đúng");
    }

    const token = jwt.sign(
      { userId: user._id, login_name: user.login_name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      token: token,
    });
  } catch (err) {
    res.status(400).send("Lỗi đăng nhập: " + err.message);
  }
});
// logout regis
router.post("/admin/logout", (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).send("Không có người dùng nào đang đăng nhập");
  }
  res.status(200).send("Đăng xuất thành công");
});

module.exports = router;
