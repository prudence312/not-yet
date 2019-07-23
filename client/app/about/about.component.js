import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './about.routes';
import shared from '../../../server/config/environment/shared';
import gravatar from "gravatar";

//Sets up the about controller
export class AboutController {

  aboutData;

  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }
  //a function that sets aboutData to the shared data
  $onInit() {
    for(var i = 0; i < shared.aboutData.contributors.length; ++i) {
      if(!shared.aboutData.contributors[i].image) {
        shared.aboutData.contributors[i].image = gravatar.url(shared.aboutData.contributors[i].email, {s: '320', r: 'x', d: 'retro'});
        shared.aboutData.description = i;
      }
    }
    this.aboutData = shared.aboutData;
  }
}
//defines the about modules config, the 'about' component as well as the template and controller for about
export default angular.module('webProjectsApp.about', [ngRoute])
  .config(routing)
  .component('about', {
    template: require('./about.html'),
    controller: AboutController,
    controllerAs: 'aboutController'
  })
  .name;
