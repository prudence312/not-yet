'use strict';

import angular from 'angular';
import 'mathlex_server_friendly';

import katex from 'katex';
require('../../../node_modules/mathquill/build/mathquill');
import { AssignmentController } from '../../app/student/studentAssignment/assignment.component';

export class ProblemCardComponent {
  userInput;
  ast;
  latex;
  descriptionLatex;
  attIsCorrect;
  problem;
  remainingAttempts;
  isCorrect;

  // should be a list of sessions for each problem
  // this is just a start point for a session object
  problemSession = {
    startTime: '', //number of milliseconds since Jan 1 1970
    duration: '', //milliseconds
    event: ''
  };

  /*@ngInject*/
  constructor($location, $scope, $uibModal, Assignment, $routeParams) {
    'ngInject';
    this.$location = $location;
    this.userInput = 'x=';
    this.ast = '';
    this.latex = '';
    this.$uibModal = $uibModal;
    var vm = this;
    this.basic_operators_isClicked = false;
    this.constants_isClicked = false;
    this.logical_isClicked = false;
    this.Assignment = Assignment;
    this.$routeParams = $routeParams;
    this.attIsCorrect = false;
    this.alerts = [];
    this.mathQuill('');

    /*$watch is checking if newVal is true then load virtual machine */
    $scope.$watch(() => this.myproblemgeneral, function(newVal) {
      if (newVal) {
        vm.load();
        var d = new Date();
        vm.problemSession.startTime = d.getTime();
      }
    });

    $scope.$watch(() => this.myproblemspecifc, function(newVal) {
      if (newVal) {
        vm.load();
      }
    });
  }

  click(name) {
    if (this[name]) {
      this[name] = false;
    } else {
      this[name] = true;
    }
  }

  load() {
    if (this.ischanged === true) {
      this.userInput = 'x=';
      this.updateDisplay();
      this.ischanged = false;
    }
    this.descriptionLatex = MathLex.render(
      this.myproblemspecific.description.math,
      'latex'
    );
    console.log('description latex: ' + this.descriptionLatex);
    katex.render(
      this.descriptionLatex,
      document.getElementById('problemDisplay-problem')
    );

    this.Assignment.getProblemInfo(
      this.$routeParams.courseId,
      this.myuserid,
      this.$routeParams.assignmentId,
      this.myproblemspecific.problemId
    ).then(res => {
      console.log('res: ' + res.data);
      this.remainingAttempts =
        res.data.numberOfAllowedAttempts - res.data.attempts.length;
    });

    console.log('remaining: ' + this.remainingAttempts);
    console.log('allowed: ' + this.myproblemgeneral.numberOfAllowedAttempts);
    console.log('length: ' + this.myproblemgeneral.attempts.length);
  }

  /*Try and Catch to see if parsing and rendering works ok*/
  updateDisplay() {
    try {
      this.ast = MathLex.parse(this.userInput);
      this.latex = MathLex.render(this.ast, 'latex');
      var str_version = this.latex.toString(); //cast to string to ensure katex can parse it
      katex.render(str_version, document.getElementById('problem-input'));
    } catch (e) {}
  }

  submitSolution() {
    var d = new Date();
    var MQ = MathQuill.getInterface(2); // for backcompat
    var mathFieldSpan = document.getElementById('math-field'); //Mathfield textarea
    this.latex = MQ.MathField(mathFieldSpan).latex();
    this.Assignment.submitSolution(
      this.$routeParams.courseId,
      this.myuserid,
      this.$routeParams.assignmentId,
      this.myproblemid,
      this.latex
    )
      .async()
      .then(res => {
        console.log('res: ' + res.data);
        console.log('data: ' + res.data.result);
        if (res.data.result === 'success') {
          document.getElementById('math-field').style =
            'background-color: lime;';
          this.addAlert('success', 'Correct!');

          // record focusing session
          this.problemSession.duration =
            d.getTime() - this.problemSession.startTime;
          this.problemSession.event = 'correct submission';
          console.log(JSON.stringify(this.problemSession));
        } else {
          document.getElementById('math-field').style = 'background-color: red';
          this.addAlert('danger', 'Incorrect!');

          // record focusing session
          this.problemSession.duration =
            d.getTime() - this.problemSession.startTime;
          this.problemSession.event = 'incorrect submission';
          console.log(JSON.stringify(this.problemSession));
        }
        this.attemptInfo(res.data);
      });
  }

  attemptInfo(responseData) {
    this.remainingAttempts =
      responseData.numberOfAllowedAttempts - responseData.numberOfAttempts;
  }

  mappings = {
    sqrt: ['\\sqrt'],
    plus: ['+'],
    mult: ['*'],
    div: ['/'],
    equals: ['='],
    greater: ['>'],
    less: ['<'],
    pi: ['\\pi'],
    e: ['\\e'],
    infinity: ['\\infinity'],
    i: ['\\imaginary'],
    zeta: ['\\zeta'],
    tau: ['\\tau'],
    rightarrow: ['\\rightarrow'],
    leftarrow: ['\\leftarrow'],
    forall: ['\\forall'],
    exists: ['\\exists']
  };

  mathQuill(htmlVal) {
    var MQ = MathQuill.getInterface(2); // for backcompat
    var mathFieldSpan = document.getElementById('math-field'); //Mathfield textarea

    if (htmlVal == '') {
      MQ.MathField(mathFieldSpan).write('x = '); //Initially sets mathfield to contain 'x = '
    } else {
      MQ.MathField(mathFieldSpan).typedText(this.mappings[htmlVal].toString()); //Updates the mathfield with the corresponding button clicked
      MQ.MathField(mathFieldSpan).keystroke('Enter'); //Needed for button clicking
    }
  }

  append(htmlVal) {
    if (htmlVal) {
      this.userInput += this.mappings[htmlVal][0];
    } else {
      if (this.mappings[htmlVal].length > 1) {
        this.userInput += this.mappings[htmlVal][1];
      } else {
        this.userInput += this.mappings[htmlVal][0];
      }
    }
    this.updateDisplay();
  }

  addAlert(type, msg) {
    console.log('added alert');
    this.alerts.push({ type, msg });
    if (msg == 'Correct!') {
      this.isCorrect = true;
    } else {
      this.isCorrect = false;
    }
  }

  closeAlert(index) {
    console.log('closed alert');
    this.alerts.splice(index, 1);
    let MQ = MathQuill.getInterface(2);
    let mathFieldSpan = document.getElementById('math-field');
    if (this.isCorrect == true) {
      localStorage.setItem(
        String(this.$routeParams.assignmentId),
        parseInt(localStorage.getItem(String(this.$routeParams.assignmentId))) +
          1
      );
      MQ.MathField(mathFieldSpan).select();
      MQ.MathField(mathFieldSpan).keystroke('Backspace');
      MQ.MathField(mathFieldSpan).typedText('x=');
    }
    MQ.MathField(mathFieldSpan).focus();
    mathFieldSpan.style = 'background-color: white';
  }
}

export default angular
  .module('directives.problemCard', [])
  .component('problemCard', {
    template: require('./problemCard.html'),
    controller: ProblemCardComponent,
    controllerAs: 'problemCardController',
    bindings: {
      myproblemgeneral: '=',
      myproblemspecific: '=',
      myuserid: '=',
      myproblemid: '=',
      ischanged: '='
    }
  }).name;
