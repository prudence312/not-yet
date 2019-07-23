'use strict';

import angular from 'angular';
//this sets up the default for constant of the webProjectsApp.constants
export default angular.module('webProjectsApp.constants', [])
  .constant('appConfig', require('../../server/config/environment/shared'))
  .name;
