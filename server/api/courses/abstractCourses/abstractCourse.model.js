'use strict';

import mongoose, { Schema } from 'mongoose';
import { registerEvents } from './../course.events';
import shared from './../../../config/environment/shared';

var AbstractCourseSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false
    },
    subjects: {
      type: String,
      required: true
    },
    categories: {
      type: String,
      required: true
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    //embeded assignments
    assignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AbstractAssignment',
        default: null
      }
    ],

    //add students to a course
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
/**
 * Validations
 */
var validatePresenceOfSubjectAndCategory = function(subject, category) {
  var returnVal = false;
  Object.entries(shared.subjects).forEach(entry => {
    let thisSubject = entry[0];
    let categoryArray = entry[1];
    for (var i = 0; i < categoryArray.length; i++) {
      if (subject === thisSubject && category === categoryArray[i]) {
        returnVal = true;
      }
    }
  });
  return returnVal;
};

AbstractCourseSchema.pre('save', function(next) {
  // Handle new subjects/categories
  if (!validatePresenceOfSubjectAndCategory(this.subjects, this.categories)) {
    return next(new Error('Invalid Subject or Category'));
  }
  next();
});

registerEvents(AbstractCourseSchema);
export default mongoose.model('AbstractCourse', AbstractCourseSchema);
