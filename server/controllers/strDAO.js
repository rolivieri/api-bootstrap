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
const config = require('config');
const util = require('../helpers/util');
const logger = log4js.getLogger('controllers - strDAO');
logger.setLevel(config.logLevel);

/**
 * Str DAO
 */
const strDAO = {};

strDAO.store = async (req, res, next) => {
  logger.debug('inside strDAO.store()...');

  try {
    var str = JSON.stringify(req.body);
    logger.debug("The body is: " + str);

    // invoke transaction
    // Create transaction proposal for endorsement and sendTransaction to orderer
    //const invokeResponse = await res.locals.contract.submitTransaction('StoreStr', str);
    await res.locals.contract.submitTransaction('StoreStr', str);

    let jsonRes = {
      statusCode: 200,
      success: true,
      //result: invokeResponse.toString(),
    };
    res.locals.jsonRes = jsonRes;
    next();
  } catch (err) {
    logger.debug("Something went wrong...");
    next(err);
  }
};

strDAO.read = async (req, res, next) => {
  logger.debug('inside strDAO.read()...');
  try {
    // More info on the following calls: https://fabric-sdk-node.github.io/Contract.html
    // invoke transaction
    // Create transaction proposal for endorsement and sendTransaction to orderer
    //const invokeResponse = await res.locals.contract.submitTransaction('GetOrder', orderID);
    //const invokeResponse = await res.locals.contract.submitTransaction('Ping');
    // query simply query the ledger
    //const queryResponse = await res.locals.contract.executeTransaction('Health');
    const queryResponse = await res.locals.contract.executeTransaction('GetStr');
    logger.debug("queryResponse: " + queryResponse);
    
    let jsonRes = {
      statusCode: 200,
      success: true,
      result: queryResponse.toString(),
    };
    res.locals.jsonRes = jsonRes;
    next();
  } catch (err) {
    logger.debug("Something went wrong...");
    next(err);
  }
};

module.exports = strDAO;
