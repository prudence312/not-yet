'use strict';

/* globals describe, expect, it, beforeEach, afterEach, before */

import User from '../../users/user.model';
import request from 'supertest';

var app = require('../../..');

describe('Tailored Course Tests', function() {
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

  var teacherAuthToken, studentAuthToken, student, teacher, courseResponse;

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

  // Create the course to use for all tests (must do as a teacher)
  before(function(done) {
    request(app)
      .post('/api/courses')
      .set('authorization', `Bearer ${teacherAuthToken}`)
      .set('Content-type', 'application/json; charset=utf-8')
      .send({
        name: 'Course in which to be enrolled',
        description: 'good luck',
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

  /* Test as a student */
  describe('Test Tailored courses as a student', function() {
    it('should validate we logged in by checking that the auth token exists', function() {
      expect(studentAuthToken).to.not.be.an('undefined');
    });

    describe('Enroll in a tailored course', function() {
      var enrollResponse;

      // Enroll in the Course
      before(function(done) {
        request(app)
          .post(
            '/api/courses/' + courseResponse._id + '/students/' + student._id
          )
          .set('authorization', `Bearer ${studentAuthToken}`)
          .expect(200)
          .expect('Content-type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            enrollResponse = res.body;
            done();
          });
      });

      it('Should enroll in a Tailored course as a student', function() {
        expect(enrollResponse).to.not.be.an('undefined');
      });
    });

    describe('Get a tailored course', function() {
      var getTCResponse, assignResponse;

      // Get tailored course
      before(function(done) {
        request(app)
          .get(
            '/api/courses/' + courseResponse._id + '/students/' + student._id
          )
          .set('authorization', `Bearer ${studentAuthToken}`)
          .expect(200)
          .expect('Content-type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            getTCResponse = res.body;
            console.log(JSON.stringify(getTCResponse));
            done();
          });
      });

      it('Should get the Tailored course', function() {
        expect(getTCResponse).to.not.be.an('undefined');
      });

      // Get tailored assignment
      before(function(done) {
        request(app)
          .get(
            '/api/courses/' +
              courseResponse._id +
              '/students/' +
              student._id +
              '/assignments/5aeff2d7e7a03834314df6b7'
          )
          .set('authorization', `Bearer ${studentAuthToken}`)
          .expect(204)
          // .expect('Content-type', 'text/html; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            assignResponse = res.body;
            done();
          });
      });

      it('Should get the Tailored assignment (empty)', function() {
        expect(JSON.stringify(assignResponse)).to.equal(JSON.stringify({}));
      });
    });

    // ERROR PROVOKING ROUTES

    describe('Enroll in a tailored course with someone elses student Id', function() {
      var enrollResponse;

      // Enroll in a course as someone else (should be forbidden)
      before(function(done) {
        request(app)
          .post('/api/courses/' + courseResponse._id + '/students/12345')
          .set('authorization', `Bearer ${studentAuthToken}`)
          .expect(403)
          .expect('Content-type', 'text/html; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            enrollResponse = res.body;
            done();
          });
      });

      it('Should deny access to enroll', function() {
        expect(JSON.stringify(enrollResponse)).to.equal(JSON.stringify({}));
      });
    });

    describe('Try to Enroll in a tailored course that doesnt exist', function() {
      var enrollResponse;

      // Enroll in a course that doesnt exist
      before(function(done) {
        request(app)
          .post('/api/courses/5a7e8dc745bb6805fe805e55/students/' + student._id)
          .set('authorization', `Bearer ${studentAuthToken}`)
          .expect(404)
          // .expect('Content-type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            enrollResponse = res.body;
            done();
          });
      });

      it('Should not be able to find course', function() {
        expect(JSON.stringify(enrollResponse)).to.equal(JSON.stringify({}));
      });
    });
  });

  /* Test as a teacher */
  describe('Test Tailored courses as a teacher', function() {
    it('should validate we logged in by checking that the auth token exists', function() {
      expect(teacherAuthToken).to.not.be.an('undefined');
    });

    describe('Enroll in a tailored course', function() {
      var enrollResponse;

      // Enroll in the Course
      before(function(done) {
        request(app)
          .post(
            '/api/courses/' + courseResponse._id + '/students/' + student._id
          )
          .set('authorization', `Bearer ${teacherAuthToken}`)
          .expect(200)
          .expect('Content-type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            enrollResponse = res.body;
            done();
          });
      });

      it('Should enroll in a Tailored course as a teacher', function() {
        expect(enrollResponse).to.not.be.an('undefined');
      });
    });

    describe('Get a tailored course', function() {
      var getTCResponse, assignResponse;

      // Get tailored course
      before(function(done) {
        request(app)
          .get(
            '/api/courses/' + courseResponse._id + '/students/' + student._id
          )
          .set('authorization', `Bearer ${teacherAuthToken}`)
          .expect(200)
          .expect('Content-type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            getTCResponse = res.body;
            console.log(JSON.stringify(getTCResponse));
            done();
          });
      });

      it('Should get the Tailored course', function() {
        expect(getTCResponse).to.not.be.an('undefined');
      });

      // Get tailored assignment
      before(function(done) {
        request(app)
          .get(
            '/api/courses/' +
              courseResponse._id +
              '/students/' +
              student._id +
              '/assignments/5aeff2d7e7a03834314df6b7'
          )
          .set('authorization', `Bearer ${teacherAuthToken}`)
          .expect(204)
          // .expect('Content-type', 'text/html; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            assignResponse = res.body;
            done();
          });
      });

      it('Should get the Tailored assignment (empty)', function() {
        expect(JSON.stringify(assignResponse)).to.equal(JSON.stringify({}));
      });
    });

    describe('Enroll in a different student into a tailored course with their student Id', function() {
      var enrollResponse;

      // Enroll in a course as someone else (should be forbidden)
      before(function(done) {
        request(app)
          .post('/api/courses/' + courseResponse._id + '/students/12345')
          .set('authorization', `Bearer ${teacherAuthToken}`)
          .expect(200)
          .expect('Content-type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            enrollResponse = res.body;
            done();
          });
      });

      it('Should enroll the student into a Tailored course as a student', function() {
        expect(enrollResponse).to.not.be.an('undefined');
      });
    });

    // ERROR PROVOKING ROUTES

    describe('Try to Enroll in a tailored course that doesnt exist', function() {
      var enrollResponse;

      // Enroll in a course that doesnt exist
      before(function(done) {
        request(app)
          .post('/api/courses/5a7e8dc745bb6805fe805e55/students/' + student._id)
          .set('authorization', `Bearer ${teacherAuthToken}`)
          .expect(404)
          // .expect('Content-type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            enrollResponse = res.body;
            done();
          });
      });

      it('Should not be able to find course', function() {
        expect(JSON.stringify(enrollResponse)).to.equal(JSON.stringify({}));
      });
    });
  });
});
