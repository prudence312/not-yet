/* eslint-disable linebreak-style */
'use strict';
/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
  menu = [
    {
      title: 'Home',
      link: '/'
    }
  ];

  isNavCollapsed = true; //menu will collapse

  /* initialize variables in the constructor*/
  constructor($location, Auth) {
    'ngInject';
    this.Auth = Auth;
    this.$location = $location;
    this.isLoggedIn = Auth.isLoggedInSync; //see if logged in
    this.isAdmin = Auth.isAdminSync; //see if its admin
    this.isStudent = Auth.isStudentSync; //see if student
    this.isTeacher = Auth.isTeacherSync; //see if teacher
    this.getCurrentUser = Auth.getCurrentUserSync; //get the current user
  }
  /* if route is active return path location */
  isActive(route) {
    return route === this.$location.path();
  }
}

export default angular.module('directives.navbar', []).component('navbar', {
  template: require('./navbar.html'),
  controller: NavbarComponent,
  controllerAs: 'navbarComponent'
}).name;
