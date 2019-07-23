'use strict';

import angular from 'angular';
import gravatar from 'gravatar';

export class StudentCard {
  /*@ngInject*/
  constructor() {
    this.expanded = false;
    this.gravatarUrl;
    ('ngInject');
  }
  getGravatar(user) {
    this.gravatarUrl = gravatar.url(user.email, {
      s: '320',
      r: 'x',
      d: 'retro'
    });
    return this.gravatarUrl;
  }
  expandSudentCard() {
    if (this.expanded == true) {
      this.expanded = false;
    } else {
      this.expanded = true;
    }
  }
}

export default angular
  .module('directives.studentCard', [])
  .component('studentCard', {
    template: require('./studentCard.html'),
    controller: StudentCard,
    controllerAs: 'studentCardController',
    bindings: {
      user: '='
    }
  }).name;
