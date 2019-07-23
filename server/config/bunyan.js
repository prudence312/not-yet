// Server-Side JSON Logger
// Needs implementation for different levels
var bunyan = require('bunyan');
var log = bunyan.createLogger({
  name: 'bunyan-log',
  streams: [
    {
      level: 'trace',
      stream: process.stdout
    },
    {
      level: 'debug',
      stream: process.stdout
    },
    {
      level: 'info',
      stream: process.stdout
    },
    {
      level: 'warn',
      stream: process.stdout
    },
    {
      level: 'error',
      stream: process.stderr
    },
    {
      level: 'fatal',
      stream: process.stderr
    }
  ]
});

module.exports = log;
