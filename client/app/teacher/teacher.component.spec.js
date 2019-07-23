'use strict';

import teacher from './teacher.component';
import { TeacherController } from './teacher.component';

describe('Component: TeacherComponent', function() {
  beforeEach(angular.mock.module(teacher));

  var scope;
  var teacherComponent;
  var $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(
    inject(function(_$httpBackend_, $http, $componentController, $rootScope) {
      $httpBackend = _$httpBackend_;
      $httpBackend
        .expectGET('/api/things')
        .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);

      scope = $rootScope.$new();
      teacherComponent = $componentController('teacher', {
        $http,
        $scope: scope
      });
    })
  );

  // Need to write tests here
});
