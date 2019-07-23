/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app) {
  // Insert routes below

  app.use('/api/users', require('./api/users'));

  app.use('/api/courses', require('./api/courses'));

  app.use('/auth', require('./auth').default);

  // All undefined asset or api routes should return a 404
  app
    .route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes (except Swagger-UI) should redirect to the index.html for AngularJS
  app.route('/*').get((req, res, next) => {
    if (req.url.startsWith('/api-docs') || req.url.startsWith('/api-spec'))
      return next();
    res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
  });
}
