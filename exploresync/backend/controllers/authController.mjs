// 2FA implmentation was inspired by this tutorial: https://www.youtube.com/watch?v=fBWwx45_nIo

import User from '../models/User.mjs';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

export const getAuthenticatedUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.username });

    if (!user) {
      return res.status(404).end('User not found');
    }

    const user2FAEnabled = user.secret ? true : false;

    return res.json({ username: req.session.username, user2FAEnabled: user2FAEnabled });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export const register = async (req, res) => {
  const { username, password } = req.body;
  const id = username.toLowerCase();

  try {
    const existingUser = await User.findOne({ _id: id });

    if (existingUser) {
      return res.status(409).json(`Username ${id} already exists`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const newUser = new User({
      _id: id,
      hash: hashed,
    });

    await newUser.save();
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const login = async (req, res) => {
  const { username, password, token } = req.body;
  const id = username.toLowerCase();

  try {
    const user = await User.findOne({ _id: id });

    if (!user) {
      return res.status(401).end('Incorrect Username or Password');
    }

    const result = await bcrypt.compare(password, user.hash);

    if (!result) {
      return res.status(401).end('Incorrect Username or Password');
    }

    // if 2FA is enabled
    if (user.secret) {

      // if token is not given then request it
      if (!token) {
        return res.json({ require2FA: true });
      }

      const valid = authenticator.check(token, user.secret);

      if (!valid) {
        return res.status(401).end('Invalid token. Please try again.');
      }
    }

    // start a session
    req.session.username = id;

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const enable2FA = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.username });

    if (!user) {
      return res.status(404).end('User not found');
    }

    if (user.secret) {
      return res.status(404).end('2FA is already enabled');
    }

    const secret = authenticator.generateSecret();
    
    user.tempSecret = secret;
    await user.save();

    const uri = authenticator.keyuri(req.session.username, 'ExploreSync', secret);
    const qrCode = await qrcode.toDataURL(uri);

    res.send({ success: true, qrCode });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export const verify2FA = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ _id: req.session.username });

    if (!user) {
      return res.status(404).end('User not found');
    }

    if (!user.tempSecret) {
      return res.status(404).end('Temp secret not found');
    }

    const valid = authenticator.check(token, user.tempSecret);

    if (!valid) {
      return res.status(401).end('Access denied');
    }

    user.secret = user.tempSecret;
    user.tempSecret = null;
    await user.save();

    res.send({ success: true });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export const disable2FA = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.username });

    if (!user) {
      return res.status(404).end('User not found');
    }

    user.secret = null;
    await user.save();

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export const logout = async (req, res) => {
  req.session.destroy();
  return res.json({ success: true });
}