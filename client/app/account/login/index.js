'use strict';

import angular from 'angular';
import LoginController from './login.controller';
import user from '../../../services/user/user.module';
import auth from '../../../services/auth/auth.module';
import routing from '../account.routes';
//creates the login module and controller component
export default angular
  .module('webProjectsApp.login', [auth, user])
  .config(routing)
  .component('login', {
    template: require('./login.html'),
    controller: LoginController,
    controllerAs: 'vm'
  }).name;
