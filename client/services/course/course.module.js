'use strict';

import angular from 'angular';
import { CourseService } from './course.service';

export default angular.module('webProjectsApp.courseService', [])
  .factory('Course', CourseService)
  .name;
