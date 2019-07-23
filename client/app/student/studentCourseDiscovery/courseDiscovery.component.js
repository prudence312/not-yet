import angular from 'angular';
const ngRoute = require('angular-route');
import routing from '../student.routes';
//this class allows users to discover new courses
export class CourseDiscoveryController {
  courses = [];
  searchItems = [];
  selectedCourses = [];

  /*@ngInject*/
  constructor($http, Course) {
    this.$http = $http;
    this.Course = Course;
  }

  $onInit() {
    this.Course.getAllCourses().then(response => {
      //set courses to response
      this.courses = response.data;
      //flatten course data to unique set for typeahead component
      //see https://medium.com/@jakubsynowiec/unique-array-values-in-javascript-7c932682766c for reasoning behind this implementation
      let length = this.courses.length;
      let seen = new Set();
      //for each course
      for (let i = 0; i < length; i++) {
        //check for name and add if unique
        let value = this.courses[i].name;
        if (seen.has(value)) continue;
        seen.add(value);
        this.searchItems.push(value);
        //split description
        let wordVals = this.courses[i].description.split(' ');
        let length2 = wordVals.length;
        for (let j = 0; j < length2; j++) {
          //check for word and add if unique
          let value2 = wordVals[j];
          if (seen.has(value2)) continue;
          seen.add(value2);
          this.searchItems.push(value2);
        }
        //once category and subjects are implemented correctly, foreach for each
      }
      this.selectedCourses = this.courses;
    });
  }

  deleteThing(thing) {
    this.$http.delete(`/api/things/${thing._id}`);
  }
  //this filters courses based on the search input by comparing it to
  filterCourse(search) {
    this.selectedCourses = this.courses;
    let filteredCourses = this.selectedCourses.filter(course => {
      if (course.name.includes(search)) {
        return true;
      } else if (
        course.description.split(' ').filter(word => word.includes(search))
          .length > 0
      ) {
        return true;
      } else {
        return false;
      }
      //later will also need to check for categories and subjects
    });
    if (filteredCourses.length > 0) {
      this.selectedCourses = filteredCourses;
    }
  }
}

export default angular
  .module('webProjectsApp.courseDiscovery', [ngRoute])
  .config(routing)
  .component('courseDiscovery', {
    template: require('./courseDiscovery.html'),
    controller: CourseDiscoveryController,
    controllerAs: 'courseDiscoveryController'
  }).name;
