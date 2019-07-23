'use strict';
import config from '../config/environment';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import compose from 'composable-middleware';
import User from '../api/users/user.model';
import AbstractCourse from '../api/courses/abstractCourses/abstractCourse.model';

var validateJwt = expressJwt({
  secret: config.secrets.session
});

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
export function isAuthenticated() {
  return (
    compose()
      // Validate jwt
      .use(function(req, res, next) {
        // allow access_token to be passed through query parameter as well
        if (req.query && req.query.hasOwnProperty('access_token')) {
          req.headers.authorization = `Bearer ${req.query.access_token}`;
        }
        // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
        if (req.query && typeof req.headers.authorization === 'undefined') {
          req.headers.authorization = `Bearer ${req.cookies.token}`;
        }
        validateJwt(req, res, next);
      })
      // Attach user to request
      .use(function(req, res, next) {
        return User.findById(req.user._id)
          .exec()
          .then(user => {
            if (!user) {
              return res.status(401).end();
            }
            req.user = user;
            req.role = user.role;
            next();
            //This block needs a return value or bluebird complaints of a runaway promisse
            //since we are attaching the user to the request, it makes sense returning the request
            //returning - return next() - or just next() - does not fix the runaway promisse issue
            return req;
          })
          .catch(err => next(err));
      })
  );
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
export function hasRole(roleRequired) {
  if (!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (
        config.userRoles.indexOf(req.user.role) >=
        config.userRoles.indexOf(roleRequired)
      ) {
        return next();
      } else {
        return res.status(403).send('Forbidden');
      }
    });
}

/**
 * Only allow permision to defined role
 * specifically teacher or higher
 */
export function hasPermission(roleRequired) {
  if (!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      //grab the course in question
      return AbstractCourse.findById(req.params.id)
        .exec()
        .then(course => {
          //if the course actually exists
          if (course) {
            //if the role of the current user is bigger than the role required
            //or the current user is the teacher assigned to the course, success
            //otherwise forbid access
            if (
              config.userRoles.indexOf(req.user.role) >
                config.userRoles.indexOf(roleRequired) ||
              course.teacherId.equals(req.user._id)
            ) {
              next();
              return req;
            } else {
              return res.status(403).send('Forbidden');
            }
          } else {
            //if the course does not exists or was just deleted
            return res.status(404).end();
          }
        })
        .catch(err => next(err));
    });
}

export function hasPermissionToEnroll(roleRequired) {
  if (!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      //grab the course in question
      return AbstractCourse.findById(req.params.id)
        .exec()
        .then(course => {
          //if the course actually exists
          if (course) {
            //if the role of the current user is bigger than the role required
            //or the current user is the teacher assigned to the course, success
            //otherwise forbid access
            if (
              config.userRoles.indexOf(req.user.role) >
                config.userRoles.indexOf(roleRequired) ||
              course.teacherId.equals(req.user._id) ||
              req.params.studentId == req.user._id
            ) {
              next();
              return req;
            } else {
              return res.status(403).send('Forbidden');
            }
          } else {
            //if the course does not exists or was just deleted
            return res.status(404).end();
          }
        })
        .catch(err => next(err));
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
export function signToken(id, role) {
  return jwt.sign({ _id: id, role }, config.secrets.session, {
    expiresIn: 60 * 60 * 5
  });
}

/**
 * Set token cookie directly for oAuth strategies
 */
export function setTokenCookie(req, res) {
  if (!req.user) {
    return res
      .status(404)
      .send("It looks like you aren't logged in, please try again.");
  }
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', token);
  res.redirect('/');
}
