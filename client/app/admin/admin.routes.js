'use strict';
//exports the function to get the route and imports the $routeProvider into the route function
export default function routes($routeProvider) {
  'ngInject';
  //sets up the routeProvider template, controller, and authenticate for when it is an admin
  $routeProvider.when('/admin', {
    template: '<admin></admin>',
    authenticate: 'admin'
  });
}
