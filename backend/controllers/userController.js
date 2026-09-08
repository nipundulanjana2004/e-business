const jwt = require('jsonwebtoken');
const { isConnected, memoryStore } = require('../config/db');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const generateToken = (id, email, role, name) => {
  return jwt.sign({ id, email, role, name }, JWT_SECRET, { expiresIn: '30d' });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
  if (isConnected()) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user && user.password === password) {
      return res.json({
        success: true,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token: generateToken(user._id, user.email, user.role, user.name)
      });
    }
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  } else {
    const user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.password === password) {
      return res.json({
        success: true,
        user: { id: user._id || user.id, name: user.name, email: user.email, role: user.role },
        token: generateToken(user._id || user.id, user.email, user.role, user.name)
      });
    }
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Please fill in all fields' });
  if (isConnected()) {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ success: false, message: 'Email is already registered' });
    const newUser = await User.create({ name, email: email.toLowerCase(), password, role: 'customer' });
    return res.status(201).json({
      success: true,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
      token: generateToken(newUser._id, newUser.email, newUser.role, newUser.name)
    });
  } else {
    const exists = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return res.status(400).json({ success: false, message: 'Email is already registered' });
    const newUser = {
      _id: 'usr_' + Date.now(),
      id: 'usr_' + Date.now(),
      name,
      email: email.toLowerCase(),
      password,
      role: 'customer',
      createdAt: new Date().toISOString()
    };
    memoryStore.users.push(newUser);
    return res.status(201).json({
      success: true,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
      token: generateToken(newUser._id, newUser.email, newUser.role, newUser.name)
    });
  }
};

const getUserProfile = async (req, res) => {
  return res.json({ success: true, user: req.user });
};

module.exports = { loginUser, registerUser, getUserProfile };
