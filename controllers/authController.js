import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, gender } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const userData = { name, email, password, gender };
    if (req.file) userData.profilePicture = `/uploads/${req.file.filename}`;
    const user = await User.create(userData);
    const token = generateToken(user._id);
    res.cookie("token", token, { httpOnly: true });
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      res.cookie("token", token, { httpOnly: true });
      return res.json({ token, user });
    }
    return res.status(401).json({ message: "Invalid credentials" });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

export default { register, login, logout };
