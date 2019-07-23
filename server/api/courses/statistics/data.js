/**
 * Created by tjones on 5/19/18.
 *
 * Helper methods for pulling data used to calculate statistics
 */

import mongoose, { Schema } from 'mongoose';

import Submission from '../submission/submission.model';
import AbstractCourse from '../abstractCourses/abstractCourse.model';
import User from '../../users/user.model';
import Problem from '../problems/problem.model';
import AbstractAssignment from '../abstractCourses/abstractAssignment.model';

export function getSubmissionsByCourse(courseId) {
  return Submission.find({
    courseId: mongoose.Types.ObjectId(courseId)
  }).exec();
}

export function getCoursesByTeacher(teacherId) {
  // Get all courses which the given teacher teaches
  return AbstractCourse.find({
    teacherId: mongoose.Types.ObjectId(teacherId)
  }).exec();
}

export function getStatisticsTestCourse() {
  return AbstractCourse.findOne({
    name: 'Statistics Test'
  }).exec();
}
export default {
  getSubmissionsByCourse,
  getStatisticsTestCourse,
  getCoursesByTeacher
};
