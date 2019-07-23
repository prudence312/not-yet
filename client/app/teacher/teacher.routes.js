'use strict';

export default function routes($routeProvider) {
  'ngInject';

  $routeProvider.when('/teacher', {
    template: '<teacher></teacher>',
    authenticate: 'teacher' //assuming there is a teacher role
  });
  $routeProvider.when('/teacher/course/:id', {
    template: '<teacher-course></teacher-course>',
    authenticate: 'teacher'
  });
  $routeProvider.when('/teacher/course/data/:id', {
    template: '<teacher-course-data></teacher-course-data>',
    authenticate: 'teacher'
  });
}
