'use strict';

import AbstractCourse from './abstractCourse.model';
import * as problemController from './../problems/problem.controller';
import shared from './../../../config/environment/shared';
import AbstractAssignment from './abstractAssignment.model';
import TailoredAssignment from './../tailoredCourses/tailoredAssignment.model';
import Problem from './../problems/problem.model';
import TailoredCourse from './../tailoredCourses/tailoredCourse.model';
import User from './../../users/user.model';
import KAS from 'kas/kas';
import mongoose from 'mongoose';
var MathLex = require('mathlex_server_friendly');
let logger = require('./../../../config/bunyan');
import config from './../../../config/environment';

export function index(req, res) {
  AbstractCourse.find()
    .populate('assignments')
    .select('-students') //make sure you hide the students for users without adequate permissions
    //When adding students, only add their name , email (for the gravatar) and their ID
    .exec()
    .then(function(courses) {
      return res.status(200).json(courses);
    })
    //Print errors
    .catch(function(err) {
      logger.error(err);
      res.status(500);
      res.send(err);
    });
}

//TODO: TO BE COMPLETED LATER. NEED TO SIMPLIFY THE LOGIC
export function getMyProblems(req, res) {
  //This is the format of the object we want to return from this method.
  // var result = [
  //   {
  //      name: "Problem 1",
  //      subject: "Boolean Logic",
  //      category: "Or",
  //      description: "Boolean stuff",
  //      solution: "Boolean stuff",
  //      students: [
  //         {
  //             name: "Bob Smith",
  //             numAttempts: 3,
  //             lastAttemptCorrect: true,
  //             sessions: [
  //                {
  //                   start: "2019-05-20T10:59:01Z",
  //                   duration: 60000,
  //                   event: "Submission|LostFocus|CloseTab"
  //                }
  //             ]
  //         }
  //      ]
  //   }
  // ]

  var result = [];
  var studentsInThisCourse;
  var assignmentsInThisCourse;
  var allProblemIdsInThisAbstractCourse = [];
  //First find the course and all the assignments belonging to this course
  AbstractCourse.findById(req.params.id)
    .populate('assignments')
    .exec()
    .then(course => {
      //save all the assignment IDs belonging to this course
      //we will use those assignment IDs to find problems. Also save the students
      var assignmentIds = [];
      for (var i = 0; i < course.assignments.length; i++) {
        assignmentIds[i] = course.assignments[i]._id;
      }
      //We'll use this later on to find the student's submission details
      studentsInThisCourse = course.students;
      assignmentsInThisCourse = course.assignmentIds;
      return {
        studentIDs: course.students,
        assignmentIds: assignmentIds
      };
    })
    .then(results => {
      let promises = [];
      //get all the problems affiliated with a particular assignment ID
      for (let i = 0; i < results.assignmentIds.length; i++) {
        promises.push(
          TailoredAssignment.find({
            AbstractAssignmentId: results.assignmentIds[i]
          })
        );
      }
      return Promise.all(promises);
    })
    .then(results => {
      //use a set to store all the problem ids we see. We want the problems to be unique and the
      //Set data structure guarantees uniqueness. Important because if 10 students take the same course,
      //then we will have 10 instances of the same problem.
      //When reporting what problems a teacher has to the teacher, they want to see unique problems
      var problemSet = new Set();

      //For all the assignments affiliated with a particular ID
      for (let i = 0; i < results.length; i++) {
        // We then look at the one particular assignment with a particular problem set
        for (let j = 0; j < results[i].length; j++) {
          //Then look at each individual problem set
          for (let k = 0; k < results[i][j].problems.length; k++) {
            //And add it to the set that
            problemSet.add(results[i][j].problems[k].problem.problemId);
          }
        }
      }
      return problemSet; // this is now all the unique problems belonging to this course
    })
    .then(problemsInThisAbstractCourse => {
      //building our result object. Get problem details for all the problems in this set
      let promises = [];
      problemsInThisAbstractCourse.forEach(problem => {
        promises.push(
          Problem.findOne({
            'problem.problemId': problem
          }).select(
            'problem.subject problem.category problem.description problem.solution'
          )
        );
      });
      return Promise.all(promises);
    })
    .then(allProblems => {
      //Only selecting the necessary attributes of a problem to show to a teacher
      for (let i = 0; i < allProblems.length; i++) {
        allProblemIdsInThisAbstractCourse.push(allProblems[i]._id);
        var resultObj = {
          name: 'Problem ' + (i + 1),
          subject: allProblems[i].problem.subject,
          category: allProblems[i].problem.category,
          description: allProblems[i].problem.description,
          solution: allProblems[i].problem.solution
        };

        //TODO : Add student information to the object before returning it
        result.push(resultObj);
      }
      let studentsPromises = [];
      for (let i = 0; i < studentsInThisCourse.length; i++) {
        studentsPromises.push(
          TailoredCourse.find({
            abstractCourseId: mongoose.Types.ObjectId(req.params.id),
            studentId: mongoose.Types.ObjectId(studentsInThisCourse[i])
          })
        );
      }
      return Promise.all(studentsPromises);
    })
    .then(studentsSubmissions => {
      //find the students who've answered a problem and report their results
      console.log(studentsSubmissions);
    })
    .then(() => {
      return res.status(200).json(result);
    })
    .catch(err => {
      // logger.error(err);
      console.log(err);
      res.status(500);
      res.send(err);
    });
}

export function indexWithPermissions(req, res, showStudentsArray) {
  if (showStudentsArray) {
    AbstractCourse.find()
      .populate('assignments')
      //When adding students, only add their name , email (for the gravatar) and their ID
      .populate({
        path: 'students',
        select: 'name email _id bio'
      })
      .exec()
      .then(function(courses) {
        return res.status(200).json(courses);
      })
      //Print errors
      .catch(function(err) {
        logger.error(err);
        res.status(500);
        res.send(err);
      });
  } else {
    AbstractCourse.find()
      .populate('assignments')
      .select('-students') //make sure you hide the students for users without adequate permissions
      .exec()
      .then(function(courses) {
        return res.status(200).json(courses);
      })
      //Print errors
      .catch(function(err) {
        logger.error(err);
        res.status(500);
        res.send(err);
      });
  }
}

export function show(req, res) {
  AbstractCourse.findById(req.params.id)
    .populate('assignments')
    .select('-students') //make sure you hide the students for users without adequate permissions
    .exec()
    .then(function(course) {
      //return an OK status and the course, if course exists
      return res.status(200).json(course);
    })
    .catch(function(err) {
      //if course does not exists return a not found status
      logger.error({ error: err });
      return res
        .status(404)
        .send(err)
        .end();
    });
}

export function showWithPermisions(req, res, showStudentsArray) {
  if (showStudentsArray) {
    AbstractCourse.findById(req.params.id)
      .populate('assignments')
      //When adding students, only add their name , email (for the gravatar) and their ID
      .populate({
        path: 'students',
        select: 'name email _id bio'
      })
      .exec()
      .then(function(courses) {
        return res.status(200).json(courses);
      })
      //Print errors
      .catch(function(err) {
        logger.error(err);
        res.status(500);
        res.send(err);
      });
  } else {
    AbstractCourse.findById(req.params.id)
      .populate('assignments')
      .select('-students') //make sure you hide the students for users without adequate permissions
      .exec()
      .then(function(courses) {
        return res.status(200).json(courses);
      })
      //Print errors
      .catch(function(err) {
        logger.error(err);
        res.status(500);
        res.send(err);
      });
  }
}

/*
 AbstractCourse.create({
 name: subject.subject + '-about-' + category,
 description: subject.subject + ' focusing on the ' + category + ' topic',
 subjects: [subject.subject],
 categories: [category],
 teacherId: teacher._id

 }).then(createdCourse =>
 AbstractAssignment.create({
 title: 'Assignment 1',
 description: 'This focuses on ' + category + ' operations',
 minNumProblems: 5,
 maxNumProblems: 10,
 newProblemPercentage: 15
 }).then(newAssignment => {
 createdCourse.assignments.push(newAssignment);
 createdCourse.save();
 return createTailoredCourse(createdCourse);
 })
 */
export function create(req, res) {
  // Only allow teachers to create courses
  if (req.user.role === 'teacher') {
    // Note: any role higher than teacher can attach a teacher to the course so
    // we eventually need logic to attach teacher to course if a higher role.
    // (Id should not be just grabbed from the current user)
    var newCourse = new AbstractCourse({
      name: req.body.name,
      description: req.body.description,
      subjects: req.body.subjects,
      categories: req.body.categories,
      teacherId: req.user._id
    });

    var assignments = [];
    for (var i in req.body.assignments) {
      var assignment = new AbstractAssignment(req.body.assignments[i]);
      assignment.save();
      assignments.push(assignment);
    }

    newCourse.assignments = assignments;
    newCourse.save(function(err) {
      if (err) {
        logger.error(
          "Couldn't create course: " + newCourse + 'due to: ' + err.toString()
        );
        return res.status(400).json({});
      }
      logger.debug('Created course: ' + newCourse);
      return res.status(201).json(newCourse);
    });
  } else {
    logger.error('Only teachers can create courses');
    return res.status(403).end(); // Return 403 forbidden if not a teacher
  }
}

export function update(req, res) {
  AbstractCourse.findById(req.params.id)
    .exec()
    .then(course => {
      if (course) {
        //update these paths
        course.name = req.body.name;
        course.description = req.body.description;
        //save course
        course.save();
        //return an OK status and the course
        logger.debug('Updated course: ' + course);
        return res.status(200).send(course);
      }
    })
    .catch(err => {
      //otherwise return a not found status
      logger.error({ error: err });
      res.send(err);
      return res.status(404).end();
    });
}

export function destroy(req, res) {
  AbstractCourse.findById(req.params.id)
    .exec()
    .then(course => {
      //if course found delete course. Permanently
      course.remove();
      logger.debug('Removed course: ' + course);
      //return a no content status
      return res.status(204).end();
    })
    .catch(err => {
      //return a not found status
      logger.error({ error: err });
      res.send(err);
      return res.status(404).end();
    });
}

//only allow the course teacher or role greater than teacher permission
export function hasPermission(req, course) {
  return new Promise(function(resolve, reject) {
    if (
      shared.userRoles.indexOf(req.user.role) >
        shared.userRoles.indexOf('teacher') ||
      course.teacherId.equals(req.user._id)
    ) {
      resolve();
    } else {
      reject();
    }
  });
}
