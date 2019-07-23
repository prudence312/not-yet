'use strict';

import { Router } from 'express';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/:id/courses', auth.hasRole('student'), controller.getUsersCourses);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);

router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);

//update user info
router.put('/:id', auth.isAuthenticated(), controller.update); //updates everything but the password

router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);

module.exports = router;
