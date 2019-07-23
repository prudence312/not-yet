'use strict';

import angular from 'angular';
const ngRoute = require('angular-route');

import routing from './account.routes';
import login from './login';
import settings from './settings';
import signup from './signup';
//creates the 'webProjectApp.account' module and imports the ngRoute, login, settings, and signup for the module
export default angular
  .module('webProjectsApp.account', [ngRoute, login, settings, signup])
  .config(routing)
  .run(function($rootScope) {
    'ngInject';
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
      if (
        next.name === 'logout' &&
        current &&
        current.originalPath &&
        !current.authenticate
      ) {
        next.referrer = current.originalPath;
      }
    });
  }).name;
