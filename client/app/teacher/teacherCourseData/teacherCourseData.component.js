import angular from 'angular';
const ngRoute = require('angular-route');
import routing from '../teacher.routes';
const d3 = require('d3');
const nvd3 = require('nvd3');
const uinvd3 = require('angular-nvd3');
//This class registers students to courses and tailors the course
export class TeacherCourseDataController {
  //constructs the course outline
  /*@ngInject*/

  constructor($http, $routeParams, Course, Auth) {
    this.$http = $http;
    this.$routeParams = $routeParams;
    this.courseId = this.$routeParams.id;
    this.Course = Course;
    this.Auth = Auth;
    this.course;
    this.students;
    this.data;
    this.totalStudentNum;
    this.currentCourseStats;
    this.dataHeight = 430;
    this.problemStats = [];
  }

  $onInit() {
    this.Course.getCourseInfo(this.courseId).then(response => {
      this.course = response.data;
      this.users = response.data.students;
    });
    this.Course.getCourseStudents(this.courseId).then(response => {
      this.students = response.data.students;
    });
    this.Course.getCourseStats(this.courseId).then(response => {
      console.log('course stats');
      console.log(response.data);
      for (let i = 0; i < response.data.problemSetMetrics.length; i++) {
        if (response.data.problemSetMetrics[i].value.numAttempts != 0) {
          this.problemStats.push(
            response.data.problemSetMetrics[i].value.percentWrong
          );
        }
      }
      console.log('this.problemStats');
      console.log(this.problemStats);
      this.totalStudentNum =
        response.data.failingStudents.value.numFail +
        response.data.failingStudents.value.numPass;
      this.data1 = [
        {
          key: 'Completed',
          y: response.data.courseCompletionPercentage[0].value.totalCompleted
        },
        {
          key: 'Not Completed',
          y: response.data.courseCompletionPercentage[0].value.totalNotCompleted
        }
      ];
      this.data2 = [
        {
          label: 'Average Problems completed',
          values: {
            Q1: response.data.studentDistribution.mean - 0.1,
            Q2: response.data.studentDistribution.mean,
            Q3: response.data.studentDistribution.mean + 0.1,
            whisker_low:
              response.data.studentDistribution.mean -
              response.data.studentDistribution.stdDev,
            whisker_high:
              response.data.studentDistribution.mean +
              response.data.studentDistribution.stdDev
          }
        }
      ];
      this.data3 = [
        {
          key: 'Cumulative Return',
          values: [
            {
              label: 'Passing',
              value: response.data.failingStudents.value.numPass
            },
            {
              label: 'Failing',
              value: response.data.failingStudents.value.numFail
            }
          ]
        }
      ];
      this.data4 = [
        {
          key: 'Overachieving Students',
          values: [
            {
              label: 'Overachieving',
              value: response.data.overachievingStudents.value.numExcel
            },
            {
              label: 'Regular',
              value:
                this.totalStudentNum -
                response.data.overachievingStudents.value.numExcel
            }
          ]
        }
      ];
      console.log(this.data4);

      this.data5 = [
        {
          key: 'Answers Percent Wrong ',
          color: '#ff6361',
          values: []
        },
        {
          key: 'Number of Attempts ',
          color: '#7aa6c2',
          values: []
        }
      ];
      this.data6 = [
        {
          key: 'Catagories Percent Wrong ',
          color: '#ff6361',
          values: []
        },
        {
          key: 'Number of Attempts ',
          color: '#7aa6c2',
          values: []
        }
      ];
      for (let i = 0; i < response.data.problemSetMetrics.length; i++) {
        if (response.data.problemSetMetrics[i].value.numAttempts != 0) {
          this.data5[0].values.push({
            label: 'Problem ' + i + '',
            value: response.data.problemSetMetrics[i].value.percentWrong
          });
          this.data5[1].values.push({
            label: 'Problem ' + i + '',
            value: response.data.problemSetMetrics[i].value.numAttempts
          });
          this.problemStats.push(
            response.data.problemSetMetrics[i].value.percentWrong
          );
        }
      }
      for (let i = 0; i < response.data.categoryMetrics.length; i++) {
        if (response.data.categoryMetrics[i].value.numAttempts != 0) {
          var percentWrong =
            (response.data.categoryMetrics[i].value.numWrong /
              response.data.categoryMetrics[i].value.numAttempts) *
            100;
          this.data6[0].values.push({
            label: response.data.categoryMetrics[i]._id,
            value: percentWrong
          });
          this.data6[1].values.push({
            label: response.data.categoryMetrics[i]._id,
            value: response.data.categoryMetrics[i].value.numAttempts
          });
          this.problemStats.push(
            response.data.problemSetMetrics[i].value.percentWrong
          );
        }
      }

      this.currentCourseStats.categoryMetrics = response.data.categoryMetrics;
      this.currentCourseStats.courseCompletionPercentage =
        response.data.courseCompletionPercentage;
      this.currentCourseStats.dataCorrelations = response.data.dataCorrelations;
      this.currentCourseStats.failingStudents = response.data.failingStudents;
      this.currentCourseStats.overachievingStudents =
        response.data.overachievingStudents;
      this.currentCourseStats.problemSetMetrics =
        response.data.problemSetMetrics;
      this.currentCourseStats.studentDistribution =
        response.data.studentDistribution;
      console.log(this.currentCourseStats);
    });

    this.options1 = {
      chart: {
        type: 'pieChart',
        margin: { left: 10, right: 10 },
        x: function(d) {
          return d.key;
        },
        y: function(d) {
          return d.y;
        },
        color: ['#7aa6c2', '#ff6361'],
        showLabels: true,
        duration: 500,
        labelThreshold: 0.1,
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
    this.options2 = {
      chart: {
        type: 'boxPlotChart',
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
    this.options3 = {
      chart: {
        type: 'discreteBarChart',
        margin: {
          top: 20,
          right: 20,
          bottom: 50,
          left: 55
        },
        color: ['#7aa6c2', '#ff6361'],
        x: function(d) {
          return d.label;
        },
        y: function(d) {
          return d.value;
        },
        showValues: true,
        valueFormat: function(d) {
          return d3.format(',.1f')(d);
        },
        duration: 500
      }
    };
    this.options4 = {
      chart: {
        type: 'discreteBarChart',
        margin: {
          top: 20,
          right: 20,
          bottom: 50,
          left: 55
        },
        color: ['#ffa600', '#7aa6c2'],

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
        duration: 500
      }
    };
    this.options5 = {
      chart: {
        type: 'multiBarHorizontalChart',
        grouped: true,
        tooltips: true,
        margin: {
          top: 20,
          right: 20,
          bottom: 50,
          left: 85
        },
        x: function(d) {
          return d.label;
        },
        y: function(d) {
          return d.value;
        },
        showControls: false,
        showValues: true,
        duration: 500
      }
    };
    this.options6 = {
      chart: {
        type: 'multiBarHorizontalChart',
        grouped: true,
        margin: {
          top: 20,
          right: 20,
          bottom: 50,
          left: 140
        },
        x: function(d) {
          return d.label;
        },
        y: function(d) {
          return d.value;
        },
        showControls: false,
        showValues: true,
        duration: 500
      }
    };
  }
}
//this creates the course and takes the [ngRoute]
export default angular
  .module('webProjectsApp.teacherCourseData', [ngRoute])
  //This sets the default config, and the default template and controller components as well as the name
  .config(routing)
  .component('teacherCourseData', {
    template: require('./teacherCourseData.html'),
    controller: TeacherCourseDataController,
    controllerAs: 'teacherCourseDataController'
  }).name;
