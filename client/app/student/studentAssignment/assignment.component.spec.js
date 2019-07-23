'use strict';
import assignment from './assignment.component';
import { AssignmentController } from './assignment.component';

var assignment;
var course;
var selectedProblem;
var problems;
var problemObjects;
var userId;
var problemId;
var isChanged;

describe('Component: AssignmentComponent', function() {
  beforeEach(angular.mock.module(main));
  //declares the scope, mainComponent, $hrrpBackend variables
  var scope;
  var assignmentComponent;
  var $httpBackend;

  // Initialize the main controller and main components
  beforeEach(
    inject(function(_$httpBackend_, $http, $componentController, $rootScope) {
      $httpBackend = _$httpBackend_;

      scope = $rootScope.$new();
      assignmentComponent = $componentController('assignment', {
        $http,
        $scope: scope
      });
    })
  );
});
