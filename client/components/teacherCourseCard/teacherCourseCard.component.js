'use strict';

import angular from 'angular';
import teacherCourseStatisticsModal from '../teacherCourseStatisticsModal/teacherCourseStatisticsModal.controller';

const d3 = require('d3');
const nvd3 = require('nvd3');
const uinvd3 = require('angular-nvd3');

export class CourseCardComponent {
  courses = [];
  hideStats = true;
  selectedCourse;
  currentCourseData;
  options1;
  data1;
  options2;
  data2;
  options3;
  data3;
  currentCourseStats = {
    categoryMetrics: {
      description: 'Which problem categories are giving students trouble',
      threshold: 50
    },

    courseCompletionPercentage: [
      {
        _id: '5b157839d17bd61564d83593',
        value: {
          numCompleted: 2,
          numNotCompleted: 3
        }
      }
    ],

    dataCorrelations: {
      description:
        'Returns connections between success on some problems and failure on others'
    },

    failingStudents: [
      {
        _id: null,
        value: {
          numPass: 5,
          numFail: 2
        }
      }
    ],

    overachievingStudents: {
      description:
        'Returns a group of students with grades above some threshold',
      threshold: 50
    },

    problemSetMetrics: {
      description: 'Returns which sets of problems are giving students trouble',
      threshold: 50
    },

    studentDistribution: {
      description:
        'returns the mean and standard deviation for completion of a course',
      mean: 7,
      stdDev: 1
    }
  };

  /*@ngInject*/
  constructor($location, $uibModal, Course) {
    'ngInject';
    this.$location = $location;
    this.Course = Course;
    this.$uibModal = $uibModal;
    this.data;
  }

  $onInit() {}

  openStatisticsModal(course, data) {
    this.$uibModal.open({
      template: require('../teacherCourseStatisticsModal/teacherCourseStatisticsModal.html'),
      controller:
        'teacherCourseStatisticsModal as teacherCourseStatisticsModal',
      resolve: {
        course: () => course,
        data: () => data
      }
    });
  }
  getStatistics(course) {
    console.log(course);
    this.Course.getCourseStats(course._id).then(response => {
      this.currentCourseStats.categoryMetrics = response.data.categoryMetrics; // contains average and standard deviation (stdDev)
      this.currentCourseStats.courseCompletionPercentage =
        response.data.courseCompletionPercentage;
      this.currentCourseStats.dataCorrelations = response.data.dataCorrelations; // contains average and standard deviation (stdDev)
      //this.currentCourseStats.failingStudents = response.data.failingStudents;
      this.currentCourseStats.overachievingStudents =
        response.data.overachievingStudents;
      this.currentCourseStats.problemSetMetrics =
        response.data.problemSetMetrics;
      this.currentCourseStats.studentDistribution =
        response.data.studentDistribution;
    });
    console.log(this.currentCourseStats);

    this.data1 = [
      {
        key: 'Completed',
        y: this.currentCourseStats.courseCompletionPercentage[0].value
          .numCompleted
      },
      {
        key: 'Not Completed',
        y: this.currentCourseStats.courseCompletionPercentage[0].value
          .numNotCompleted
      }
    ];

    this.data2 = [
      {
        label: 'Average Problems completed',
        values: {
          Q1: this.currentCourseStats.studentDistribution.mean - 0.1,
          Q2: this.currentCourseStats.studentDistribution.mean,
          Q3: this.currentCourseStats.studentDistribution.mean + 0.1,
          whisker_low:
            this.currentCourseStats.studentDistribution.mean -
            this.currentCourseStats.studentDistribution.stdDev,
          whisker_high:
            this.currentCourseStats.studentDistribution.mean +
            this.currentCourseStats.studentDistribution.stdDev
          //outliers: [50, 100, 425]
        }
      }
    ];

    this.data3 = [
      {
        key: 'Cumulative Return',
        values: [
          {
            label: 'Passing',
            value: this.currentCourseStats.failingStudents[0].value.numPass
          },
          {
            label: 'Failing',
            value: this.currentCourseStats.failingStudents[0].value.numFail
          }
        ]
      }
    ];
    this.currentCourseData = {
      data1: this.data1,
      options1: '',
      data2: this.data2,
      options2: '',
      data3: this.data3,
      options3: ''
    };
    console.log('current course data');
  }
  // open statistics div
  openStatistics(course) {
    // set hidden to false and save the currently selected course
    this.hideStats = false;
    this.selectedCourse = course;

    // get the stats for the currently selected course
    this.Course.getCourseStats(this.selectedCourse._id).then(response => {
      this.currentCourseStats.categoryMetrics = response.data.categoryMetrics; // contains average and standard deviation (stdDev)
      this.currentCourseStats.courseCompletionPercentage =
        response.data.courseCompletionPercentage;
      this.currentCourseStats.dataCorrelations = response.data.dataCorrelations; // contains average and standard deviation (stdDev)
      this.currentCourseStats.failingStudents = response.data.failingStudents;
      this.currentCourseStats.overachievingStudents =
        response.data.overachievingStudents;
      this.currentCourseStats.problemSetMetrics =
        response.data.problemSetMetrics;
      this.currentCourseStats.studentDistribution =
        response.data.studentDistribution;
    });
    console.log();
    // add padding below course cards to allow scrolling while screen is covered by div
    document.getElementById('coursePadding').style.height = '50vh';

    this.options1 = {
      chart: {
        type: 'pieChart',
        height: 500,
        width: window.innerWidth,
        x: function(d) {
          return d.key;
        },
        y: function(d) {
          return d.y;
        },
        showLabels: true,
        duration: 500,
        labelThreshold: 0.01,
        labelSunbeamLayout: true,
        legend: {
          margin: {
            top: 5,
            right: 35,
            bottom: 5,
            left: 0
          }
        }
      }
    };

    this.data1 = [
      {
        key: 'Completed',
        y: this.currentCourseStats.courseCompletionPercentage[0].value
          .numCompleted
      },
      {
        key: 'Not Completed',
        y: this.currentCourseStats.courseCompletionPercentage[0].value
          .numNotCompleted
      }
    ];

    this.options2 = {
      chart: {
        type: 'boxPlotChart',
        height: 450,
        width: window.innerWidth,
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
        yDomain: [0, 10]
      }
    };

    this.data2 = [
      {
        label: 'Average Problems completed',
        values: {
          Q1: this.currentCourseStats.studentDistribution.mean - 0.1,
          Q2: this.currentCourseStats.studentDistribution.mean,
          Q3: this.currentCourseStats.studentDistribution.mean + 0.1,
          whisker_low:
            this.currentCourseStats.studentDistribution.mean -
            this.currentCourseStats.studentDistribution.stdDev,
          whisker_high:
            this.currentCourseStats.studentDistribution.mean +
            this.currentCourseStats.studentDistribution.stdDev
          //outliers: [50, 100, 425]
        }
      }
    ];

    this.options3 = {
      chart: {
        type: 'discreteBarChart',
        height: 450,
        width: window.innerWidth,
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

    this.data3 = [
      {
        key: 'Cumulative Return',
        values: [
          {
            label: 'Passing',
            value: this.currentCourseStats.failingStudents[0].value.numPass
          },
          {
            label: 'Failing',
            value: this.currentCourseStats.failingStudents[0].value.numFail
          }
        ]
      }
    ];
  }

  // close stats div
  closeStatistics() {
    this.hideStats = true;
    this.selectedCourse = '';
    document.getElementById('coursePadding').style.height = '0';
  }
}

//binding mycourse to = operator
export default angular
  .module('directives.teacher-course-card', [uinvd3])
  .component('teacherCourseCard', {
    template: require('./teacherCourseCard.html'),
    controller: CourseCardComponent,
    controllerAs: 'teacherCourseCardController',
    bindings: {
      courses: '='
    }
  }).name;
