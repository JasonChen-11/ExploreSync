import { body, validationResult } from 'express-validator';
import Group from '../models/Group.mjs';

export const userInfoValidation = [
  body('username').notEmpty().escape(),
  body('password').notEmpty().escape(),
];

export const handleBadRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const isAuthenticated = (req, res, next) => {
  if (!req.session.username) {
    return res.status(401).end('Access denied');
  }
  next();
};

export const isHost = async (req, res, next) => {
  const group_id = req.body.body ? req.body.group_id : req.params.groupId;
  let group = await Group.findOne({_id: group_id});

  if (group && group.host != req.session.username) {
    return res.status(401).end('User is not host');
  }
  next();
};