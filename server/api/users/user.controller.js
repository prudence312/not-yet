'use strict';

import User from './user.model';
import TailoredCourse from '../courses/tailoredCourses/tailoredCourse.model';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
let logger = require('./../../config/bunyan');

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    return res.status(statusCode).send(err);
  };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  return User.find({}, '-salt -password')
    .exec()
    .then(users => res.status(200).json(users))
    .catch(handleError(res));
}

export function getUsersCourses(req, res) {
  TailoredCourse.find({ studentId: req.params.id }, '-studentId')
    .populate({ path: 'abstractCourseId', select: 'name description _id' })
    .exec()
    .then(tc => res.json(tc).status(200))
    .catch(() => res.status(404));
}

/**
 * Creates a new user
 */
export function create(req, res) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser
    .save()
    .then(function(user) {
      var token = jwt.sign(
        { _id: user._id, role: user.role },
        config.secrets.session,
        {
          expiresIn: 60 * 60 * 5
        }
      );
      return res.json({ token });
    })
    .catch(validationError(res));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  var userId = req.params.id;
  return User.findById(userId)
    .exec()
    .then(user => {
      if (!user) {
        res.status(404).end();
      }
      res.json(user.profile);
    })
    .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id)
    .exec()
    .then(function() {
      return res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  return User.findById(userId)
    .exec()
    .then(user => {
      if (user.authenticate(oldPass)) {
        user.password = newPass;
        return user
          .save()
          .then(() => {
            res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}

/**
 * Update a users information
 */
export function update(req, res) {
  var userId = req.user._id;
  User.findById(userId)
    .exec()
    .then(existingUser => {
      if (existingUser) {
        //we only want to update a field if a user has filled in that field
        //i.e Sometimes, users don't want to update all their fieds. They might only want to
        //change one or two things. No fields are required and if they aren't modified,
        //they'll just remain the same as before.
        //We also only want to be able to update certain fields (i.e certain fields like role + student ID should not be modifiable)
        if (req.body.name) {
          existingUser.name = req.body.name;
        }
        if (req.body.email) {
          existingUser.email = req.body.email;
        }
        if (req.body.bio && req.body.bio.age) {
          existingUser.bio.age = req.body.bio.age;
        }
        if (req.body.bio && req.body.bio.school) {
          existingUser.bio.school = req.body.bio.school;
        }
        if (req.body.preferences && req.body.preferences.failingThreshold) {
          existingUser.preferences.failingThreshold =
            req.body.preferences.failingThreshold;
        }
        if (req.body.preferences && req.body.preferences.excellingThreshold) {
          existingUser.preferences.excellingThreshold =
            req.body.preferences.excellingThreshold;
        }
        return existingUser.increment().save();
      } else {
        return Promise.reject(new Error('User not found'));
      }
    })
    .then(() => {
      logger.debug(`Update of ${userId} successful`);
      return res.status(204).end();
    })
    .catch(err => {
      logger.error(err);
      if (err.message.toLowerCase().includes('not found')) {
        validationError(res, 404);
      } else {
        validationError(res, 400);
      }
    });
}
/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user._id;

  return User.findOne({ _id: userId }, '-salt -password')
    .exec()
    .then(user => {
      // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end();
      }
      return res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}
