'use strict';
import main from './main.component';
import {
  MainController
} from './main.component';
//gets the component from maincomponent and runs it through the beforeEach function
describe('Component: MainComponent', function() {
  beforeEach(angular.mock.module(main));
  //declares the scope, mainComponent, $hrrpBackend variables
  var scope;
  var mainComponent;
  var $httpBackend;

  // Initialize the main controller and main components
  beforeEach(inject(function(_$httpBackend_, $http, $componentController, $rootScope) {
    $httpBackend = _$httpBackend_;

    scope = $rootScope.$new();
    mainComponent = $componentController('main', {
      $http,
      $scope: scope
    });
  }));
});
