import angular from 'angular';
const ngRoute = require('angular-route');
import routing from '../teacher.routes';

//This class registers students to courses and tailors the course
export class TeacherCourseController {
  //constructs the course outline
  /*@ngInject*/
  constructor($http, $routeParams, Course, Auth) {
    this.$http = $http;
    this.$routeParams = $routeParams;
    this.courseId = this.$routeParams.id;
    this.Course = Course;
    this.Auth = Auth;
    this.course;
    this.noStudentsYet = false;
    this.users;
  }

  $onInit() {
    //gets the user and gets the information to tailor the course to them
    this.Course.getCourseInfo(this.courseId).then(response => {
      this.course = response.data;
      this.users = response.data.students;
      console.log(response.data);
    });
    this.Course.getCourseStudents(this.courseId).then(response => {
      this.students = response.data.students;
    });
    if (this.users) {
      this.noStudentsYet = false;
    }
    console.log('this.course.students');
    console.log(this.users);
  }
  //this enrolls the student in a course and takes the course id and the student's id
}
//this creates the course and takes the [ngRoute]
export default angular
  .module('webProjectsApp.teacherCourse', [ngRoute])
  //This sets the default config, and the default template and controller components as well as the name
  .config(routing)
  .component('teacherCourse', {
    template: require('./teacherCourse.html'),
    controller: TeacherCourseController,
    controllerAs: 'teacherCourseController'
  }).name;
