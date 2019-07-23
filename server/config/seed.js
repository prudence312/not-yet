/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

import User from '../api/users/user.model';

import AbstractCourse from '../api/courses/abstractCourses/abstractCourse.model';
import TailoredCourse from '../api/courses/tailoredCourses/tailoredCourse.model';
import TailoredCourseController from '../api/courses/tailoredCourses/tailoredCourse.controller';
import Submission from '../api/courses/submission/submission.model';
require('kas/kas');
require('mathlex_server_friendly');

import AbstractAssignment from '../api/courses/abstractCourses/abstractAssignment.model';

import TailoredAssignment from '../api/courses/tailoredCourses/tailoredAssignment.model';

import config from './environment/';

import shared from './environment/shared';

import Problem from '../api/courses/problems/problem.model';

import * as problemController from '../api/courses/problems/problem.controller';
import * as tailoredCourseController from '../api/courses/tailoredCourses/tailoredCourse.controller';

import mongoose from 'mongoose';

// We keep track of all the data we have seeded at each stage so that it's easy to pass around
var seededDataSoFar = {
  allUsers: [],
  allTeachers: [],
  allStudents: [],
  allAbstractCourses: [],
  allEnrollments: []
};

//This is our main function that calls all the other functions we created
//And carries out every step of seeding the database correctly
export default function seedDatabaseIfNeeded() {
  if (config.seedDB) {
    console.log('Seeding database...');

    //Step 1: Create all the users
    createUsers()
      .then(users => {
        seededDataSoFar.allUsers = users;
        for (var user of users) {
          //We require teacher IDS to create an abstract course, so we create a separate store
          //specifically for teachers
          if (user.role === 'teacher') {
            seededDataSoFar.allTeachers.push(user);
          }
          //We also require student IDs to enroll them in courses, so we keep track of all the students
          //we have created.
          if (user.role === 'student') {
            seededDataSoFar.allStudents.push(user);
          }
        }
        return seededDataSoFar;
      })
      //Step 2: We create the abstract courses using the teachers IDs from the users we just created
      .then(mySeededData => {
        console.log(
          'We have ' +
            mySeededData.allTeachers.length +
            ' teachers to work with'
        );
        console.log(
          'We have ' +
            mySeededData.allStudents.length +
            ' students to work with'
        );
        //This method creates a course one at a time and stores it in the database, so
        //we later need to query the DB so we can keep track of all the courses we have created
        return createAbstractCoursesAndPopulateAssignments(
          mySeededData.allTeachers
        );
      })
      // //After creating ALL the courses, we query our Database so we can store them in our seededDataSoFar array
      // .then(() => {
      //   return AbstractCourse.find({})
      //     .populate('assignments')
      //     .populate('students')
      //     .exec();
      // })
      //And we store them in our array
      .then(allCourses => {
        // seededDataSoFar.allAbstractCourses = allCourses;
        console.log(
          'We have created ' +
            seededDataSoFar.allAbstractCourses.length +
            ' courses to work with'
        );
        // console.log(seededDataSoFar.allAbstractCourses);
        return seededDataSoFar;
      })
      //Step 3: We enroll students in courses
      .then(mySeededData => {
        //create new enrollments
        return enrollStudentInCourses(
          mySeededData.allStudents,
          mySeededData.allAbstractCourses
        );
      })
      .then(() => {
        return TailoredCourse.find({}).exec();
      })
      .then(allEnrollments => {
        seededDataSoFar.allEnrollments = allEnrollments;
        console.log(
          '\nWe have ' +
            seededDataSoFar.allEnrollments.length +
            ' enrollments to work with'
        );
        return seededDataSoFar;
      })
      //Step 4: We finally make some problem attempts(submissions)
      .then(mySeededData => {
        return makeProblemAttempts(mySeededData.allStudents);
      })
      .catch(err => {
        console.log(err);
      });
  } //end if
} //end fn

function createUsers() {
  /*------------------------- Step 1: Functionality for Creating Users  ------------------------------*/
  return new Promise(function(resolve, reject) {
    var seededUsers = [];
    for (let role of shared.userRoles) {
      //For every role except teachers and students, seed with 1 user
      if (role != 'teacher' && role != 'student') {
        seededUsers.push({
          provider: 'local',
          role,
          name: 'Test ' + role.charAt(0).toUpperCase() + role.slice(1),
          email: role + '@example.com',
          password: 'ps-' + role,
          bio: {
            age: Math.floor(Math.random() * 60) + 20, //random age from 20 - 80
            school: 'University of Denver'
          }
        });
      }
      //seed with 5 teachers
      if (role === 'teacher') {
        for (var i = 1; i <= 5; i++) {
          seededUsers.push({
            provider: 'local',
            role,
            name:
              'Test ' + role.charAt(0).toUpperCase() + role.slice(1) + ' ' + i,
            email: role + i + '@example.com',
            password: 'ps-' + role,
            bio: {
              age: Math.floor(Math.random() * 50) + 30, //random age from 30 - 80
              school: 'University of Denver'
            }
          });
        }
      }
      //seed with 100 students
      if (role === 'student') {
        for (var i = 1; i <= 100; i++) {
          seededUsers.push({
            provider: 'local',
            role,
            name:
              'Test ' + role.charAt(0).toUpperCase() + role.slice(1) + ' ' + i,
            email: role + i + '@example.com',
            password: 'ps-' + role,
            bio: {
              age: Math.floor(Math.random() * 10) + 18, //random age from 18 - 28
              school: 'University of Denver'
            }
          });
        }
      }
    }

    User.find({})
      .remove()
      .then(() => {
        //Create allows us to use an array of objects that represent how the documents will look
        //in our Collections
        User.create(seededUsers)
          .then(users => {
            console.log(users.length + ' users created');
            resolve(users);
          })
          .catch(err => {
            var reason = new Error('error populating users: ' + err);
            reject(reason);
          });
      });
  }); //end createUsers()
}

/* -------------- Step 2: Function for Creating Abstract Courses and Adding Assignments -------------------- */

//we want to seed 25 different abstract courses. We have 5 teachers in our seed data
//and each teacher will have 5 courses
//Each course will have 5 different assignments
var createAbstractCoursesAndPopulateAssignments = function(teachers) {
  return new Promise(function(resolve, reject) {
    //first remove any courses that might still be available from previous server runs
    AbstractCourse.remove({}, err => {
      if (err) {
        console.log("Couldn't remove courses...");
      }
    });
    //We want to create 25 subjects but we only have a limited number of
    //subject-category combinations, based on the subjects/categories our problem
    //engine can emit. So we keep track of all the possible combinations and use those to create
    //25 different courses
    var possibleCombinations = [];
    for (let subject in shared.subjects) {
      for (let category of shared.subjects[subject]) {
        possibleCombinations.push({
          name: subject + '-about-' + category,
          description: subject + ' focusing on the ' + category + ' topic',
          subjects: [subject],
          categories: [category]
        });
      }
    }
    //This represents the array of the 25 courses we will have in our seeded data.
    var seededSubjects = [];

    //Pushing 25 subjects of all possible combinations into the seededSubjects array.
    for (var i = 0; i < 25; i++) {
      let currentCourse = possibleCombinations[i % possibleCombinations.length]; //Making sure we use each of our possible combinations at least once.
      //change the name to make it unique and add a teacher ID to each subject
      seededSubjects.push({
        name: currentCourse.name + '-' + i, // we concatenate a number to the name so that each of the 25 subjects will have a unique name
        description: currentCourse.description,
        subjects: [currentCourse.subjects[0]],
        categories: [currentCourse.categories[0]],
        teacherId: teachers[i % teachers.length]._id //At this stage, we add a teacher ID to the subjects (this is a required field when creating an abstract course)
      });
    }
    //Then create a new course for every course we have
    for (var seededSubject of seededSubjects) {
      var newCourse = new AbstractCourse(seededSubject);
      var category = seededSubject.categories;
      //After creating a course, we create 5 assignments and add them to course
      // var assignment1 = {
      //   title: 'Assignment 1',
      //   description: 'This focuses on ' + category + ' operations',
      //   minNumProblems: 1,
      //   maxNumProblems: 5,
      //   newProblemPercentage: 0
      // };
      // var assignment2 = {
      //   title: 'Assignment 2',
      //   description: 'This focuses on ' + category + ' operations',
      //   minNumProblems: 5,
      //   maxNumProblems: 15,
      //   newProblemPercentage: 25
      // };
      // var assignment3 = {
      //   title: 'Assignment 3',
      //   description: 'This focuses on ' + category + ' operations',
      //   minNumProblems: 15,
      //   maxNumProblems: 40,
      //   newProblemPercentage: 50
      // };
      // var assignment4 = {
      //   title: 'Assignment 4',
      //   description: 'This focuses on ' + category + ' operations',
      //   minNumProblems: 30,
      //   maxNumProblems: 60,
      //   newProblemPercentage: 75
      // };
      // var assignment5 = {
      //   title: 'Assignment 5',
      //   description: 'This focuses on ' + category + ' operations',
      //   minNumProblems: 75,
      //   maxNumProblems: 75,
      //   newProblemPercentage: 100
      // };
      var assignment1 = {
        title: 'Assignment 1',
        description: 'This focuses on ' + category + ' operations',
        minNumProblems: 10,
        maxNumProblems: 10,
        newProblemPercentage: 5
      };
      var assignment2 = {
        title: 'Assignment 2',
        description: 'This focuses on ' + category + ' operations',
        minNumProblems: 10,
        maxNumProblems: 10,
        newProblemPercentage: 5
      };
      var assignment3 = {
        title: 'Assignment 3',
        description: 'This focuses on ' + category + ' operations',
        minNumProblems: 10,
        maxNumProblems: 10,
        newProblemPercentage: 5
      };
      var assignment4 = {
        title: 'Assignment 4',
        description: 'This focuses on ' + category + ' operations',
        minNumProblems: 10,
        maxNumProblems: 10,
        newProblemPercentage: 5
      };
      var assignment5 = {
        title: 'Assignment 5',
        description: 'This focuses on ' + category + ' operations',
        minNumProblems: 10,
        maxNumProblems: 10,
        newProblemPercentage: 5
      };

      var possibleAssignments = [
        assignment1,
        assignment2,
        assignment3,
        assignment4,
        assignment5
      ];
      //Create a new assignment and add it to the newly created course.
      var addedAssignments = [];
      for (var i in possibleAssignments) {
        var newAssignment = new AbstractAssignment(possibleAssignments[i]);
        newAssignment.save();
        addedAssignments.push(newAssignment);
      }

      newCourse.assignments = addedAssignments;
      //Everytime we successfully save a newly created course, we add it to our seededDataSoFar object
      seededDataSoFar.allAbstractCourses.push(newCourse);
      //Finally save the new course we created
      newCourse.save(err => {
        if (err) {
          console.log(
            "Couldn't create course: " + newCourse + 'due to: ' + err.toString()
          );
          reject(err);
        } else {
          resolve(newCourse);
        }
      });
    }
  });
};

//helper function to get n random elements from an array
var _getNRandomElementsFromArray = function(arr, n) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  let result = shuffled.slice(0, n);
  return result;
};

/* -------------------- Step 3: Function to Enroll Students in our courses -------------------- */

//We want to enroll all 100 students in at least one course
//For the sake of statistical significance, we will only use 5 of our 25 courses
//and add 20 students to each course. We use the helper function _getNRandomElementsFromArray
//to randomly select the 5 courses to use.
var enrollStudentInCourses = function(allStudents, allCourses) {
  return TailoredCourse.remove({}).then(function() {
    //Pick 5 random courses
    let fiveRandomCourses = _getNRandomElementsFromArray(allCourses, 5);
    console.log(
      'The 5 randomly selected courses with students enrolled are:\n'
    );
    fiveRandomCourses.forEach(selectedCourse => {
      console.log('Course ID: ' + selectedCourse._id);
      console.log('Course name: ' + selectedCourse.name);
    });
    let promises = [];
    //Then enroll 20 students per course
    for (var i = 0; i < allStudents.length; i++) {
      let studentID = allStudents[i]._id;
      let courseID = fiveRandomCourses[i % fiveRandomCourses.length]._id;

      //We call our controller function to enroll our students. This creates a tailored course,
      //all the tailored assignments and populates those assignments with problems.
      promises.push(
        tailoredCourseController.enrollStudentInCourseHelper(
          courseID,
          studentID
        )
      );
    }
    return Promise.all(promises);
  });
};

/*----------------------- Step 4: Function to Make some problem attempts ------------------*/

/* A version with randomized data
   We have 100 seeded students.
   The students are enrolled in 5 different courses
   Each course has 5 assignments
   We randomly choose how many assignments each students will attempt.
   In each of those assignments, we randomly choose how many of the availble problems students will attempt
   The students have an aptitude which determines their probability of getting a problem correct or not
*/
var makeProblemAttempts = function(allStudents) {
  return Submission.remove({}).then(function() {
    let promises = [];

    allStudents.forEach((student, index) => {
      var aptitude = index; //We can set a student's aptitude to be their index.

      //Since we always have 5 assignments in our seeded data,
      //the number of assignments each student will attempt
      //can be a random number between 0 - 5
      var numAssignmentsToAttempt = Math.floor(Math.random() * 6);

      //Since we know that each student is only enrolled in one course,
      //we can query all TailoredCourses using 'findOne()' and the student's ID
      //to find that course
      promises.push(
        TailoredCourse.findOne({
          studentId: student._id
        })
          .populate('assignments')
          .exec()
          .then(tailoredCourse => {
            //We then randomly select a certain number of assignments for each student to do
            _getNRandomElementsFromArray(
              tailoredCourse.assignments,
              numAssignmentsToAttempt
            ).forEach(assignment => {
              var totalNumAvailableProblems = assignment.problems.length;
              var numProblemsToAttempt = Math.floor(
                Math.random() * (totalNumAvailableProblems + 1)
              );
              //for each assignment that has been randomly selected, we randomly select a number of problems
              //for each student to attempt based on the number of availble problems.
              _getNRandomElementsFromArray(
                assignment.problems,
                numProblemsToAttempt
              ).forEach(problem => {
                var solution = 'answer';

                //we determine whether a student correctly answers a question or not based on their 'aptitude'
                var correct = Math.floor(Math.random() * 100) + 1 < aptitude;

                //we register this as a problem attempt. Important for calculating statistics
                problem.attempts.push({
                  attempt: String(solution),
                  correct: correct
                });

                //Then we make a submission.
                var submission = new Submission({
                  studentId: student._id,
                  problemId: problem._id,
                  assignmentId: assignment._id,
                  courseId: tailoredCourse.abstractCourseId,
                  attemptNum: 2,
                  correct: correct
                });

                //and save all of our MongoDB changes

                submission.save();
                problem.save();
              });
              assignment.save();
            });
            tailoredCourse.save();
          })
      );
    });
    // return Promise.all(promises);
  });
};

/* A version with deterministic data
   We have 100 seeded students.
   The students are enrolled in 5 different courses
   Each course has 5 assignments
   Students attempt ALL the assignments in this version
   Students also attempt ALL the problems.
   The students have an aptitude which determines their probability of getting a
   problem correct or not.
*/
var makeProblemAttempts2 = function(allStudents) {
  return Submission.remove({}).then(function() {
    let promises = [];

    allStudents.forEach((student, index) => {
      var aptitude = index; //We can set a student's aptitude to be their index.

      //Since we know that each student is only enrolled in one course,
      //we can query all TailoredCourses using 'findOne()' and the student's ID
      //to find that course
      promises.push(
        TailoredCourse.findOne({
          studentId: student._id
        })
          .populate('assignments')
          .exec()
          .then(tailoredCourse => {
            //A student does ALL assignments
            tailoredCourse.assignments.forEach(assignment => {
              //And attempts ALL the problems in each assignment
              assignment.problems.forEach(problem => {
                var solution = 'answer';
                //we determine whether a student correctly answers a question or not based on their 'aptitude'
                var correct = Math.floor(Math.random() * 100) + 1 < aptitude;

                //we register this as a problem attempt. Important for calculating statistics
                problem.attempts.push({
                  attempt: String(solution),
                  correct: correct
                });

                //Then we make a submission.
                var submission = new Submission({
                  studentId: student._id,
                  problemId: problem._id,
                  assignmentId: assignment._id,
                  courseId: tailoredCourse.abstractCourseId,
                  attemptNum: 2,
                  correct: correct
                });

                //and save all of our MongoDB changes

                submission.save();
                problem.save();
              });
              assignment.save();
            });
            tailoredCourse.save();
          })
      );
    });
    // return Promise.all(promises);
  });
};
