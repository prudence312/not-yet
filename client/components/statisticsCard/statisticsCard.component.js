'use strict';

import angular from 'angular';
const d3 = require('d3');
const nvd3 = require('nvd3');
const uinvd3 = require('angular-nvd3');

export class StatisticsCard {
  /*@ngInject*/
  constructor() {
    ('ngInject');
  }
}

export default angular
  .module('directives.statisticsCard', [])
  .component('statisticsCard', {
    template: require('./statisticsCard.html'),
    controller: StatisticsCard,
    controllerAs: 'statisticsCardController',
    bindings: {
      options: '=',
      data: '='
    }
  }).name;
