'use strict';

import courseDiscovery from './courseDiscovery.component';
import courseService from '../../../services/course/course.module';

import { CourseDiscoveryController } from './courseDiscovery.component';
//this creates the component CourseDiscoveryComponent by running it through the beforeEach function on courseDiscovery and courseService
describe('Component: CourseDiscoveryComponent', function() {
  beforeEach(angular.mock.module(courseDiscovery));
  beforeEach(angular.mock.module(courseService));
  //declares the scope, courseDiscoverComponent, and $httpBackend variables
  var scope;
  var courseDiscoveryComponent;
  var $httpBackend;

  // Initialize the controller and scope
  beforeEach(
    inject(function(_$httpBackend_, $http, $componentController, $rootScope) {
      $httpBackend = _$httpBackend_;
      $httpBackend
        .expectGET('/api/courses/')
        .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);

      scope = $rootScope.$new();
      courseDiscoveryComponent = $componentController('courseDiscovery', {
        $http,
        $scope: scope
      });
    })
  );

  // it('should attach a list of courses to the controller', function() {
  //   courseDiscoveryComponent.$onInit();
  //   $httpBackend.flush();
  //   expect(courseDiscoveryComponent.courses.length)
  //     .to.not.equal(0);
  // });
});
