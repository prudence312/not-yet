'use strict';
//This functions routes to the propper routelocation
/*@ngInject*/
export function routeConfig($routeProvider, $locationProvider) {
  'ngInject';

  $routeProvider.otherwise({
    resolveRedirectTo: Auth => {
      'ngInject';
      //compares the role to the propper route
      return Auth.isLoggedIn()
        .then(role => {
          switch (role) {
          case 'student':
            return '/student';
          default:
            return '/';
          }
        });
    }
  });

  $locationProvider.html5Mode(true);
}
