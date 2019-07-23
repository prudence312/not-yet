'use strict';

import angular from 'angular';
import shared from '../../../server/config/environment/shared';

export class CourseCreationModalController {
  course = {
    name: '',
    description: '',
    subjects: '',
    categories: [],
    assignments: [
      {
        title: '',
        description: '',
        minNumProblems: '',
        maxNumProblems: '',
        newProblemPercentage: '',
        numberOfPossibleAttempts: ''
      }
    ]
  };
  subjects = [];
  categories = [];
  category_hint = 'select subject first';
  title = 'Create Course';

  accordion_isopen = [true];

  /*@ngInject*/
  constructor($uibModalInstance, Course) {
    'ngInject';
    this.$uibModalInstance = $uibModalInstance;
    this.Course = Course;
  }

  $onInit() {
    // getting subjects to populate selection on modal
    var allSubjects = [];
    for (var key in shared.subjects) {
      allSubjects.push(key);
    }
    this.subjects = allSubjects;
    this.title = 'Create Course';
  }

  populateCategories() {
    // categories get populated based on the subject that a user chose
    if (this.course.subjects) {
      this.categories = shared.subjects[this.course.subjects];
      this.category_hint = 'select your category';
    }
  }

  // close modal
  close() {
    this.$uibModalInstance.dismiss('close');
  }

  submit() {
    var form = document.getElementsByTagName('form')[0];

    if (form.checkValidity() === false) {
      form.classList.add('was-validated');
      this.formError =
        'Some fields on your form are invalid. Please check your information.';
    } else {
      // submit the course to be created/updated
      this.Course.createCourse(this.course)
        .then(result => {
          this.title =
            'Abstract Course (id=' +
            result.data._id +
            ') successfully created!';
          this.$uibModalInstance.dismiss('close');
          location.reload();
        })
        .catch(err => {
          console.error(err);
        });
    }
  }

  // add an assignment to the course being created/updated
  addAssignment() {
    this.course.assignments.push({
      title: '',
      description: '',
      minNumProblems: '',
      maxNumProblems: '',
      newProblemPercentage: '',
      numberOfPossibleAttempts: ''
    });

    this.accordion_isopen.push(true);
  }

  // remove an assignment from the assignment array for the current course
  removeAssignment(index) {
    this.course.assignments.splice(index, 1);
    this.accordion_isopen.splice(index, 1);
    var last_index = this.course.assignments.length - 1;
    this.accordion_isopen[last_index] = true;
  }
}

export default angular
  .module('directives.courseCreationModal', [])
  .controller('courseCreationModal', CourseCreationModalController).name;
