'use strict';

import angular from 'angular';
import ngResource from 'angular-resource';
import { UserService } from './user.service';

export default angular
  .module('webProjectsApp.userService', [ngResource])
  .factory('UserServ', UserService).name;
