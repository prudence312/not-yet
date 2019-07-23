'use strict';

import angular from 'angular';
import { UtilService } from './util.service';
//define webPriojectApp.util
export default angular
  .module('webProjectsApp.util', [])
  .factory('Util', UtilService).name;
