import angular from 'angular';
const ngRoute = require('angular-route');
import routing from '../student.routes';
//This class registers students to courses and tailors the course
export class CourseController {
  assignments = [];
  course;
  courseId;
  teacher;
  isTailored;
  isEnrolled;
  student;
  //constructs the course outline
  /*@ngInject*/
  constructor($http, $routeParams, Course, Auth) {
    this.$http = $http;
    this.$routeParams = $routeParams;
    this.courseId = this.$routeParams.id;
    this.isTailored = false;
    this.isEnrolled = false;
    this.Course = Course;
    this.Auth = Auth;
  }

  $onInit() {
    //gets the user and gets the information to tailor the course to them
    this.Auth.getCurrentUser()
      .then(student => {
        this.student = student;
        return this.Course.getTailoredCourseInfo(
          this.courseId,
          this.student._id
        );
      })
      //course gets tailored to the student here
      .then(tailored => {
        this.isTailored = true;
        console.log('tailored');
        this.isEnrolled = true;
        document.getElementById('enrollbutton').innerHTML = 'Enrolled';
        this.course = tailored.data;
        this.course.name = this.course.abstractCourseId.name;
        this.course.description = this.course.abstractCourseId.description;
        this.assignments = [];
        console.log(this.course.assignments);
        this.course.assignments.forEach(asmt => {
          this.assignments.push(asmt.AbstractAssignmentId);
        });
      })
      //catches if the course couldn't be tailored
      .catch(err => {
        this.Course.getCourseInfo(this.courseId).then(abstract => {
          console.log(abstract);
          this.isTailored = false;
          this.course = abstract.data;
          this.assignments = this.course.assignments;
        });
      });
  }
  //this enrolls the student in a course and takes the course id and the student's id
  enroll() {
    // deactivate the enroll button, and change it to an indermediate state (Enrolling)
    this.isEnrolled = true;
    document.getElementById('enrollbutton').innerHTML = 'Enrolling';
    this.Course.enrollStudentCourse(this.courseId, this.student._id)
      .then(enroll => {
        console.log('clicked');
        this.isTailored = true;
        this.assignments = [];
        this.course.assignments.forEach(asmt => {
          this.assignments.push(asmt.AbstractAssignmentId);
        });
        // after the request succeeds, change the button to say Enrolled to indicate success
        document.getElementById('enrollbutton').innerHTML = 'Enrolled';
      })
      .catch(err => {
        // something went wrong with the request, so reset the enroll button
        this.isEnrolled = false;
        document.getElementById('enrollbutton').innerHTML = 'Enroll';
      });
  }
}
//this creates the course and takes the [ngRoute]
export default angular
  .module('webProjectsApp.course', [ngRoute])
  //This sets the default config, and the default template and controller components as well as the name
  .config(routing)
  .component('course', {
    template: require('./course.html'),
    controller: CourseController,
    controllerAs: 'courseController'
  }).name;
