const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
  const { email, password, name, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, name, role });
    console.log("Registered a new user with data:", req.body); 
    res.json({ success: true, data: { message: 'User registered', user } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1: Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    // Step 2: Find user by email
    const user = await User.findOne({ email });
    // Step 3: Handle unregistered user
    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found with this email' });
    }
    // Step 4: Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, error: 'Incorrect password' });
    }
    // Step 5: Generate token and respond
    const token = generateToken(user);
    console.log("User logged in successfully:", user.email);
    return res.status(200).json({ success: true, data: { token, user } });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Server error. Please try again later.' });
  }
};


