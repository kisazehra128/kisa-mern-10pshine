const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are all required' });
    }

    // don't let someone sign up twice with the same email
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'that email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({ name, email, hashedPassword });

    res.status(201).json({
      message: 'user registered',
      user: newUser
    });

  } catch (err) {
    console.error('register failed:', err.message);
    res.status(500).json({ message: 'something went wrong, try again' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password required' });
    }

    const user = await userModel.findByEmail(email);

    // keeping this vague on purpose, don't want to tell people
    // whether it was the email or the password that was wrong
    if (!user) {
      return res.status(401).json({ message: 'invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'logged in',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error('login failed:', err.message);
    res.status(500).json({ message: 'something went wrong, try again' });
  }
}

module.exports = { register, login };