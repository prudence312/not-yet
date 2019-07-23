'use strict';
//This decides the route path and route
export default function routes($routeProvider) {
  'ngInject';
  //creates a new route definition to the route service
  $routeProvider.when('/about', {
    template: '<about></about>'
  });
}
