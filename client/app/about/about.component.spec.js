'use strict';

import about from './about.component';
import {
  AboutController
} from './about.component';

//takes the component from aboutcomponent and runs it through the beforeEach function
describe('Component: AboutComponent', function() {
  beforeEach(angular.mock.module(about));
  //declares variables scop, about component, $httpBackend
  var scope;
  var aboutComponent;
  var $httpBackend;

  // Initialize the about module in a new scope and tests it
  beforeEach(inject(function(_$httpBackend_, $http, $componentController, $rootScope) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/things')
      .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);

    scope = $rootScope.$new();
    aboutComponent = $componentController('about', {
      $http,
      $scope: scope
    });
  }));
});
