export function UserService($http) {
  'ngInject';
  //get current user
  var UserServ = {
    getCurrentUser() {
      return $http.get('/api/users/me');
    },
    //get current user id
    getCurrentUserId() {
      $http.get('/api/users/me').then(result => {
        return result.data._id;
      });
    },
    //get userid
    getUser(id) {
      return $http.get('/api/users/' + id);
    },
    //get all the users
    getAllUsers() {
      //must have admin or higher
      return $http.get('/api/users/');
    },
    /*getCurrentUsersCourses() {
      var id = UserServ.getCurrentUserId();
      return $http.get('/api/users/' +  + '/courses');
    },*/
    //get users course id
    getUsersCourses(id) {
      return $http.get('/api/users/' + id + '/courses');
    },

    getMyCourses() {
      return $http.get('/api/courses/mine');
    }
  };
  return UserServ;
}
