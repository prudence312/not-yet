'use strict';

import AbstractCourse from '../abstractCourses/abstractCourse.model';
import User from '../../users/user.model';
import Problem from '../problems/problem.model';
import failingStudentsCalculator from './statistics.failingStudents';
import studentDistributionCalculator from './statistics.studentDistribution';
import courseCompletionCalculator from './statistics.courseCompletion';
import overachievingStudentsCalculator from './statistics.overachievingStudents';
import problemSetMetricsCalculator from './statistics.problemSetMetrics';
import * as categoryMetricsCalculator from './statistics.categoryMetrics';
import dataCorrelationsCalculator from './statistics.dataCorrelations';

import mongoose, { Schema } from 'mongoose';
let logger = require('./../../../config/bunyan');

export function myCourses(req, res) {
  return (
    AbstractCourse.find({
      teacherId: mongoose.Types.ObjectId(req.user.id)
    })
      .populate('assignments')
      //When adding students, only add their name , email (for the gravatar) and their ID
      .populate({
        path: 'students',
        select: 'name email _id bio'
      })
      .exec()
      .then(function(results) {
        return res.status(200).json(results);
      })
  );
}

export function getStats(req, res) {
  var courseId = req.params.id;

  var calculations = [];
  var calculatedStatisticsObject = {};
  var finalObject = {};

  calculations.push(courseCompletionCalculator(req));
  calculations.push(failingStudentsCalculator(req));
  calculations.push(studentDistributionCalculator(req));
  calculations.push(overachievingStudentsCalculator(req));
  calculations.push(problemSetMetricsCalculator(req));
  calculations.push(
    categoryMetricsCalculator.teacherCategoryMetricsCalculator(req.user._id)
  );
  calculations.push(dataCorrelationsCalculator(req));

  Promise.all(calculations)
    .then(function(results) {
      calculatedStatisticsObject = {
        courseId: courseId,
        courseCompletionPercentage: results[0],
        failingStudents: results[1],
        studentDistribution: results[2],
        overachievingStudents: results[3],
        problemSetMetrics: results[4],
        categoryMetrics: results[5],
        dataCorrelations: results[6]
      };
      //Step 1: find the abstract course name
      return AbstractCourse.findById(courseId).exec();
    })
    .then(abstractCourse => {
      //Step 2: Manipulations to the final object to add "meaningful data" like student names, problem descriptions
      finalObject.courseName = abstractCourse.name;
      finalObject.courseId = courseId;
      finalObject.courseCompletionPercentage =
        calculatedStatisticsObject.courseCompletionPercentage;
      delete finalObject.courseCompletionPercentage[0]._id;
      finalObject.failingStudents = calculatedStatisticsObject.failingStudents;
      finalObject.studentDistribution =
        calculatedStatisticsObject.studentDistribution;
      finalObject.overachievingStudents =
        calculatedStatisticsObject.overachievingStudents;
      finalObject.problemSetMetrics =
        calculatedStatisticsObject.problemSetMetrics;
      finalObject.categoryMetrics = calculatedStatisticsObject.categoryMetrics;
      finalObject.dataCorrelations =
        calculatedStatisticsObject.dataCorrelations;

      let promises = [];

      //Adding the names to the failing students array
      finalObject.failingStudents.students.forEach(student => {
        promises.push(
          User.findById(student.studentId)
            .exec()
            .then(user => {
              student.studentName = user.name;
            })
        );
      });

      //Adding the names to the overachieving students array
      finalObject.overachievingStudents.students.forEach(student => {
        promises.push(
          User.findById(student.studentId)
            .exec()
            .then(user => {
              student.studentName = user.name;
            })
        );
      });

      //Adding the problem description to the problem set metrics
      finalObject.problemSetMetrics.forEach(thisProblem => {
        promises.push(
          Problem.findOne({
            'problem.problemId': thisProblem._id
          })
            .exec()
            .then(foundProblem => {
              thisProblem.description = foundProblem.problem.description;
            })
        );
      });

      return Promise.all(promises);
    })
    .then(() => {
      return res.json(finalObject).status(200);
    })
    .catch(err => {
      //otherwise return a not found status
      logger.error({ error: err });
      return res
        .status(404)
        .send(err)
        .end();
    });
}
