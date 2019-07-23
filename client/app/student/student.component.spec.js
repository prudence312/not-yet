'use strict';

import student from './student.component';
import {
  StudentController
} from './student.component';
//this creates the component StudentComponent by running it through the beforeEach function on the student
describe('Component: StudentComponent', function() {
  beforeEach(angular.mock.module(student));

  var scope;
  var studentComponent;
  var $httpBackend;

  // Initialize the controller and scope
  beforeEach(inject(function(_$httpBackend_, $http, $componentController, $rootScope) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/things')
      .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);

    scope = $rootScope.$new();
    studentComponent = $componentController('student', {
      $http,
      $scope: scope
    });
  }));
});
