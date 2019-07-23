import angular from 'angular';
import gravatar from 'gravatar';
const ngRoute = require('angular-route');
import routing from './student.routes';
//This class gets the student's course information and other student information
export class StudentController {
  courses = [];
  studentId;
  student;
  studentBio;
  gravatarUrl;

  /*@ngInject*/
  constructor($http, UserServ, Auth, $uibModal) {
    this.$http = $http;
    this.UserServ = UserServ;
    this.Auth = Auth;
    this.$uibModal = $uibModal;
  }

  $onInit() {
    this.Auth.getCurrentUser()
      .then(student => {
        //the gravatar implementation should build a url from the email given from the student size 320 px
        this.gravatarUrl = gravatar.url(student.email, {
          s: '320',
          r: 'x',
          d: 'retro'
        });
        this.student = student;
        if (student.bio) {
          this.studentBio = {
            age: student.bio.age,
            school: student.bio.school
          };
        } else {
          this.studentBio = {
            age: 'No age set yet, go to settings to update your profile.',
            school: 'No school set yet, go to settings to update your profile.'
          };
        }

        //gets all the user course information
        this.UserServ.getUsersCourses(student._id).then(response => {
          this.courses = [];
          response.data.forEach(aCourse => {
            console.log(aCourse);
            var tempCourse = {
              name: aCourse.abstractCourseId.name,
              description: aCourse.abstractCourseId.description,
              categories: aCourse.categories,
              subjects: aCourse.subjects,
              _id: aCourse.abstractCourseId._id
            };
            this.courses.push(tempCourse);
          });
        });
        console.log('bio: ' + this.bio);
      })
      .catch(err => {
        console.log(err);
      });
  }

  // open modal
  openModal(gravatar) {
    this.$uibModal.open({
      template: require('../../components/profileImageModal/profileImageModal.html'),
      controller: 'profileImageModal as profileImageModal',
      size: 'lg',
      windowClass: 'profileImageModal',
      resolve: {
        gravatar: () => gravatar
      }
    });
  }
}
//this creates the default module for 'webProjectsApp.student' and takes the [ngRoute]
export default angular
  .module('webProjectsApp.student', [ngRoute])
  .config(routing)
  .component('student', {
    template: require('./student.html'),
    controller: StudentController,
    controllerAs: 'studentController'
  }).name;
