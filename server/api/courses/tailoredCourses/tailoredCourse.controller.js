'use strict';

import AbstractCourse from './../abstractCourses/abstractCourse.model';
import * as problemController from './../problems/problem.controller';
import shared from './../../../config/environment/shared';
import AbstractAssignment from './../abstractCourses/abstractAssignment.model';
import TailoredAssignment from './tailoredAssignment.model';
import Problem from './../problems/problem.model';
import TailoredCourse from './tailoredCourse.model';
import User from './../../users/user.model';
import Submission from '../submission/submission.model';
import KAS from 'kas/kas';
require('kas/kas');
require('mathlex_server_friendly');
let logger = require('./../../../config/bunyan'); //path to my logger

//********************************************************
//Operations for Tailored courses - Tailored courses functions go here for clear debugging

export function submitSolution(req, res) {
  //find the corresponding Tailored course based on a abstract course id and student id
  TailoredCourse.findOne({
    abstractCourseId: req.params.courseId,
    studentId: req.params.studentId
  })
    .populate('assignments')
    .exec()
    .then(tailoredCourse => {
      // Filter down to our problem to get the solution
      tailoredCourse.assignments.filter(assignment => {
        if (assignment.AbstractAssignmentId == req.params.assignmentId) {
          assignment.problems.filter(problem => {
            if (problem._id == req.params.problemId) {
              /* Check that we're not submitting more than we're allowed */
              if (problem.attempts.length >= problem.numberOfAllowedAttempts) {
                return res.status(400).send({
                  result: 'maximum number of attempts succeeded',
                  numberOfAllowedAttempts: problem.numberOfAllowedAttempts,
                  numberOfAttempts: problem.attempts.length
                });
              }

              var attemptString = String(req.body.latexSol);
              var submissionExpr = global.KAS.parse(attemptString).expr; //submitted answer
              var solAsLatex = global.MathLex.render(
                problem.problem.solution.math,
                'latex'
              );
              var solutionExpr = global.KAS.parse(solAsLatex).expr; //stored solution

              if (!submissionExpr) {
                logger.error('Invalid submission detected: ' + attemptString);
                return res
                  .status(400)
                  .json({ error: 'ERROR in submission: ' + attemptString });
              }

              if (!solutionExpr) {
                logger.error('Invalid solution detected: ' + solAsLatex);
                return res.status(500).json({
                  error: 'ERROR in solution: ' + problem.problem.solution.math
                });
              }

              var correct = global.KAS.compare(submissionExpr, solutionExpr)
                .equal;

              // Save the attempt to our database. Once for the problem and again for our statistics table
              problem.attempts.push({
                attempt: String(req.body.latexSol),
                correct: correct
              });

              var submission = new Submission({
                problemId: req.params.problemId,
                assignmentId: req.params.assignmentId,
                courseId: req.params.courseId,
                studentId: req.params.studentId,
                attemptNum: problem.attempts.length,
                correct: correct
              });

              submission.save();
              problem.save();

              /* Return response based on correctness */
              if (correct) {
                return res.send({
                  result: 'success',
                  numberOfAllowedAttempts: problem.numberOfAllowedAttempts,
                  numberOfAttempts: problem.attempts.length
                });
              } else {
                return res.send({
                  result: 'failure',
                  numberOfAllowedAttempts: problem.numberOfAllowedAttempts,
                  numberOfAttempts: problem.attempts.length
                });
              }
            }
          });
          assignment.save();
        }
      });
      tailoredCourse.save();
    })
    .catch(err => {
      logger.error(err);
      if (typeof err == 'string' && err.includes('not found')) {
        return res.status(404).json({ message: err.toString() });
      } else {
        return res.status(400).json(err.toString());
      }
    });
}

export function getTailoredCourse(req, res, allowSolutions) {
  var options = {
    path: 'assignments',
    populate: {
      path: 'AbstractAssignmentId',
      model: 'AbstractAssignment',
      select: 'title description'
    }
  };
  if (allowSolutions) {
    options.select = '-problems.problem.solution';
  }
  return TailoredCourse.findOne({
    abstractCourseId: req.params.courseId,
    studentId: req.params.studentId
  })
    .populate({ path: 'abstractCourseId', select: 'name description -_id' })
    .populate(options)
    .exec()
    .then(tc => {
      if (tc) {
        return res.json(tc).status(200);
      } else {
        return Promise.reject('Tailored course not found');
      }
    })
    .catch(err => {
      logger.error(err);
      if (typeof err == 'string' && err.includes('not found')) {
        res
          .status(404)
          .json({ message: err.toString() })
          .end();
      } else {
        return res.status(404).end();
      }
    });
}

export function enrollStudentInCourse(req, res) {
  enrollStudentInCourseHelper(req.params.id, req.params.studentId)
    .then(result => {
      if (typeof result == 'string' && result.includes('204')) {
        return res.status(204).end();
      } else {
        return res.json(result).status(200);
      }
    })
    .catch(err => {
      if (typeof err == 'string' && err.includes('Invalid Course')) {
        return res
          .json('Invalid Course Id: '.concat(req.params.id))
          .status(400)
          .end();
      } else {
        return res
          .json('Invalid Student Id: '.concat(req.params.studentId))
          .status(400)
          .end();
      }
    });
}

//Abstracting middleware functionality from our course enrollment, so we can the enroll student
//functionality in other parts of our program.
export function enrollStudentInCourseHelper(courseID, studentID) {
  //find the user to be enrolled in course
  return User.findById(studentID)
    .exec()
    .then(function(student) {
      if (student) {
        // logger.info('found student');
        //Find the course with the Id passed into the URL
        return AbstractCourse.findById(courseID)
          .exec()
          .then(function(course) {
            if (course) {
              //Add the student to the students array in the abstract course.
              // logger.info('found course');
              course.students.push(studentID);
              course.save();
              //Create the course and associate it with the enrolling students Id
              //Since we return Promise.all we need to chain this with a .then or it will return a pending promise!
              return createCourseAndAddStudent(student, course).then(tc => {
                //Remove solutions from return
                //There may be a better way to do this without querying the database
                TailoredCourse.findById(tc._id, '-studentId')
                  .populate({
                    path: 'abstractCourseId',
                    select: 'name description -_id'
                  })
                  .populate({
                    path: 'assignments',
                    select: '-problems',
                    populate: {
                      path: 'AbstractAssignmentId',
                      model: 'AbstractAssignment',
                      select: 'title description'
                    }
                  })
                  .then(tcNoSolutions => {
                    //console.log("Enrollment of " + studentID + " successful");
                    return Promise.resolve(tcNoSolutions);
                  });
              });
            } else {
              return Promise.resolve('204');
            }
          })
          .catch(function() {
            return Promise.reject('Invalid Course Id: ');
          });
      }
    })
    .catch(function(err) {
      if (typeof err == 'string' && err.includes('Invalid Course')) {
        return Promise.reject('Invalid Course');
      } else {
        return Promise.reject('Invalid Student');
      }
    });
}

/**
 * Generate a TailoredCourse that is specific to the student
 * include unique assignments and problems*
 * @params {User} user - Student that is getting the tailoredCourse
 * @params {Course} - The abstractCourse with details on for creating the tailored Course
 */
function createCourseAndAddStudent(user, course) {
  //This is where we will store the assignments returned by our generateAssignmentsWith() function
  var tailoredAssignments = [];

  //Push the generated assignments (with problems in them) to our local array tailoredAssignments
  for (var i = 0; i < course.assignments.length; i++) {
    tailoredAssignments.push(
      generateAssignmentsWith(course, course.assignments[i])
    );
  }

  //Return a pending promise. We will use .then to access this return in createCourseAndAddStudent() function
  return Promise.all(tailoredAssignments)
    .then(ta => {
      //Create a TailoredCourse and assign the the values we have access to right now
      var tailoredCourse = new TailoredCourse();
      tailoredCourse.abstractCourseId = course._id;
      tailoredCourse.studentId = user._id;
      tailoredCourse.subjects = course.subjects;
      tailoredCourse.categories = course.categories;

      //ta is equal to the populated tailoredAssignments that was returned from generateAssignmentsWith()
      //Since courses can have more than one assignment we need to push all the returned assignments to tailoredCourse
      ta.forEach(function(item) {
        tailoredCourse.assignments.push(item);
      });

      //Save the newly created tailoredCourse object to the database and return it
      return tailoredCourse.save();
    })
    .catch(err => {
      // logger.error(err);
    });
} //end create tailored course

/**
 * Generate a new assignment with problems based on the pre-defined
 * parameters from a AbstractCourse and AbstractCourse.assignment
 * @params {Course} course
 * @params {Assignment} assignment
 * @return {AbstractAssignment}
 */
function generateAssignmentsWith(course, assignment) {
  //We are returning a promise so the Promise.all in the above function will only be called when tailoredAssignments
  //has been fully populated! This is important because Javascript is asynchronous and we do NOT want to create
  //a tailoredCourse until we have fully populated its fields!
  return new Promise(function(resolve, reject) {
    return AbstractAssignment.findById(assignment.toString()).then(assign => {
      //Compute the number of existing problems to fetch, and the number of new ones to generate
      var numberOfProblems =
        Math.floor(Math.random() * assign.maxNumProblems) +
        assign.minNumProblems;
      var numberOfNew = Math.floor(
        numberOfProblems * (assign.newProblemPercentage / 100)
      );

      Problem.count({}, function(err, count) {
        //console.log(count);
        if (count == 0) {
          numberOfNew = numberOfProblems;
        } else if (count < numberOfProblems - numberOfNew) {
          numberOfNew = numberOfNew + (numberOfProblems - numberOfNew) - count;
        }
      });
      //Query the Problem table in the database. $limit is going to limit the number of results so we only fetch
      //the amount of existing problems we need
      Problem.aggregate([
        { $match: { 'problem.category': course.categories } },
        { $limit: numberOfProblems - numberOfNew }
      ])
        .then(results => {
          //Results is an array with numberOfProblems - numberOfNew matching problems
          //It was important to call this BEFORE we create new problems. If we didn't create problems after
          //fetching existing problems there is a possibility that a newly generated problem would be fetched
          //as an existing problems and there could be duplicate problems.
          return addProblems(course, results, numberOfNew).then(newProblems => {
            return results.concat(newProblems);
          });
        })
        .then(promises => {
          //Create new assignment populated with appropriate fields and our final array of problems
          //Promises becomes finalProblems, which we then save in the assignment.

          return Promise.all(promises)
            .then(finalProblems => {
              TailoredAssignment.create({
                AbstractAssignmentId: assign._id,
                problems: finalProblems
              })
                .then(ta => {
                  resolve(ta);
                  // resolve(new TailoredCourse({
                  //   AbstractCourseId: course._id,
                  //   assignments: ta
                  // }).save());
                })
                .catch(err => {
                  // console.log(err);
                  reject(err);
                });
            })
            .catch(err => {
              // logger.error(err);
              reject('Error getting problems', err);
            });
        })
        .catch(() => {
          //logger.error('Error getting abstract assignment');
        });
    });
  });
}

function addProblems(course, databaseProblems, additionalProblems) {
  var results = [];
  for (let i = 0; i < additionalProblems; i++) {
    //Add on to the array of existing problems with numberOfNew new problems
    results.push(
      problemController.create({
        protocol: 'dpg',
        version: '0.1',
        problem: {
          subject: course.subjects,
          category: course.categories,
          depth: 1
        }
      })
    );
  }
  return Promise.all(results)
    .then(problems => {
      // iterate over problems, remove duplicates, compare against database problems
      var newProblemIds = new Set();
      // Get problem ids from db pulled problems
      var dbProblemIds = databaseProblems.map(
        problem => problem.problem.problemId
      );
      var dbProblemIdsSet = new Set(dbProblemIds);
      // Check all new problems for duplicates from the generator
      var reducedProblems = problems.filter(item => {
        var k = item.problem.problemId;
        if (newProblemIds.has(k) || dbProblemIdsSet.has(k)) {
          return false;
        } else {
          newProblemIds.add(k);
          return item;
        }
      });
      return reducedProblems;
    })
    .then(reducedProblems => {
      if (reducedProblems.length < additionalProblems) {
        return addProblems(
          course,
          databaseProblems.concat(reducedProblems),
          additionalProblems - reducedProblems.length
        ).then(moreProblems => reducedProblems.concat(moreProblems));
      } else {
        return reducedProblems;
      }
    });
}

export function getTailoredAssignment(req, res, allowSolutions) {
  var options = {
    path: 'assignments'
  };

  if (allowSolutions) {
    options.select = '-problems.problem.solution';
  }

  // get tailored course
  TailoredCourse.findOne({
    abstractCourseId: req.params.courseid,
    studentId: req.params.studentid
  })
    .populate(options)
    .exec()
    .then(function(tailoredCourse) {
      if (tailoredCourse) {
        let assignment = tailoredCourse.assignments.find(
          asmt => asmt.AbstractAssignmentId == req.params.assignmentid
        );
        if (assignment) {
          return res.status(200).json(assignment);
        } else {
          return res.status(204).end();
        }
      } else {
        return res.status(204).end();
      }
    })
    //Print errors
    .catch(function(err) {
      res.send(err);
      return res.status(404).end();
    });
}

export function getProblem(req, res) {
  // get tailored course
  TailoredCourse.findOne({
    abstractCourseId: req.params.courseid,
    studentId: req.params.studentid
  })
    .populate({
      path: 'assignments',
      select: '-problems.problem.solution'
    })
    .exec()
    .then(function(tailoredCourse) {
      if (tailoredCourse) {
        let assignment = tailoredCourse.assignments.find(
          asmt => asmt.AbstractAssignmentId == req.params.assignmentid
        );
        if (assignment) {
          let problem = assignment.problems.find(
            prob => prob.problem.problemId == req.params.problemid
          );
          if (problem) {
            return res.status(200).json(problem);
          } else {
            return Promise.reject('Problem not found');
          }
        } else {
          return Promise.reject('Assignment not found');
        }
      } else {
        return Promise.reject('Course not found');
      }
    })
    //Print errors
    .catch(function(err) {
      //res.send(err);
      if (typeof err == 'string' && err.includes('not found')) {
        return res.status(404).send(err.toString());
      } else {
        return res.status(500).send(err.toString());
      }
    });
}

export function updateProblemNumber(req, res) {
  // get tailored course
  TailoredCourse.findOne({
    abstractCourseId: req.params.courseId,
    studentId: req.params.studentId
  })
    .populate('assignments')
    .exec()
    .then(function(tailoredCourse) {
      if (tailoredCourse) {
        let assignment = tailoredCourse.assignments.find(
          asmt => asmt.AbstractAssignmentId == req.params.assignmentId
        );
        if (assignment) {
          assignment.problemNumber = req.body.problemNumber.problemNumber;
          assignment.save();
        } else {
          return Promise.reject('Assignment not found');
        }
        tailoredCourse.save();
        return res.status(200).json(tailoredCourse);
      } else {
        return Promise.reject('Course not found');
      }
    })
    .catch(function(err) {
      if (typeof err == 'string' && err.includes('not found')) {
        return res.status(404).send(err.toString());
      } else {
        return res.status(500).send(err.toString());
      }
    });
}
