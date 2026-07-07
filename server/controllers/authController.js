const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const signToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'nudge_secret_fallback';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({
      email: email.toLowerCase(),
      passwordHash,
      tonePreference: 'encouraging'
    });

    await user.save();

    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        tonePreference: user.tonePreference
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        tonePreference: user.tonePreference
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

exports.updateSettings = async (req, res) => {
  const { tonePreference } = req.body;
  if (!['encouraging', 'funny', 'tough-love'].includes(tonePreference)) {
    return res.status(400).json({ message: 'Invalid tone preference. Choose encouraging, funny, or tough-love.' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { tonePreference },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating settings' });
  }
};
