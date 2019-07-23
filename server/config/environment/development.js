'use strict';
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {
  //Problem Engine URL
  problemEngineUrl: 'https://problem-engine-development.herokuapp.com/problems',
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://mongodb-notyet/webprojects-dev?socketTimeoutMS=900000000'
  },

  // Seed database on startup
  seedDB: process.env.SEED_DB || false
};
