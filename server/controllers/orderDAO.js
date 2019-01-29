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
// https://stackoverflow.com/questions/33798717/javascript-es6-const-with-curly-braces/33798750
const { Gateway } = require('fabric-network');

const util = require('../helpers/util');
const walletHelper = require('../helpers/wallet');
const ccp = require(util.getNetworkConfigFilePath('org1')); // common connection profile

const gateway = new Gateway();
const logger = log4js.getLogger('controllers - orderDAO');
logger.setLevel(config.logLevel);

/**
 * Controller object
 */
const orderDAO = {};

orderDAO.store = async (req, res) => {
  logger.debug('inside orderDAO.store()...');
  // default user and org - read admin from common connection profile
  const org = 'org1';
  const orgCA = ccp.organizations[org].certificateAuthorities[0];
  const user = ccp.certificateAuthorities[orgCA].registrar[0].enrollId;
  const pw = ccp.certificateAuthorities[orgCA].registrar[0].enrollSecret;
  let jsonRes;

  try {
    // user enroll and import if identity not found in wallet
    const idExists = await walletHelper.identityExists(user);
    if (!idExists) {
      const enrollInfo = await util.userEnroll(org, user, pw);
      await walletHelper.importIdentity(user, org, enrollInfo.certificate, enrollInfo.key);
    }

    // gateway and contract connection
    await gateway.connect(ccp, {
      identity: user,
      wallet: walletHelper.getWallet(),
    });

    const network = await gateway.getNetwork(config.channelName);
    const contract = await network.getContract(config.chaincodeName);

    // More info on the following calls: https://fabric-sdk-node.github.io/Contract.html

    const orderID = req.params.id;
    logger.debug("The orderID is: " + orderID);
    var order =  JSON.stringify(req.body);
    logger.debug("The body is: " + order);

    // invoke transaction
    // Create transaction proposal for endorsement and sendTransaction to orderer
    const invokeResponse = await contract.submitTransaction('StoreOrder', order);

    // query
    // simply query the ledger
    // const queryResponse = await contract.executeTransaction('Health');

    jsonRes = {
      statusCode: 200,
      success: true,
      result: invokeResponse.toString(),
    };
  } catch (err) {
    jsonRes = {
      statusCode: 500,
      success: false,
      message: `FAILED: ${err}`,
    };
  } finally {
    gateway.disconnect();
  }

  util.sendResponse(res, jsonRes);
};

orderDAO.read = async (req, res) => {
  logger.debug('inside orderDAO.read()...');
  // default user and org - read admin from common connection profile
  const org = 'org1';
  const orgCA = ccp.organizations[org].certificateAuthorities[0];
  const user = ccp.certificateAuthorities[orgCA].registrar[0].enrollId;
  const pw = ccp.certificateAuthorities[orgCA].registrar[0].enrollSecret;
  let jsonRes;

  try {
    // user enroll and import if identity not found in wallet
    const idExists = await walletHelper.identityExists(user);
    if (!idExists) {
      const enrollInfo = await util.userEnroll(org, user, pw);
      await walletHelper.importIdentity(user, org, enrollInfo.certificate, enrollInfo.key);
    }

    // gateway and contract connection
    await gateway.connect(ccp, {
      identity: user,
      wallet: walletHelper.getWallet(),
    });

    const orderID = req.params.id;
    logger.debug("The orderID is: " + orderID);

    const network = await gateway.getNetwork(config.channelName);
    const contract = await network.getContract(config.chaincodeName);

    // More info on the following calls: https://fabric-sdk-node.github.io/Contract.html

    // invoke transaction
    // Create transaction proposal for endorsement and sendTransaction to orderer
    const invokeResponse = await contract.submitTransaction('GetOrder', orderID);

    // query
    // simply query the ledger
    // const queryResponse = await contract.executeTransaction('GetOrder');

    jsonRes = {
      statusCode: 200,
      success: true,
      result: invokeResponse.toString(),
    };
  } catch (err) {
    jsonRes = {
      statusCode: 500,
      success: false,
      message: `FAILED: ${err}`,
    };
  } finally {
    gateway.disconnect();
  }

  util.sendResponse(res, jsonRes);
};

module.exports = orderDAO;
