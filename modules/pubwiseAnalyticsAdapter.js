import {ajax} from 'src/ajax';
import adapter from 'src/AnalyticsAdapter';
import adaptermanager from 'src/adaptermanager';
import CONSTANTS from 'src/constants.json';
const utils = require('src/utils');

/****
 * PubWise.io Analytics
 * Contact: support@pubwise.io
 * Developer: Stephen Johnston
 *
 * For testing:
 *
 pbjs.enableAnalytics({
  provider: 'pubwise',
  options: {
    site: 'test-test-test-test',
    endpoint: 'https://api.pubwise.io/api/v4/event/add/',
  }
 });
*/

const analyticsType = 'endpoint';
const analyticsName = 'PubWise Analytics:';
let defaultUrl = 'https://api.pubwise.io/api/v5/event/default/';
let pubwiseVersion = '3.0.61';
let configOptions = {site: '', endpoint: defaultUrl, debug: ''};
let pwAnalyticsEnabled = false;
let utmKeys = {utm_source: '', utm_medium: '', utm_campaign: '', utm_term: '', utm_content: ''};
let sessionData = {sessionId: ''};
let pwNamespace = 'pubwise';
let pwEvents = [];
let metaData = {};
let auctionEnded = false;
let sessTimeout = 60 * 30 * 1000; // 30 minutes, G Analytics default session length
let sessName = 'sess_id';
let sessTimeoutName = 'sess_timeout';

function markEnabled() {
  utils.logInfo(`${analyticsName} Enabled`, configOptions);
  pwAnalyticsEnabled = true;
}

function enrichWithSessionInfo(dataBag) {
  try {
    dataBag['session_id'] = sessionData.sessId;
  } catch (e) {
    dataBag['error_sess'] = 1;
  }

  return dataBag;
}

function enrichWithMetrics(dataBag) {
  try {
    if (typeof PREBID_TIMEOUT !== 'undefined') {
      dataBag['target_timeout'] = PREBID_TIMEOUT;
    } else {
      dataBag['target_timeout'] = 'NA';
    }
    dataBag['pw_version'] = pubwiseVersion;
    dataBag['pbjs_version'] = $$PREBID_GLOBAL$$.version;
    dataBag['debug'] = configOptions.debug;
  } catch (e) {
    dataBag['error_metric'] = 1;
  }

  return dataBag;
}

function enrichWithUTM(dataBag) {
  let newUtm = false;
  try {
    for (let prop in utmKeys) {
      utmKeys[prop] = utils.getParameterByName(prop);
      if (utmKeys[prop]) {
        newUtm = true;
        dataBag[prop] = utmKeys[prop];
      }
    }

    if (newUtm === false) {
      for (let prop in utmKeys) {
        let itemValue = localStorage.getItem(setNamespace(prop));
        if (itemValue !== null && typeof itemValue !== 'undefined' && itemValue.length !== 0) {
          dataBag[prop] = itemValue;
        }
      }
    } else {
      for (let prop in utmKeys) {
        localStorage.setItem(setNamespace(prop), utmKeys[prop]);
      }
    }
  } catch (e) {
    utils.logInfo(`${analyticsName} Error`, e);
    dataBag['error_utm'] = 1;
  }
  return dataBag;
}

function expireUtmData() {
  utils.logInfo(`${analyticsName} Session Expiring UTM Data`);
  for (let prop in utmKeys) {
    localStorage.removeItem(setNamespace(prop));
  }
}

function enrichWithCustomSegments(dataBag) {
  // c_site: '', c_script_type: '', c_slot1: '', c_slot2: '', c_slot3: '', c_slot4: ''
  if (configOptions.c_host) {
    dataBag['c_host'] = configOptions.c_host;
  }

  if (configOptions.c_script_type) {
    dataBag['c_script_type'] = configOptions.c_script_type;
  }

  if (configOptions.c_slot1) {
    dataBag['c_slot1'] = configOptions.c_slot1;
  }

  if (configOptions.c_slot2) {
    dataBag['c_slot2'] = configOptions.c_slot2;
  }

  if (configOptions.c_slot3) {
    dataBag['c_slot3'] = configOptions.c_slot3;
  }

  if (configOptions.c_slot4) {
    dataBag['c_slot4'] = configOptions.c_slot4;
  }

  return dataBag;
}

function setNamespace(itemText) {
  return pwNamespace.concat('_' + itemText);
}

function localStorageSessTimeoutName() {
  return setNamespace(sessTimeoutName);
}

function localStorageSessName() {
  return setNamespace(sessName);
}

function extendUserSessionTimeout() {
  localStorage.setItem(localStorageSessTimeoutName(), Date.now().toString());
}

function userSessionID() {
  return localStorage.getItem(localStorageSessName()) ? localStorage.getItem(localStorageSessName()) : '';
}

function sessionExpired() {
  let sessLastTime = localStorage.getItem(localStorageSessTimeoutName());
  return (Date.now() - parseInt(sessLastTime)) > sessTimeout;
}

function flushEvents() {
  if (pwEvents.length > 0) {
    let localEvents = pwEvents; // get a copy
    pwEvents = []; // clear the queue
    let dataBag = {metaData: metaData, eventList: localEvents};
    ajax(configOptions.endpoint, (result) => utils.logInfo(`${analyticsName} Result`, result), JSON.stringify(dataBag));
  }
}

function isIngestedEvent(eventType) {
  const ingested = [CONSTANTS.EVENTS.AUCTION_INIT, CONSTANTS.EVENTS.BID_REQUESTED, CONSTANTS.EVENTS.BID_RESPONSE, CONSTANTS.EVENTS.NO_BID, CONSTANTS.EVENTS.BID_WON, CONSTANTS.EVENTS.BID_TIMEOUT];
  if (ingested.includes(eventType)) {
    return true;
  } else {
    return false;
  }
}

function filterNoBid(data) {
  let newNoBidData = {};

  newNoBidData.auctionId = data.auctionId;
  newNoBidData.bidId = data.bidId;
  newNoBidData.bidderRequestId = data.bidderRequestId;
  newNoBidData.transactionId = data.transactionId;

  return newNoBidData;
}

function filterBidResponse(data) {
  let modified = Object.assign({}, data);
  // clean up some properties we don't track in public version
  if (typeof data.ad !== 'undefined') {
    modified.ad = '';
  }
  if (typeof data.adUrl !== 'undefined') {
    modified.adUrl = '';
  }
  if (typeof data.adserverTargeting !== 'undefined') {
    modified.adserverTargeting = '';
  }
  if (typeof data.ts !== 'undefined') {
    modified.ts = '';
  }
  // clean up a property to make simpler
  if (typeof data.statusMessage !== 'undefined' && data.statusMessage === 'Bid returned empty or error response') {
    modified.statusMessage = 'eoe';
  }
  modified.auctionEnded = auctionEnded;
  return modified;
}

let pubwiseAnalytics = Object.assign(adapter({defaultUrl, analyticsType}), {
  // Override AnalyticsAdapter functions by supplying custom methods
  track({eventType, args}) {
    this.handleEvent(eventType, args);
  }
});

pubwiseAnalytics.handleEvent = function(eventType, data) {
  // we log most events, but some are information
  if (isIngestedEvent(eventType)) {
    utils.logInfo(`${analyticsName} Emitting Event ${eventType} ${pwAnalyticsEnabled}`, data);

    // add data on init to the metadata container
    if (eventType == CONSTANTS.EVENTS.AUCTION_INIT) {
      // record metadata
      metaData = {
        target_site: configOptions.site,
        debug: configOptions.debug ? 1 : 0,
      };
      metaData = enrichWithSessionInfo(metaData);
      metaData = enrichWithCustomSegments(metaData);
      metaData = enrichWithMetrics(metaData);
      metaData = enrichWithUTM(metaData);
    } else if (eventType == CONSTANTS.EVENTS.NO_BID) {
      data = filterNoBid(data);
    } else if (eventType == CONSTANTS.EVENTS.BID_RESPONSE) {
      data = filterBidResponse(data);
    }

    // add all ingested events
    pwEvents.push({
      eventType: eventType,
      args: data
    });
  } else {
    utils.logInfo(`${analyticsName} Skipping Event ${eventType} ${pwAnalyticsEnabled}`, data);
  }

  if (eventType == CONSTANTS.EVENTS.AUCTION_END) {
    auctionEnded = true;
  }

  if (eventType == CONSTANTS.EVENTS.AUCTION_END || eventType == CONSTANTS.EVENTS.BID_WON || auctionEnded === true) {
    // we consider auction_end to to be the end of the auction
    flushEvents();
  }
}

pubwiseAnalytics.storeSessionID = function (userSessID) {
  localStorage.setItem(localStorageSessName(), userSessID);
  utils.logInfo(`${analyticsName} New Session Generated`, userSessID);
};

// ensure a session exists, if not make one, always store it
pubwiseAnalytics.ensureSession = function () {
  if (sessionExpired() === true || userSessionID() === null || userSessionID() === '') {
    expireUtmData();
    this.storeSessionID(utils.generateUUID());
  }
  extendUserSessionTimeout();
  sessionData.sessId = userSessionID();
};

pubwiseAnalytics.adapterEnableAnalytics = pubwiseAnalytics.enableAnalytics;

pubwiseAnalytics.enableAnalytics = function (config) {
  if (config.options.debug === undefined) {
    config.options.debug = utils.debugTurnedOn();
  }
  configOptions = config.options;
  markEnabled();
  this.ensureSession();
  pubwiseAnalytics.adapterEnableAnalytics(config);
};

adaptermanager.registerAnalyticsAdapter({
  adapter: pubwiseAnalytics,
  code: 'pubwise'
});

export default pubwiseAnalytics;
