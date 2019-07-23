'use strict';

import angular from 'angular';
import SignupController from './signup.controller';
import routing from '../account.routes';
//create the 'webProjectApp.signup' default module and controller
export default angular
  .module('webProjectsApp.signup', [])
  .config(routing)
  .component('signup', {
    template: require('./signup.html'),
    controller: SignupController,
    controllerAs: 'vm'
  }).name;
