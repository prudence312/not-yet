'use strict';

import angular from 'angular';
export class ProblemConfirmationModalController {

  /*@ngInject*/
  constructor($uibModalInstance) {
    'ngInject';
    this.$uibModalInstance = $uibModalInstance;
  }
  $onInit() {
  }
  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }
  submit() {
    this.$uibModalInstance.close();
  }
}
export default angular.module('directives.problemConfirmationModal', [])
  .controller('problemConfirmationModalController', ProblemConfirmationModalController)
  .config(['$qProvider', function($qProvider) {    //Once the module is defined .config is used to configure routing for the application
    $qProvider.errorOnUnhandledRejections(false);
  }])
  .name;
