'use strict';

import mongoose, {Schema} from 'mongoose';
var AbstractAssignment = new Schema({

  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  minNumProblems: {
    type: Number,
    required: true
  },
  maxNumProblems: {
    type: Number,
    required: true
  },
  //New problems will be fetched from problem engine
  //existing problems will be fetched from local DB from problem table
  newProblemPercentage: {
    type: Number,
    required: true
  },
  numberOfPossibleAttempts: {
    type: Number,
    default: 3
  }

}, {
  usePushEach: true,
  //timestamps in mongoose automatically adds
  //createdAt and updatedAt fields with the type Date
  //for audit purposed in our case
  timestamps: true
});

export default mongoose.model('AbstractAssignment', AbstractAssignment);
