'use strict';

import mongoose, { Schema } from 'mongoose';
import shared from './../../../config/environment/shared';
import TailoredCourse from './../tailoredCourses/tailoredCourse.model';
import AbstractCourse from '../abstractCourses/abstractCourse.model';
import TailoredAssignment from '../tailoredCourses/tailoredAssignment.model';
import Submission from '../submission/submission.model';

module.exports = function overachievingStudents(req) {
  return TailoredCourse.find({
    abstractCourseId: mongoose.Types.ObjectId(req.params.id)
  }).then(function(tailoredCourses) {
    var assignmentsPromise = [];
    var assignmentsOutput = {};

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
      //keep track of the number of students who've passed/failed
      var numExcel = 0;

      for (var student in students) {
        //prune array based on teacher's threshold

        var percent =
          (students[student].totalPass /
            (students[student].totalPass + students[student].totalFail)) *
          100;
        // check if students are scoring above the teachers threshold
        if (percent >= req.user.preferences.excellingThreshold) {
          numExcel++;
          output.push({
            studentId: student,
            percentage: percent
          });
        }
      }
      return Promise.resolve({
        description: 'returns the excelling students in a course',
        students: output,
        value: {
          numExcel
        }
      });
    });
  });
};
