'use strict';

import course from './course.component';
import { CourseController } from './course.component';
//this creates the component CourseComponent by running it through the before each function
describe('Component: CourseComponent', function() {
  beforeEach(angular.mock.module(course));

  var scope;
  var courseComponent;
  var $httpBackend;

  // Initialize the controller and scope
  beforeEach(
    inject(function(_$httpBackend_, $http, $componentController, $rootScope) {
      $httpBackend = _$httpBackend_;

      scope = $rootScope.$new();
      courseComponent = $componentController('course', {
        $http,
        $scope: scope
      });
    })
  );
});
