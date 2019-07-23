'use strict';
//creates the default setting controller
export default class SettingsController {
  user = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    age: '',
    school: ''
  };
  errors = {
    other: undefined
  };
  message = '';
  submitted = false;

  /*@ngInject*/
  constructor(Auth) {
    this.Auth = Auth;
  }
  //submits the change password form
  changePassword(form) {
    this.submitted = true;
    //checks if the form is filled out correctly
    if (form.$valid) {
      this.Auth.changePassword(this.user.oldPassword, this.user.newPassword)
        .then(() => {
          this.message = 'Password successfully changed.';
        })
        //catches the use of an incorrect password
        .catch(() => {
          form.password.$setValidity('mongoose', false);
          this.errors.other = 'Incorrect password';
          this.message = '';
        });
    }
  }
  changeAge() {}
  changeSchool() {}
}
