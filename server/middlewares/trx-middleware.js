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

// Library dependencies
const log4js = require('log4js');
const config = require('config');
const util = require('../helpers/util');
const { Gateway } = require('fabric-network'); // https://stackoverflow.com/questions/33798717/javascript-es6-const-with-curly-braces/33798750
const walletHelper = require('../helpers/wallet');
const ccp = require(util.getNetworkConfigFilePath('org1')); // IBP Connection Profile

// Constants
const org = 'org1';
const orgCA = ccp.organizations[org].certificateAuthorities[0];
const user = ccp.certificateAuthorities[orgCA].registrar[0].enrollId;
const pw = ccp.certificateAuthorities[orgCA].registrar[0].enrollSecret;

/**
 * Set up logging
 */
const logger = log4js.getLogger('test middleware');
logger.setLevel(config.logLevel);

/**
 * Fabric Init Handler
 */
const testMiddleware = {};


//https://stackoverflow.com/questions/18875292/passing-variables-to-the-next-middleware-using-next-in-express-js
//res.locals.user = value  
/**
 * handler func1
 */
testMiddleware.func1 = async (req, res, next) => {
  logger.debug('func1');

  // Gateway instance per request
  logger.debug('Gateway instance created...');
  const gateway = new Gateway();

  try {
    // user enroll and import if identity not found in wallet
    const idExists = await walletHelper.identityExists(user);
    if (!idExists) {
      const enrollInfo = await util.userEnroll(org, user, pw);
      await walletHelper.importIdentity(user, org, enrollInfo.certificate, enrollInfo.key);
    }

    // Gateway and contract connection
    await gateway.connect(ccp, {
      identity: user,
      wallet: walletHelper.getWallet(),
    });
    logger.debug('Gateway instance connected...');

    const network = await gateway.getNetwork(config.channelName);
    logger.debug('Network instance created...');
    const contract = await network.getContract(config.chaincodeName);
    logger.debug('Contract instance created...');
    res.locals.gateway = gateway;
    res.locals.network = network;
    res.locals.contract = contract;
    next();
  } catch (err) {
    gateway.disconnect();
    jsonRes = {
      statusCode: 500,
      success: false,
      message: `FAILED: ${err}`,
    };
    util.sendResponse(res, jsonRes);
  }
};

/**
 * Error handler function
 */
testMiddleware.func2 = (req, res, next) => {
  logger.debug('func2');
  next();
};

testMiddleware.func3 = async (req, res, next) => {
  logger.debug('Disconnecting gateway...');
  res.locals.gateway.disconnect();
  util.sendResponse(res, res.locals.jsonRes);
}

module.exports = testMiddleware;
