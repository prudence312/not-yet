import angular from 'angular';

const d3 = require('d3');
const nvd3 = require('nvd3');
const uinvd3 = require('angular-nvd3');

export class TeacherCourseStatisticsModalController {
  /*@ngInject*/
  constructor($uibModalInstance, $scope, Course, course, data) {
    this.hidden = false;
    this.hidden2 = false;
    this.$uibModalInstance = $uibModalInstance;
    this.Course = Course;
    this.$scope = $scope;
    this.course = course;
    this.data = data;
    this.data.options1 = {
      chart: {
        type: 'pieChart',
        height: 400,
        width: 450,
        margin: { left: 10, right: 10 },
        x: function(d) {
          return d.key;
        },
        y: function(d) {
          return d.y;
        },
        showLabels: true,
        duration: 500,
        labelThreshold: 0.01,
        labelType: 'value',
        labelSunbeamLayout: true,
        legend: {
          margin: {
            top: 5,
            right: 35,
            bottom: 5,
            left: 20
          }
        }
      }
    };
    this.data.options2 = {
      chart: {
        type: 'boxPlotChart',
        height: 450,
        width: 450,
        margin: {
          top: 20,
          right: 20,
          bottom: 60,
          left: 40
        },
        color: ['darkblue', 'darkorange', 'green', 'darkred', 'darkviolet'],
        x: function(d) {
          return d.label;
        },
        // y: function(d){return d.values.Q3;},
        maxBoxWidth: 75,
        yDomain: [0, 10],
        duration: 0
      }
    };
    this.data.options3 = {
      chart: {
        type: 'discreteBarChart',
        height: 450,
        width: 450,
        margin: {
          top: 20,
          right: 20,
          bottom: 50,
          left: 55
        },
        x: function(d) {
          return d.label;
        },
        y: function(d) {
          return d.value;
        },
        showValues: true,
        valueFormat: function(d) {
          return d3.format(',.4f')(d);
        },
        duration: 500,
        xAxis: {
          axisLabel: 'X Axis'
        },
        yAxis: {
          axisLabel: 'Y Axis',
          axisLabelDistance: -10
        }
      }
    };
  }

  hidden() {
    this.hidden = !this.hidden;
  }
  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  submitForm() {}
}

export default angular
  .module('directives.teacherCourseStatisticsModal', [])
  .controller(
    'teacherCourseStatisticsModal',
    TeacherCourseStatisticsModalController
  ).name;
