'use strict';

/* globals describe, expect, it, beforeEach, afterEach, before */

/*
    Routes to test: (those which call a function in abstractCourse.controller)

     router.get('/', abstractCourseController.index);
     router.get('/:id', abstractCourseController.show);
     router.post('/', auth.hasRole('teacher'), abstractCourseController.create);
     router.delete('/:id', auth.hasPermission('teacher'), abstractCourseController.destroy);
     router.put('/:id', auth.hasPermission('teacher'), abstractCourseController.update);

    We should make sure to test authentication as well. Do tests for all roles.
 */

import User from '../../users/user.model';
import request from 'supertest';

var app = require('../../..');

describe('Abstract Course Tests', function() {
  // var validCoursePayload = {
  //   name: 'survival class',
  //   description: 'how to make fire',
  //   subjects: ['booleanLogic'],
  //   categories: ['or']
  // };

  var validCoursePayload = {
    name: 'survival class',
    description: 'how to make fire',
    subjects: ['algebra'],
    categories: ['division']
  };

  var updatedCoursePayload = {
    name: 'updated class name',
    description: 'updated description',
    subjects: ['algebra'],
    categories: ['addition']
  };

  var teacherPayload = {
    name: 'Fake Teacher',
    email: 'teacher@example.com',
    password: 'ps-teacher',
    role: 'teacher'
  };

  var studentPayload = {
    name: 'Fake Student',
    email: 'student@example.com',
    password: 'ps-student',
    role: 'student'
  };

  var teacherAuthToken, studentAuthToken, student, teacher;

  // Clear users and create a teacher and student to use duration of tests
  before(function(done) {
    User.remove().then(function() {
      teacher = new User(teacherPayload);
      student = new User(studentPayload);
      student.save();
      teacher.save(done);
    });
  });

  before(function(done) {
    request(app)
      .post('/auth/local')
      .send(teacherPayload)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) throw err;
        teacherAuthToken = res.body.token;
        done();
      });
  });

  before(function(done) {
    request(app)
      .post('/auth/local')
      .send(studentPayload)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) throw err;
        studentAuthToken = res.body.token;
        done();
      });
  });

  /* Test as a teacher */
  describe('Test Abstract courses API as a teacher', function() {
    it('Should validate we logged in by checking that the token exists', function() {
      expect(teacherAuthToken).to.be.an('string');
    });

    describe('Get all courses', function() {
      var courses;

      beforeEach(function(done) {
        request(app)
          .get('/api/courses')
          .expect(200)
          .expect('Content-type', 'application/json; charset=utf-8')
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            courses = res.body;
            done();
          });
      });

      it('should respond with a json array of courses', function() {
        expect(courses).to.be.instanceOf(Array);
      });
    });

    describe('Create a course using a valid payload', function() {
      var courseResponse;

      beforeEach(function(done) {
        request(app)
          .post('/api/courses')
          .set('authorization', `Bearer ${teacherAuthToken}`)
          .send(validCoursePayload)
          .expect(201)
          .expect('Content-type', 'application/json; charset=utf-8')
          .then(data => {
            courseResponse = data.body;
            done();
          });
      });

      it('Should respond with the newly created course', function() {
        expect(courseResponse.name).to.equal(validCoursePayload.name);
        expect(courseResponse.description).to.equal(
          validCoursePayload.description
        );
        expect(courseResponse.subjects).to.equal(
          validCoursePayload.subjects[0]
        );
        expect(courseResponse.categories).to.equal(
          validCoursePayload.categories[0]
        );
      });
    });

    describe('Update a course', function() {
      var originalCourseResponse, updatedCourseResponse;

      // Create the course
      before(function(done) {
        request(app)
          .post('/api/courses')
          .set('authorization', `Bearer ${teacherAuthToken}`)
          .send(validCoursePayload)
          .expect(201)
          .expect('Content-type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            originalCourseResponse = res.body;
            done();
          });
      });

      // Update the Course
      beforeEach(function(done) {
        request(app)
          .put('/api/courses/' + originalCourseResponse._id)
          .set('authorization', `Bearer ${teacherAuthToken}`)
          .send(updatedCoursePayload)
          .expect(200)
          .expect('Content-type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            updatedCourseResponse = res.body;
            done();
          });
      });

      it('Should respond with the updated course details', function() {
        expect(updatedCourseResponse.name).to.equal(updatedCoursePayload.name);
        expect(updatedCourseResponse.description).to.equal(
          updatedCoursePayload.description
        );
      });
    });

    describe('Delete a course', function() {
      var response;

      // Create the course
      before(function(done) {
        request(app)
          .post('/api/courses')
          .set('authorization', `Bearer ${teacherAuthToken}`)
          .set('Content-type', 'application/json; charset=utf-8')
          .send(validCoursePayload)
          .expect(201)
          .end(function(err, res) {
            if (err) return done(err);
            response = res.body;
            done();
          });
      });

      // Delete the Course
      beforeEach(function(done) {
        request(app)
          .delete('/api/courses/' + response._id)
          .set('authorization', `Bearer ${teacherAuthToken}`)
          .expect(204)
          .end(function(err, res) {
            if (err) return done(err);
            response = res.body;
            done();
          });
      });

      it('Should delete the course', function() {
        expect(JSON.stringify(response)).to.equal(JSON.stringify({}));
      });
    });

    describe('Create a course using an invalid payload', function() {
      var courseResponse;

      beforeEach(function(done) {
        request(app)
          .post('/api/courses')
          .set('authorization', `Bearer ${teacherAuthToken}`)
          .send({
            title: 'wrong field name',
            help_field: 'this class does not exist, do not pay for it',
            extra_field: true
          })
          .expect(400)
          .expect('Content-type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            courseResponse = res.body;
            done();
          });
      });

      it('should not allow us to create a course using invalid parameters', function() {
        expect(JSON.stringify(courseResponse)).to.equal(JSON.stringify({}));
      });
    });
  });

  /* Test as a student */
  describe('Test Abstract courses as a student', function() {
    it('should validate we logged in by checking that the auth token exists', function() {
      expect(studentAuthToken).to.not.be.an('undefined');
    });

    describe('Get all courses', function() {
      var courses;

      beforeEach(function(done) {
        request(app)
          .get('/api/courses')
          .expect(200)
          .expect('Content-type', 'application/json; charset=utf-8')
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            courses = res.body;
            done();
          });
      });

      it('should respond with a json array of courses', function() {
        expect(courses).to.be.instanceOf(Array);
      });
    });

    describe('Try creating a course as a student', function() {
      var courseResponse;

      beforeEach(function(done) {
        request(app)
          .post('/api/courses')
          .set('authorization', `Bearer ${studentAuthToken}`)
          .send(validCoursePayload)
          .expect(403)
          .expect('Content-type', 'text/html; charset=utf-8"')
          .end(data => {
            courseResponse = data.body;
            done();
          });
      });

      it('should respond with a 403 forbidden when we try to create a course', function() {
        expect(courseResponse).to.be.an('undefined');
      });
    });

    describe('Try deleting a course as a student', function() {
      var courseResponse, deleteResponse;

      // Create the course (must do as a teacher)
      before(function(done) {
        request(app)
          .post('/api/courses')
          .set('authorization', `Bearer ${teacherAuthToken}`)
          .set('Content-type', 'application/json; charset=utf-8')
          .send({
            name: 'Course to be deleted',
            description: 'not around for long',
            subjects: ['algebra'],
            categories: ['multiplication']
          })
          .expect(201)
          .end(function(err, res) {
            if (err) return done(err);
            courseResponse = res.body;
            done();
          });
      });

      // Delete the Course
      beforeEach(function(done) {
        request(app)
          .delete('/api/courses/' + courseResponse._id)
          .set('authorization', `Bearer ${studentAuthToken}`)
          .expect(403)
          .end(function(err, res) {
            if (err) return done(err);
            deleteResponse = res.body;
            done();
          });
      });

      it('Should not allow us to delete a course as a student', function() {
        expect(JSON.stringify(deleteResponse)).to.equal(JSON.stringify({}));
      });
    });
  });
});
