'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var routerStub = {
  get: sinon.spy(),
  post: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  delete: sinon.spy()
};

var authServiceStub = {
  isAuthenticated() {
    return 'authService.isAuthenticated';
  },
  hasRole(role) {
    return `authService.hasRole.${role}`;
  },
  hasPermission(role) {
    return `authService.hasPermission.${role}`;
  },
  hasPermissionToEnroll(role) {
    return `authService.hasPermissionToEnroll.${role}`;
  }
};

var TailoredCourseStub = {
  submitSolution: 'TailoredCourseCtrl.submitSolution',
  getProblem: 'TailoredCourseCtrl.getProblem',
  enrollStudentInCourse: 'TailoredCourseCtrl.enrollStudentInCourse',
  getTailoredCourse: 'TailoredCourseCtrl.getTailoredCourse',
  getTailoredAssignment: 'TailoredCourseCtrl.getTailoredAssignment'
};

var AbstractCourseStub = {
  index: 'AbstractCourseCtrl.index',
  show: 'AbstractCourseCtrl.show',
  create: 'AbstractCourseCtrl.create',
  update: 'AbstractCourseCtrl.update',
  destroy: 'AbstractCourseCtrl.destroy',
  indexWithPermissions: 'AbstractCourseCtrl.indexWithPermissions'
};

// require the index with our stubbed out modules
var courseIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './abstractCourses/abstractCourse.controller': AbstractCourseStub,
  './tailoredCourses/tailoredCourse.controller': TailoredCourseStub,
  '../../auth/auth.service': authServiceStub
});

describe('Course API Router:', function() {
  it('should return an express router instance', function() {
    expect(courseIndex).to.equal(routerStub);
  });

  // Postive Routes (proper auth)
  describe('Authorized routes testing', function() {
    describe('GET api/courses', function() {
      it('should route to abstractCourse.controller.index', function() {
        expect(routerStub.get.withArgs('/', 'AbstractCourseCtrl.index')).to.have
          .been.calledOnce;
      });
    });

    describe('GET api/courses/:id', function() {
      it('should route to abstractCourse.controller.show', function() {
        expect(routerStub.get.withArgs('/:id', 'AbstractCourseCtrl.show')).to
          .have.been.calledOnce;
      });
    });

    describe('GET api/courses/allcourses', function() {
      it('should route to abstractCourse.controller.indexWithPermissions', function() {
        expect(
          routerStub.get.withArgs(
            '/allcourses',
            'authService.hasRole.student',
            sinon.match.any
          )
        ).to.have.been.calledOnce;
      });
    });

    describe('POST /api/courses', function() {
      it('should route to abstractCourse.controller.create', function() {
        expect(
          routerStub.post.withArgs(
            '/',
            'authService.hasRole.teacher',
            'AbstractCourseCtrl.create'
          )
        ).to.have.been.calledOnce;
      });
    });

    describe('DELETE /api/courses/:id', function() {
      it('should route to abstractCourse.controller.destroy', function() {
        expect(
          routerStub.delete.withArgs(
            '/:id',
            'authService.hasPermission.teacher',
            'AbstractCourseCtrl.destroy'
          )
        ).to.have.been.calledOnce;
      });
    });

    describe('PUT /api/courses/:id', function() {
      it('should route to abstractCourse.controller.update', function() {
        expect(
          routerStub.put.withArgs(
            '/:id',
            'authService.hasPermission.teacher',
            'AbstractCourseCtrl.update'
          )
        ).to.have.been.calledOnce;
      });
    });

    describe('POST /api/courses/:courseId/students/:studentId/assignments/:assignmentId/problems/:problemId', function() {
      it('should route to tailoredCourse.controller.submitSolution', function() {
        expect(
          routerStub.post.withArgs(
            '/:courseId/students/:studentId/assignments/:assignmentId/problems/:problemId',
            'authService.hasRole.student',
            'TailoredCourseCtrl.submitSolution'
          )
        ).to.have.been.calledOnce;
      });
    });

    describe('GET /api/courses/:courseid/students/:studentid/assignments/:assignmentid/problems/:problemid', function() {
      it('should route to tailoredCourse.controller.getProblem', function() {
        expect(
          routerStub.get.withArgs(
            '/:courseid/students/:studentid/assignments/:assignmentid/problems/:problemid',
            'authService.hasRole.student',
            'TailoredCourseCtrl.getProblem'
          )
        ).to.have.been.calledOnce;
      });
    });
    describe('POST /api/courses/:courseId/students/:studentId', function() {
      it('should route to tailoredCourse.controller.enrollStudentInCourse', function() {
        expect(
          routerStub.post.withArgs(
            '/:id/students/:studentId',
            'authService.hasPermissionToEnroll.student',
            'TailoredCourseCtrl.enrollStudentInCourse'
          )
        ).to.have.been.calledOnce;
      });
    });

    describe('GET /api/courses/:courseId/students/:studentId', function() {
      it('should route to tailoredCourse.controller.getTailoredCourse', function() {
        expect(
          routerStub.get.withArgs(
            '/:courseId/students/:studentId',
            'authService.hasRole.student'
          )
        ).to.have.been.calledOnce;
      });
    });

    describe('GET /api/courses/:courseId/students/:studentId/assignments/:assignmentid', function() {
      it('should route to tailoredCourse.controller.getTailoredAssignment', function() {
        expect(
          routerStub.get.withArgs(
            '/:courseid/students/:studentid/assignments/:assignmentid',
            'authService.hasRole.student'
          )
        ).to.have.been.calledOnce;
      });
    });

    describe('GET /api/courses/mine', function() {
      it('should route to statistics.controller.myCourses', function() {
        expect(routerStub.get.withArgs('/mine', 'authService.hasRole.teacher'))
          .to.have.been.calledOnce;
      });
    });

    describe('GET /api/courses/:courseId/stats', function() {
      it('should route to statistics.controller.getStats', function() {
        expect(
          routerStub.get.withArgs(
            '/:id/stats',
            'authService.hasPermission.teacher'
          )
        ).to.have.been.calledOnce;
      });
    });
  });

  // Negative Routes (not proper auth)
  describe('Unauthorized routes testing', function() {
    describe('GET /api/courses/mine', function() {
      it('should not route to statistics.controller.myCourses', function() {
        expect(routerStub.get.withArgs('/mine', 'authService.hasRole.student'))
          .to.not.have.been.called;
      });
    });

    describe('GET /api/courses/:courseId/stats', function() {
      it('should not route to statistics.controller.getStats', function() {
        expect(
          routerStub.get.withArgs(
            '/:id/stats',
            'authService.hasPermission.student'
          )
        ).to.not.have.been.called;
      });
    });
  });
}); //end router tests
