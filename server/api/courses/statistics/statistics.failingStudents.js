'use strict';

import mongoose, { Schema } from 'mongoose';
import shared from './../../../config/environment/shared';
import TailoredCourse from './../tailoredCourses/tailoredCourse.model';
import AbstractCourse from '../abstractCourses/abstractCourse.model';
import TailoredAssignment from '../tailoredCourses/tailoredAssignment.model';
import Submission from '../submission/submission.model';

module.exports = function failingStudents(req) {
  return TailoredCourse.find({
    abstractCourseId: mongoose.Types.ObjectId(req.params.id)
  }).then(function(tailoredCourses) {
    var assignmentsPromise = [];
    var assignmentsOutput = {};

    var i = 0;
    tailoredCourses.forEach(function(course) {
      course.assignments.forEach(function(assignment) {
        assignmentsOutput[assignment.valueOf()] = {
          studentId: course.studentId,
          totalFail: 0,
          totalPass: 0
        };
        assignmentsPromise.push(TailoredAssignment.find({ _id: assignment }));
      });
    });

    return Promise.all(assignmentsPromise).then(function(assignments) {
      assignments.forEach(function(assignment) {
        assignment[0].problems.forEach(function(problem) {
          if (problem.attempts.length > 0) {
            if (problem.attempts[problem.attempts.length - 1].correct) {
              assignmentsOutput[assignment[0]._id.valueOf()].totalPass++;
            } else {
              assignmentsOutput[assignment[0]._id.valueOf()].totalFail++;
            }
          }
        });
      });

      var students = {};
      for (var assignmentOut in assignmentsOutput) {
        if (!students[assignmentsOutput[assignmentOut].studentId]) {
          students[assignmentsOutput[assignmentOut].studentId] = {
            totalPass: assignmentsOutput[assignmentOut].totalPass,
            totalFail: assignmentsOutput[assignmentOut].totalFail
          };
        } else {
          students[assignmentsOutput[assignmentOut].studentId].totalPass +=
            assignmentsOutput[assignmentOut].totalPass;
          students[assignmentsOutput[assignmentOut].studentId].totalFail +=
            assignmentsOutput[assignmentOut].totalFail;
        }
      }
      var output = [];
      var numPass = 0;
      var numFail = 0;
      for (var student in students) {
        //prune array based on teacher's threshold
        var percent =
          (students[student].totalPass /
            (students[student].totalPass + students[student].totalFail)) *
          100;
        if (percent < req.user.preferences.failingThreshold) {
          numFail++;
          output.push({
            studentId: student,
            percentage: percent
          });
        } else {
          numPass++;
        }
      }

      return Promise.resolve({
        description: 'returns the failing students in a course',
        students: output,
        value: {
          numPass,
          numFail
        }
      });
    });
  });
};
