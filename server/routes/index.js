/**
 * Copyright 2018 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

const express = require('express');
const log4js = require('log4js');
const config = require('config');

const health = require('./health');
const ping = require('./ping');
const orderDAO = require('./orderDAO');
const strDAO = require('./strDAO');
const errorHandler = require('../middlewares/error-handler');
const trxMiddleware = require('../middlewares/trx-middleware');

const router = express.Router();

/**
 * Set up logging
 */
const logger = log4js.getLogger('routes - index');
logger.setLevel(config.logLevel);

/**
 * Add routes
 */
router.use('/health', health);
router.use('/ping', ping);

// Add middlewares for /order mount point
router.use('/order', trxMiddleware.func1);
router.use('/order', trxMiddleware.func2);
router.use('/order', orderDAO);
router.use('/order', trxMiddleware.func3);

// Add error middleware for /order mount point
router.use('/order', errorHandler.handleError);

// Add middlewares for /str mount point
router.use('/str', trxMiddleware.func1);
router.use('/str', trxMiddleware.func2);
router.use('/str', strDAO);
router.use('/str', trxMiddleware.func3);

// Add error middleware for /str mount point
router.use('/str', errorHandler.handleError);

/**
 * GET home page
 */
router.get('/', (req, res) => {
  logger.debug('GET /');
  res.redirect('/api-docs');
});

module.exports = router;
