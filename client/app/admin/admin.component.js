'use strict';
import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './admin.routes';

// creates the AdminController class and the constructor/delete functions
export class AdminController {
  /*@ngInject*/
  constructor($http, User) {
    // Use the User $resource to fetch all users
    this.$http = $http;
    this.users = User.query();
  }

  $onInit() {}

  delete(user) {
    user.$remove();
    this.users.splice(this.users.indexOf(user), 1);
  }
}

export default angular
  .module('webProjectsApp.admin', [ngRoute])
  .config(routing)
  .component('admin', {
    template: require('./admin.html'),
    controller: AdminController,
    controllerAs: 'adminController'
  }).name;
