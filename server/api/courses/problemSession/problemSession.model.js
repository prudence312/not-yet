'use strict';

import mongoose, { Schema } from 'mongoose';
import { registerEvents } from '../course.events';

/*
The Schema for problem session events.

 - Each session belongs to a student
 - Regardless of submission, it keeps track of various data that is collected any time a student looks at a problem
 - Each session also refers to a particular problem

 - Note js
 */

var ProblemSessionSchema = new Schema(
  {
    start: {
      type: Date,
      default: Date.now
    },
    duration: {
      type: Number,
      required: true
    },
    event: {
      type: String,
      required: true
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    abstractCourseId: {
      type: Schema.Types.ObjectId,
      ref: 'AbstractCourse',
      default: null
    }
  },
  {
    usePushEach: true,
    timestamps: true
  }
);

registerEvents(ProblemSessionSchema);
export default mongoose.model('ProblemSession', ProblemSessionSchema);
