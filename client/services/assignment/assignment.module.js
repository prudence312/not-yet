'use strict';

import angular from 'angular';
import { AssignmentService } from './assignment.service';

export default angular.module('webProjectsApp.assignmentService', [])
  .factory('Assignment', AssignmentService)
  .name;
