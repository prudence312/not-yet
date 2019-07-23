'use strict';

import mongoose, { Schema } from 'mongoose';
import shared from './../../../config/environment/shared';

var TailoredCourseSchema = new Schema(
  {
    //grabs information from abstract course
    //such as name and description
    abstractCourseId: {
      type: Schema.Types.ObjectId,
      ref: 'AbstractCourse',
      default: null
    },

    //Identifies a student enrolled in this course
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
      //required:true
    },

    //subjects and categories must match the enums defined below
    subjects: {
      type: String
    },
    categories: {
      type: String
    },

    //grabs the assignments written for this course
    assignments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'TailoredAssignment',
        default: null
      }
    ]
  },
  {
    usePushEach: true,
    //timestamps in mongoose automatically adds
    //createdAt and updatedAt fields with the type Date
    //for audit purposed in our case
    timestamps: true
  }
);

export default mongoose.model('TailoredCourse', TailoredCourseSchema);
