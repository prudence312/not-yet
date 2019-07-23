import angular from 'angular';
const ngRoute = require('angular-route');
import routing from '../student.routes';
//this class functions as the question UI and manages moving from question to question
export class AssignmentController {
  assignment;
  course;
  selectedProblem;
  problems;
  problemObjects;
  userId;
  problemId;
  isChanged;
  problemNumber;
  //constructs the course and problems
  /*@ngInject*/
  constructor($routeParams, $scope, Assignment, Course, Auth) {
    this.$routeParams = $routeParams;
    this.Assignment = Assignment;
    this.Course = Course;
    this.Auth = Auth;
    this.problemObjects = [];
    var vm = this;
    $scope.$watch(
      () => localStorage.getItem(String($routeParams.assignmentId)),
      function(newVal) {
        if (newVal) {
          console.log(
            Number(localStorage.getItem(String($routeParams.assignmentId)))
          );
          vm.changeProblem(
            parseInt(localStorage.getItem(String($routeParams.assignmentId)))
          );
        }
      }
    );
  }

  $onInit() {
    var vm = this;
    this.Auth.getCurrentUser()
      .then(user => {
        this.Assignment.getAssignmentInfo(
          this.$routeParams.courseId,
          user._id,
          this.$routeParams.assignmentId
        ).then(response => {
          console.log(response.data);
          this.assignment = response.data;
          this.problems = this.assignment.problems;
          this.problemNumber = this.assignment.problemNumber;
          var counter = 0;
          this.problems.forEach(problem => {
            let prob = {
              number: counter,
              overview: problem,
              specific: problem.problem
            };
            this.problemObjects.push(prob);
            counter++;
          });
          if (this.assignment.problemNumber == 0) {
            localStorage.setItem(String(this.$routeParams.assignmentId), 0);
            this.selectedProblem = this.problemObjects[0];
            console.log('start on prob 1');
          } else {
            console.log('start on other prob');
            localStorage.setItem(
              String(this.$routeParams.assignmentId),
              this.assignment.problemNumber
            );
            this.selectedProblem = this.problemObjects[
              this.assignment.problemNumber
            ];
          }
          this.userId = user._id;
          this.problemId = this.selectedProblem.overview._id;
        });
        //gets the course info for the user
        this.Course.getCourseInfo(this.$routeParams.courseId).then(response => {
          this.course = response.data;
        });
      })
      .catch(err => {
        console.error(err);
      });
  }
  //goes to the left problem

  left() {
    let newNumber = this.problemNumber - 1;
    this.changeProblem(newNumber);
  }
  //goes to the right problem
  right() {
    let newNumber = this.problemNumber + 1;
    this.changeProblem(newNumber);
  }
  //changes the number of the problem you are on
  changeProblem(problemNumber) {
    console.log('changing problem to ' + problemNumber);
    if (problemNumber > this.problemObjects.length - 1) {
      problemNumber = this.problemObjects.length - 1;
    }
    if (problemNumber < 0) {
      problemNumber = 0;
    }
    this.selectedProblem = this.problemObjects[problemNumber];
    this.problemId = this.selectedProblem.overview._id;
    this.isChanged = true;
    this.problemNumber = problemNumber;
    // save new problem number to database
    this.updateDatabaseProbNumber(problemNumber);
  }

  updateDatabaseProbNumber(newNumber) {
    this.Assignment.updateProblemNumber(
      this.$routeParams.courseId,
      this.userId,
      this.assignment.AbstractAssignmentId,
      { problemNumber: newNumber }
    );
  }

  //Used in css to highlight current selected problem
  isProblem(problemNumber) {
    return this.selectedProblem.number == problemNumber;
  }
}
//this creates the assignment and takes the [ngRoute]
export default angular
  .module('webProjectsApp.assignment', [ngRoute])
  //this gets the config of the route as well as the template, controller, and controllerAs components as well as the name
  .config(routing)
  .component('assignment', {
    template: require('./assignment.html'),
    controller: AssignmentController,
    controllerAs: 'assignmentController'
  }).name;
