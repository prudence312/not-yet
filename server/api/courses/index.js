import { Router } from 'express';
import * as abstractCourseController from './abstractCourses/abstractCourse.controller';
import * as tailoredCourseController from './tailoredCourses/tailoredCourse.controller';
import * as statisticController from './statistics/statistic.controller';
import * as problemSessionController from './problemSession/problemSession.controller';
import * as auth from '../../auth/auth.service';
import config from '../../config/environment';

var router = new Router();

// Course statistics
router.get('/mine', auth.hasRole('teacher'), statisticController.myCourses);
router.get(
  '/:id/stats',
  auth.hasPermission('teacher'),
  statisticController.getStats
);

//show all courses
router.get('/', abstractCourseController.index);

//Show all courses with all students array displayed.
//Student array only displayed to teachers and higher.
router.get('/allcourses', auth.hasRole('student'), function(req, res) {
  if (
    config.userRoles.indexOf(req.user.role) >=
    config.userRoles.indexOf('teacher')
  ) {
    abstractCourseController.indexWithPermissions(req, res, true);
  } else {
    abstractCourseController.indexWithPermissions(req, res, false);
  }
});

//Show a single course's information with all students array displayed.
//Student array only displayed to teachers and higher.
router.get('/:id/singlecourse', auth.hasRole('student'), function(req, res) {
  if (
    config.userRoles.indexOf(req.user.role) >=
    config.userRoles.indexOf('teacher')
  ) {
    abstractCourseController.showWithPermisions(req, res, true);
  } else {
    abstractCourseController.showWithPermisions(req, res, false);
  }
});

///TODO Create route for teacher to see what problems are in a particular course
// router.get('/:id/problemsInCourse, auth.hasPermission('teacher'), abstractCourseController.getMyProblems);

//routes for a problem session
//create a new problem session
router.post('/problemsessions', problemSessionController.create);

//get all problem session events
router.get('/problemsessions', problemSessionController.index);

//get all problem sessions for a given problem in an abstract course
router.get(
  '/:problemid/problemsessions/:abstractCourseid',
  problemSessionController.showSessionsForProblem
);

//get all problem sessions for a particular problem / particular student
router.get(
  '/problemsessions/:problemId/students/:studentId/',
  problemSessionController.showSessionsForProblemAndStudent
);

//get course by id/ show a single course without the student array displayed. No login required
// possible use-case, showing a preview of a course to a user who has not signed up yet
router.get('/:id', abstractCourseController.show);
// Get tailored assignment
router.get(
  '/:courseid/students/:studentid/assignments/:assignmentid',
  auth.hasRole('student'),
  function(req, res) {
    if (
      config.userRoles.indexOf(req.user.role) >=
      config.userRoles.indexOf('teacher')
    ) {
      tailoredCourseController.getTailoredAssignment(req, res, true);
    } else {
      tailoredCourseController.getTailoredAssignment(req, res, false);
    }
  }
);

// Find Problem
router.get(
  '/:courseid/students/:studentid/assignments/:assignmentid/problems/:problemid',
  auth.hasRole('student'),
  tailoredCourseController.getProblem
);
// get tailored course with the abstract course id and student id
router.get('/:courseId/students/:studentId', auth.hasRole('student'), function(
  req,
  res
) {
  if (
    config.userRoles.indexOf(req.user.role) >=
    config.userRoles.indexOf('teacher')
  ) {
    tailoredCourseController.getTailoredCourse(req, res, true);
  } else {
    tailoredCourseController.getTailoredCourse(req, res, false);
  }
});

//create a course if a teacher
router.post('/', auth.hasRole('teacher'), abstractCourseController.create);
//enroll in a course if student
router.post(
  '/:id/students/:studentId',
  auth.hasPermissionToEnroll('student'),
  tailoredCourseController.enrollStudentInCourse
); // Add Student to course
//delete course if role higher than teacher or teacher who created course
router.delete(
  '/:id',
  auth.hasPermission('teacher'),
  abstractCourseController.destroy
);
//update course if role higher than teacher or teacher who created course
router.put(
  '/:id',
  auth.hasPermission('teacher'),
  abstractCourseController.update
);
//submit a solution to a problem
router.post(
  '/:courseId/students/:studentId/assignments/:assignmentId/problems/:problemId',
  auth.hasRole('student'),
  tailoredCourseController.submitSolution
);
// update problem number in database
router.put(
  '/:courseId/students/:studentId/assignments/:assignmentId',
  tailoredCourseController.updateProblemNumber
);
module.exports = router;
