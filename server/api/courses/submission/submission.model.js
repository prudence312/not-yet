'use strict';
/*eslint no-invalid-this:0*/
import crypto from 'crypto';
mongoose.Promise = require('bluebird');
import mongoose, { Schema } from 'mongoose';

import Course from '../abstractCourses/abstractCourse.model';
import User from '../../users/user.model';
import Problem from '../problems/problem.model';
import Assignment from '../tailoredCourses/tailoredAssignment.model';

/*
The Schema for problem submissions.

 - Each submission belongs to a problem. Unique attempt number for each submission within a problem.
 - Each problem belongs to an assignment.
 - Each assignment belongs to a course.

 - Note js
 */
var SubmissionSchema = new Schema(
  {
    attemptNum: {
      type: Number,
      required: true
    },

    correct: {
      type: Boolean,
      required: true
    },

    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem'
    },

    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true
    },

    // TODO: Need to validate that passed in user is a student role
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    }
  },
  {
    usePushEach: true,
    timestamps: true
  }
);

export default mongoose.model('Submission', SubmissionSchema);
