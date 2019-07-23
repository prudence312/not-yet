'use strict';

import mongoose, { Schema } from 'mongoose';
import shared from './../../../config/environment/shared';
import TailoredCourse from './../tailoredCourses/tailoredCourse.model';
import AbstractCourse from '../abstractCourses/abstractCourse.model';
import TailoredAssignment from '../tailoredCourses/tailoredAssignment.model';
import Submission from '../submission/submission.model';

//Creates two functions.

//This One finds the most difficult categories across ALL the subjects in the system
//A teacher/researcher/administrator might want to know which categories are generally the hardest
//for students to solve

export function categoryMetricsCalculatorAllCourses() {
  return AbstractCourse.find({}).then(function(courses) {
    var o = {};
    o.scope = {};
    o.map = function() {
      //iterate through all the problems in a course

      if (this.problems) {
        //For each problem, we go look at it's attempts
        //We keep track of the category a problem belongs to
        //During the finalize phase, we will use the category
        //to sum up all the times a problem was correct vs incorrect. i.e for each category, we will keep
        //track of all its correct vs incorrect submissions
        //this function only handles categories in which problem attempts have been made
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
          emit(problem.problem.category, {
            correct: correct,
            wrong: wrong,
            count: 1
          });
        });
      }
    };
    // The reduce can get called in two ways
    // NOTE: This function will only be invoked if there is more than one instance with the same key
    //i.e, it will only be called if a problem with a particular category (the key) has been attempted more than once
    //Reduce sums up the number of times a particular category was answered correctly + incorrectly
    o.reduce = function(k, vals) {
      var numCorrectAttempts = 0;
      var numWrongAttempts = 0;
      var count = 0;
      vals.forEach(function(val) {
        count++;
        if (val.correct == 1) {
          numCorrectAttempts++;
        } else if (val.wrong == 1) {
          numWrongAttempts++;
        }
      });
      return {
        correct: numCorrectAttempts,
        wrong: numWrongAttempts,
        count: count
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
        numCorrect: reducedValue.correct,
        numWrong: reducedValue.wrong,
        percentWrong
      };
    };

    return TailoredAssignment.mapReduce(o).then(function(results) {
      return results;
    });
  });
}

//this function only gets data for the categories a specific teacher is responsible for
export function teacherCategoryMetricsCalculator(teacherId) {
  return AbstractCourse.find({
    teacherId: teacherId //Only find courses which match the this teacher
  }).then(function(courses) {
    var o = {};
    o.scope = {};
    o.map = function() {
      //iterate through all the solved problems in a course
      if (this.problems) {
        //For each problem, we go look at it's attempts
        //We keep track of the category a problem belongs to
        //During the finalize phase, we will use the category
        //to sum up all the times a problem was correct vs incorrect. i.e for each category, we will keep
        //track of all its correct vs incorrect submissions
        //this function only handles categories in which problem attempts have been made
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
          emit(problem.problem.category, { correct: correct, wrong: wrong });
        });
      }
    };
    // The reduce can get called in two ways
    // NOTE: This function will only be invoked if there is more than one instance with the same key
    //i.e, it will only be called if a problem with a particular category (the key) has been attempted more than once
    //Reduce sums up the number of times a particular category's problem was answered correctly + incorrectly
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
        numCorrect: reducedValue.correct,
        numWrong: reducedValue.wrong,
        percentWrong
      };
    };

    return TailoredAssignment.mapReduce(o).then(function(results) {
      return results;
    });
  });
}

//This function gets the metrics for different categories within one subject
export function subjectCategoryMetricsCalcuator(subjectName) {
  return AbstractCourse.find({
    subjects: subjectName //Only find courses which match the subject
  }).then(function(courses) {
    var o = {};
    o.scope = {};
    o.map = function() {
      //iterate through all the solved problems in a course
      if (this.problems) {
        //For each problem, we go look at it's attempts
        //We keep track of the category a problem belongs to
        //During the finalize phase, we will use the category
        //to sum up all the times a problem was correct vs incorrect. i.e for each category, we will keep
        //track of all its correct vs incorrect submissions
        //this function only handles categories in which problem attempts have been made
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
          emit(problem.problem.category, { correct: correct, wrong: wrong });
        });
      }
    };
    // The reduce can get called in two ways
    // NOTE: This function will only be invoked if there is more than one instance with the same key
    //i.e, it will only be called if a problem with a particular category (the key) has been attempted more than once
    //Reduce sums up the number of times a particular category's problem was answered correctly + incorrectly
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
        numCorrect: reducedValue.correct,
        numWrong: reducedValue.wrong,
        percentWrong
      };
    };

    return TailoredAssignment.mapReduce(o).then(function(results) {
      return results;
    });
  });
}
