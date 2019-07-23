'use strict';

import mongoose, { Schema } from 'mongoose';
import shared from './../../../config/environment/shared';
import TailoredCourse from './../tailoredCourses/tailoredCourse.model';
import AbstractCourse from '../abstractCourses/abstractCourse.model';
import TailoredAssignment from '../tailoredCourses/tailoredAssignment.model';

// shouldn't be called failingStudents but courseCompletion
module.exports = function courseCompletion(req) {
  return AbstractCourse.find({
    _id: mongoose.Types.ObjectId(req.params.id)
  }).then(function(course) {
    var o = {};
    o.scope = {
      target: req.params.id,
      abstractAssignments: course[0].assignments
    };
    o.map = function() {
      var numCompleted = 0;
      var numNotCompleted = 0;
      var inCourse = false;
      for (var i = 0; i < abstractAssignments.length; i++) {
        if (this.AbstractAssignmentId.valueOf() == abstractAssignments[i]) {
          inCourse = true;
        }
      }

      //Completion means the student made at least one attempt at a problem
      if (inCourse) {
        if (this.problems) {
          this.problems.forEach(function(problem) {
            if (problem.attempts && problem.attempts.length > 0) {
              ++numCompleted;
            } else {
              ++numNotCompleted;
            }
          });
        }
        emit(target, { numCompleted, numNotCompleted });
      }
    };

    // The reduce can get called in two ways
    // NOTE: This function will only be invoked if there are
    // more than one assignment for a given course
    o.reduce = function(k, vals) {
      var totalCompleted = 0;
      var totalNotCompleted = 0;
      vals.forEach(function(val) {
        totalCompleted += val.numCompleted;
        totalNotCompleted += val.numNotCompleted;
      });

      return {
        numCompleted: totalCompleted,
        numNotCompleted: totalNotCompleted
      };
    };

    //add o.finalize() which takes in an object and
    o.finalize = function(key, reducedValue) {
      // Calculate overall completion rates
      var percentage =
        (reducedValue.numCompleted /
          (reducedValue.numCompleted + reducedValue.numNotCompleted)) *
        100;
      return {
        percentage: percentage,
        totalCompleted: reducedValue.numCompleted,
        totalNotCompleted: reducedValue.numNotCompleted
      };
    };

    return TailoredAssignment.mapReduce(o).then(function(results) {
      return results;
    });
  });
};
