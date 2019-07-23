'use strict';

import mongoose, { Schema } from 'mongoose';
import shared from './../../../config/environment/shared';
import TailoredCourse from './../tailoredCourses/tailoredCourse.model';
import AbstractCourse from '../abstractCourses/abstractCourse.model';
import TailoredAssignment from '../tailoredCourses/tailoredAssignment.model';
import Submission from '../submission/submission.model';

//Our goal is to find the 10 most difficult problems in an abstract course.
//A teacher might want to know which problems have the highest fail rates, so they can adjust their course
//as necessary or decide if a particular topic needs special focus

module.exports = function problemSetMetricsCalculator(req) {
  return AbstractCourse.find({
    _id: mongoose.Types.ObjectId(req.params.id)
  }).then(function(course) {
    var o = {};
    o.scope = {
      abstractAssignments: course[0].assignments
    };
    o.map = function() {
      var inCourse = false;
      for (var i = 0; i < abstractAssignments.length; i++) {
        if (this.AbstractAssignmentId.valueOf() == abstractAssignments[i]) {
          inCourse = true;
        }
      }
      if (inCourse) {
        if (this.problems) {
          //For each student, we go through the problems they have attempted.
          //For every problem, we keep track of its id, and whether the student got it correct or not
          //During the finalize phase, we will use the problem ID to sum up all the times a problem was correct vs incorrect.
          this.problems.forEach(function(problem) {
            var correct = 0; // If a problem is correct, we mark this as 1 and wrong as 0
            var wrong = 0; // If a problem is wrong, we mark this as 1 and correct as 0

            //If a student has a attempted to answer a problem
            if (problem.attempts.length > 0) {
              //check if their last answer was correct
              if (problem.attempts[problem.attempts.length - 1].correct) {
                correct = 1;
                wrong = 0;
              } else {
                correct = 0;
                wrong = 1;
              }
            }
            //For each problem, emit a wrong/correct counter that'll be summed up in reduce/finalize phase
            emit(problem.problem.problemId, { correct: correct, wrong: wrong });
          });
        }
      }
    };

    // The reduce can get called in two ways
    // NOTE: This function will only be invoked if there is more than one instance with the same key
    //i.e, it will only be called if a problem with a particular id (the key) has been attempted more than once
    //Reduce sums up the number of times a particular problem was answered correctly + incorrectly
    o.reduce = function(k, vals) {
      var numCorrectAttempts = 0;
      var numWrongAttempts = 0;
      vals.forEach(function(val) {
        if (val.correct == 1) {
          numCorrectAttempts++;
        } else if (val.wrong == 1) {
          numWrongAttempts++;
        }
      });

      return {
        correct: numCorrectAttempts,
        wrong: numWrongAttempts
      };
    };

    //finalize returns the percentage of students who got this particular problem wrong.
    o.finalize = function(key, reducedValue) {
      //total represents the number of times a particular problem has been attempted
      var total = reducedValue.correct + reducedValue.wrong;
      var percentWrong = 0;

      //We are interested in the failure rate of the problem.

      // adding a default value incase no problems have been attempted at all i.e total = 0
      if (total != 0) {
        percentWrong = +((reducedValue.wrong / total) * 100).toFixed(2);
      }

      //we return the number of attempts which could be used as a tie-breaker incase 2 problems
      // have the same percentage-failure rate.
      return {
        numAttempts: total,
        percentWrong
      };
    };

    return TailoredAssignment.mapReduce(o).then(function(results) {
      return results;
    });
  });
};
