'use strict';

import ProblemSession from './problemSession.model';
import config from '../../../config/environment';
let logger = require('../../../config/bunyan'); //path to my logger

//Create a new session
export function create(req, res) {
  let newSession = req.body;
  ProblemSession.create(newSession)
    .then(createdSession => {
      //res.status(201);
      return res.status(201).json(createdSession);
    })
    .catch(err => {
      logger.error(err);
      res.status(400);
      res.json(err);
    });
}

//Show all session events
export function index(req, res) {
  ProblemSession.find({})
    .exec()
    .then(function(sessions) {
      return res.status(200).json(sessions);
    })
    .catch(function(err) {
      res.status(500);
      res.send(err);
    });
}

//Find all session events using a particular session ID
export function show(req, res) {
  ProblemSession.findById(req.params.id)
    .exec()
    .then(function(session) {
      if (problem) {
        return res.status(200).json(session);
      } else {
        return res.status(204).end();
      }
    })
    .catch(function() {
      return res.status(404).end();
    });
}

//Find all session events for a given problem in a course
export function showSessionsForProblem(req, res) {
  return ProblemSession.find({
    problemId: mongoose.Types.ObjectId(req.params.problemid),
    abstractCourseId: mongoose.Types.ObjectId(req.params.abstractcourseid)
  })
    .exec()
    .then(function(results) {
      if (results) {
        return res.status(200).json(results);
      } else {
        return Promise.reject('problem Id not found');
      }
    })
    .catch(err => {
      logger.error(err);
      if (err.message.toLowerCase().includes('not found')) {
        res.status(404);
        res.json(err);
      } else {
        res.status(400);
        res.json(er);
      }
    });
}

//Find all session events for a particular student, for a particular problem
export function showSessionsForProblemAndStudent(req, res) {
  return ProblemSession.find({
    problemId: mongoose.Types.ObjectId(req.params.problemId),
    studentId: mongoose.Types.ObjectId(req.params.studentId)
  })
    .exec()
    .then(function(results) {
      if (results) {
        return res.status(200).json(results);
      } else {
        return Promise.reject('problem Id not found');
      }
    })
    .catch(err => {
      logger.error(err);
      if (err.message.toLowerCase().includes('not found')) {
        res.status(404);
        res.json(err);
      } else {
        res.status(400);
        res.json(er);
      }
    });
}
