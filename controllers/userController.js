import User from "../models/User.js";

export const getProfile = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { name, email, password, gender } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (gender) user.gender = gender;
    if (req.file) user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export default { getProfile, updateProfile };
