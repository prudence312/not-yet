'use strict';

import angular from 'angular';
import SettingsController from './settings.controller';
import routing from '../account.routes';
//creates the setting module and controller
export default angular
  .module('webProjectsApp.settings', [])
  .config(routing)
  .component('settings', {
    template: require('./settings.html'),
    controller: SettingsController,
    controllerAs: 'vm'
  }).name;
