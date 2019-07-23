'use strict';

import angular from 'angular';

export class AssignmentCard {

  /*@ngInject*/
  constructor($location) {
    'ngInject';
    this.$location = $location;
  }

  redirect() {
    this.$location.path('/student/course/' + this.courseid + '/assignment/' + this.assignment._id);
  }


}

export default angular.module('directives.assignmentCard', [])
  .component('assignmentCard', {
    template: require('./assignmentCard.html'),
    controller: AssignmentCard,
    controllerAs: 'assignmentCardController',
    bindings: {
      assignment: '=',
      courseid: '=',
      istailored: '='
    }
  })
  .name;
