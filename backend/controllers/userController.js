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
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone || '',
          address: user.address || ''
        },
        token: generateToken(user._id, user.email, user.role, user.name)
      });
    }
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  } else {
    const user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.password === password) {
      return res.json({
        success: true,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone || '',
          address: user.address || ''
        },
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
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone || '',
        address: newUser.address || ''
      },
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
      phone: '',
      address: '',
      createdAt: new Date().toISOString()
    };
    memoryStore.users.push(newUser);
    return res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: '',
        address: ''
      },
      token: generateToken(newUser._id, newUser.email, newUser.role, newUser.name)
    });
  }
};

const getUserProfile = async (req, res) => {
  const userId = req.user.id;
  if (isConnected()) {
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        createdAt: user.createdAt
      }
    });
  } else {
    const user = memoryStore.users.find(u => (u._id || u.id) === userId || u.email.toLowerCase() === req.user.email.toLowerCase());
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        createdAt: user.createdAt
      }
    });
  }
};

const updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email, currentPassword, newPassword, phone, address } = req.body;

  try {
    if (isConnected()) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // If user wants to change password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ success: false, message: 'Current password is required to change password' });
        }
        if (user.password !== currentPassword) {
          return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
        if (newPassword.length < 6) {
          return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }
        user.password = newPassword;
      }

      // Check email uniqueness if changing email
      if (email && email.toLowerCase() !== user.email.toLowerCase()) {
        const emailExists = await User.findOne({ email: email.toLowerCase() });
        if (emailExists && emailExists._id.toString() !== user._id.toString()) {
          return res.status(400).json({ success: false, message: 'Email address is already in use' });
        }
        user.email = email.toLowerCase();
      }

      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;

      await user.save();

      const updatedUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || ''
      };

      const token = generateToken(user._id, user.email, user.role, user.name);

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
        token
      });
    } else {
      // In-Memory Mode
      const userIndex = memoryStore.users.findIndex(
        u => (u._id || u.id) === userId || u.email.toLowerCase() === req.user.email.toLowerCase()
      );
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const user = memoryStore.users[userIndex];

      // Password change verification
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ success: false, message: 'Current password is required to change password' });
        }
        if (user.password !== currentPassword) {
          return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
        if (newPassword.length < 6) {
          return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }
        user.password = newPassword;
      }

      // Check email uniqueness if changing email
      if (email && email.toLowerCase() !== user.email.toLowerCase()) {
        const emailExists = memoryStore.users.find(
          u => u.email.toLowerCase() === email.toLowerCase() && (u._id || u.id) !== userId
        );
        if (emailExists) {
          return res.status(400).json({ success: false, message: 'Email address is already in use' });
        }
        user.email = email.toLowerCase();
      }

      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;

      memoryStore.users[userIndex] = user;

      const updatedUser = {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || ''
      };

      const token = generateToken(updatedUser.id, updatedUser.email, updatedUser.role, updatedUser.name);

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
        token
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ success: false, message: 'Internal server error updating profile' });
  }
};

module.exports = { loginUser, registerUser, getUserProfile, updateUserProfile };
