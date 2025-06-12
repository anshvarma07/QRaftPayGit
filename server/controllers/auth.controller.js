const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
  console.log("In auth.controller.js - register"); 
  const { email, password, name, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, name, role });
    res.json({ success: true, data: { message: 'User registered', user } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    const match = user && await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Invalid credentials');
    const token = generateToken(user);
    res.json({ success: true, data: { token, user } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
