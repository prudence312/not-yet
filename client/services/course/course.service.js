export function CourseService($http) {
  'ngInject';
  //get all courses
  var Course = {
    // create a new course
    createCourse(course) {
      return $http.post('/api/courses/', course);
    },
    getAllCourses() {
      return $http.get('/api/courses/');
    },
    //get course info
    getCourseInfo(courseId) {
      return $http.get('/api/courses/' + courseId);
    },
    //get the enrolled students of a course
    getCourseStudents(courseId) {
      return $http.get('/api/courses/' + courseId + '/singlecourse');
    },
    //get info on the course in which the student enrolled
    enrollStudentCourse(courseId, studentId) {
      return $http.post('/api/courses/' + courseId + '/students/' + studentId);
    },
    //get tailored course info
    getTailoredCourseInfo(courseId, studentId) {
      return $http.get('/api/courses/' + courseId + '/students/' + studentId);
    },
    //get student info
    getStudentInfo() {
      return $http.get('/api/users/me');
    },
    //get stats for course
    getCourseStats(id) {
      return $http.get('/api/courses/' + id + '/stats/');
    }
  };
  return Course;
}
