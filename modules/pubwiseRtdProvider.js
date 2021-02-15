/**
 * This module adds the PubWise.io provider to the Real Time Data module (rtdModule)
 * The {@link module:modules/realTimeData} module is required
 * The module allows page level traffic quality assessments as well as audience ad targeting information
 * @requires module:modules/realTimeData
 */

import { submodule } from '../src/hook.js';
let trafficAssessment = 0;

function init(provider, userConsent) {
  /* eslint-disable no-console */
  console.log('pubwise rtd loaded')
  trafficAssessment = 0;
  return true;
}

function processAuctionInit(auctionDetails, config, userConsent) {
  /* eslint-disable no-console */
  console.log('rtd auction ', auctionDetails);
  /* eslint-disable no-console */
  console.log('rtd config ', config);
  /* eslint-disable no-console */
  console.log('rtd consent ', userConsent);

  // clear the adunits
  delete auctionDetails.adUnits;
  delete auctionDetails.adUnitCodes;
  delete auctionDetails.bidderRequests;
  // make the auction end quickly
  auctionDetails.timeout = 0
  if (trafficAssessment == 1) {

  }

  return auctionDetails;
}

function processTargetingData(adUnitArray, config, userConsent) {
  console.log('rtd req adUnitArray', adUnitArray);
  console.log('rtd req config', config);
  console.log('rtd req userConsent', userConsent);
}

function processBidRequestData(reqBidsConfigObj, onDone, config, userConsent) {
  console.log('rtd req bids', reqBidsConfigObj);
  console.log('rtd req config', config);
  console.log('rtd req userConsent', userConsent);
  delete reqBidsConfigObj.adUnitCodes
  delete reqBidsConfigObj.bidsBackHandler
  reqBidsConfigObj.timeout = 1;
  onDone();
}

export const pubwiseRtdSubmodule = {
  name: 'pubwise',
  init: init,
  onAuctionInitEvent: processAuctionInit,
  // getTargetingData: processTargetingData,
  getBidRequestData: processBidRequestData
};

submodule('realTimeData', pubwiseRtdSubmodule);
