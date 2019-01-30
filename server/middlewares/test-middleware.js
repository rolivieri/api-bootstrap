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

const log4js = require('log4js');
const createError = require('http-errors');
const config = require('config');

const util = require('../helpers/util');

/**
 * Set up logging
 */
const logger = log4js.getLogger('test middleware');
logger.setLevel(config.logLevel);

/**
 * Error Handler object
 */
const testMiddleware = {};


//https://stackoverflow.com/questions/18875292/passing-variables-to-the-next-middleware-using-next-in-express-js
//res.locals.user = value  
/**
 * Catch 404 Error and forward to error handler function
 */
testMiddleware.func1 = (req, res, next) => {
  logger.debug('func1');
  next();
};

/**
 * Error handler function
 */
testMiddleware.func2 = (req, res, next) => {
  logger.debug('func2');
  next();
};

module.exports = testMiddleware;
