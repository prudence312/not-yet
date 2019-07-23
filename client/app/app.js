'use strict';

import angular from 'angular';
// import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';

const ngRoute = require('angular-route');

import uiBootstrap from 'angular-ui-bootstrap';
import 'angular-validation-match';
import 'bootstrap/dist/css/bootstrap.css';

import { routeConfig } from './app.config';

import _Auth from '../services/auth/auth.module';
import account from './account';
import admin from './admin/admin.component';
import assignment from './student/studentAssignment/assignment.component';
import about from './about/about.component';
import course from './student/studentCourse/course.component';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import courseDiscovery from './student/studentCourseDiscovery/courseDiscovery.component';
import assignmentCard from '../components/assignmentCard/assignmentCard.component';
import courseCard from '../components/courseCard/courseCard.component';
import teacherCourseCard from '../components/teacherCourseCard/teacherCourseCard.component';
import problemCard from '../components/problemCard/problemCard.component';
import statisticsCard from '../components/statisticsCard/statisticsCard.component';
import problemConfirmationModal from '../components/problemConfirmationModal/problemConfirmationModal.controller';
import courseCreationModal from '../components/courseCreationModal/courseCreationModal.controller';
import profileImageModal from '../components/profileImageModal/profileImageModal.controller';
import teacherCourseStatisticsModal from '../components/teacherCourseStatisticsModal/teacherCourseStatisticsModal.controller';
import typeahead from '../components/typeahead/typeahead.component';
import main from './main/main.component';
import student from './student/student.component';
import teacher from './teacher/teacher.component';
import constants from './app.constants';
import util from '../services/util/util.module';
import courseService from '../services/course/course.module';
import assignmentService from '../services/assignment/assignment.module';
import userService from '../services/user/user.module';
import teacherCourse from './teacher/teacherCourse/teacherCourse.component';
import teacherCourseData from './teacher/teacherCourseData/teacherCourseData.component';
import studentCard from '../components/studentCard/studentCard.component';
import './app.scss';
//this creates the 'webProjectsApp' module and takes in the imported resources
angular
  .module('webProjectsApp', [
    ngCookies,
    ngResource,
    ngSanitize,
    ngRoute,
    uiBootstrap,
    _Auth,

    account,
    admin,
    'validation.match',
    courseService,
    assignmentService,
    userService,
    navbar,
    about,
    footer,
    assignment,
    course,
    courseCard,
    teacherCourseCard,
    assignmentCard,
    studentCard,
    statisticsCard,
    problemCard,
    problemConfirmationModal,
    courseCreationModal,
    profileImageModal,
    teacherCourseStatisticsModal,
    courseDiscovery,
    typeahead,
    main,
    constants,
    util,
    student,
    teacher,
    teacherCourse,
    teacherCourseData
  ])
  //this makes the default config and run
  .config(routeConfig)
  .run(function($rootScope, $location, Auth) {
    'ngInject';
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function(event, next) {
      Auth.isLoggedIn(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });

angular.element(document).ready(() => {
  angular.bootstrap(document, ['webProjectsApp'], {
    strictDi: true
  });
});
