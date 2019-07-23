'use strict';

import angular from 'angular';
import routes from './admin.routes';
import AdminController from './admin.controller';
//imports the webProjectsApp.auth and ngRoute into the webProjectApp.admin module
export default angular.module('webProjectsApp.admin', ['webProjectsApp.auth', 'ngRoute'])
//creates the config, controller and name of the module
  .config(routes)
  .controller('AdminController', AdminController)
  .name;
