import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './main.routes';
//creates the maincontroller class and the constructor for it
export class MainController {
  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }

  $onInit() {
  }

}
//imports the ngroute into the 'webProjectsAppl.main' module and creates the config and name as well as the template and controller components
export default angular.module('webProjectsApp.main', [ngRoute])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
