'use strict';
//exports the function to get the route and imports the $routeProvider into the route function
export default function routes($routeProvider) {
  'ngInject';
  //sets the route providers corresponding controllers and templates
  $routeProvider
    .when('/login', {
      template: '<login></login>'
    })
    .when('/logout', {
      name: 'logout',
      referrer: '/',
      template: '',
      controller($location, $route, Auth) {
        var referrer =
          $route.current.params.referrer || $route.current.referrer || '/';
        Auth.logout();
        $location.path(referrer);
      }
    })
    .when('/signup', {
      template: '<signup></signup>'
    })
    .when('/settings', {
      template: '<settings></settings>',
      authenticate: true
    });
}
