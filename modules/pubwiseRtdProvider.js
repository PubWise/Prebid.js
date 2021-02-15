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

  if (trafficAssessment == 1) {
  }
}

export const pubwiseRtdSubmodule = {
  name: 'pubwise',
  init: init,
  onAuctionInitEvent: processAuctionInit
};

submodule('realTimeData', pubwiseRtdSubmodule);
