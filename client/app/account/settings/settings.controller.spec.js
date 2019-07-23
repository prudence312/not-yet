'use strict';

import settings from './settings.controller';

var form = {
  //Mocking the form object
  valid: true,
  password: 'password'
};

var user = {
  oldPassword: 'oldpassword',
  newPassword: 'newpassword'
};

var Auth = {
  changePassword(oldPw, newPw) {
    this.user.newPassword = newPw;
  }
};

describe('Tests for settings.controller', function() {
  beforeEach(angular.mock.module(settings)); //Mocking angular

  var scope;
  var settingsComponent;
  var $httpBackend;

  beforeEach(inject(function(
    _$httpBackend_,
    $http,
    $componentController,
    $rootScope
  ) {
    $httpBackend = _$httpBackend_;
    scope = $rootScope.$new();

    settingsComponent = $componentController('settings', {
      $http,
      $scope: scope
    });
  }));

  // //Every 'it' is a test that is run. The string parameter is the description
  // //and the expect is the actual test.
  // it("Test change password", function(){
  //   settingsComponent.changePassword(form);
  //   expect()
  // });
});
