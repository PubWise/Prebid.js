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
const analyticsName = 'PubWise Analytics: ';
let defaultUrl = 'https://api.pubwise.io/api/v4/event/default/';
let pwVersion = '2.3.0';
let configOptions = {site: '', endpoint: 'https://api.pubwise.io/api/v4/event/default/', ignoreAdUnitCodes: [], debug: ''};
let pwAnalyticsEnabled = false;
let utmKeys = {utm_source: '', utm_medium: '', utm_campaign: '', utm_term: '', utm_content: ''};
let sessionData = {sessionId: ''};
let pwNamespace = 'pubwise';
let targetSet = 0;
let initSent = false;
let sessTimeout = 60 * 30 * 1000; // 30 minutes, G Analytics default session length
let sessName = 'sess_id';
let sessTimeoutName = 'sess_timeout';

function markEnabled() {
  utils.logInfo(`${analyticsName}Enabled`, configOptions);
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

function enrichWithEnvironmentInfo(dataBag) {
  try {
    dataBag['target_site'] = configOptions.site;
    dataBag['debug'] = configOptions.debug ? 1 : 0;
    dataBag['pw_version'] = pwVersion;
  } catch (e) {
    dataBag['error_env'] = 1;
  }

  return dataBag;
}

function enrichWithMetrics(dataBag) {
  try {
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
      if (utmKeys[prop] != '') {
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
    utils.logInfo(`${analyticsName}Error`, e);
    dataBag['error_utm'] = 1;
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
  localStorage.setItem(localStorageSessTimeoutName(), Date.now());
}

function userSessionID() {
  return localStorage.getItem(localStorageSessName()) ? localStorage.getItem(localStorageSessName()) : '';
}

function sessionExpired() {
  let sessLastTime = localStorage.getItem(localStorageSessTimeoutName());
  return (Date.now() - sessLastTime) > sessTimeout;
}

function isValidEvent(eventType, data) {
  let validEvent = true;
  if (typeof data !== 'undefined' && typeof data.args !== 'undefined' && (typeof data.args.auctionId !== 'undefined' || typeof data.args.requestId !== 'undefined')) {
    if (eventType == CONSTANTS.EVENTS.BID_REQUESTED && (typeof data.args.bids === 'undefined' || data.args.bids.length === 0)) {
      validEvent = false;
    }
  } else {
    validEvent = false;
  }

  return validEvent;
}

function isUnitIgnored(eventType, data) {
  let ignoreStatus = false;
  if (typeof data !== 'undefined' && typeof data.args !== 'undefined') {
    if (eventType == CONSTANTS.EVENTS.BID_RESPONSE ||
      eventType == CONSTANTS.EVENTS.BID_ADJUSTMENT ||
      eventType == CONSTANTS.EVENTS.BID_WON) {
      if (typeof data.args.adUnitCode !== 'undefined' && configOptions.ignoreAdUnitCodes.includes(data.args.adUnitCode)) {
        // no data change needed
        ignoreStatus = true;
      }
    }
  }
  return ignoreStatus;
}

function removeIgnoredBids(eventType, data) {
  if (typeof data !== 'undefined' && typeof data.args !== 'undefined') {
    if (eventType == CONSTANTS.EVENTS.BID_REQUESTED) {
      if (typeof data.args.bids !== 'undefined') {
        for (var i = data.args.bids.length; i--;) {
          if (configOptions.ignoreAdUnitCodes.includes(data.args.bids[i].adUnitCode)) {
            // remove the bid requests that are ignored, valid checks will handle creation of invalid data later
            data.args.bids.splice(i, 1);
            utils.logInfo(`${analyticsName}Event ${eventType} Ignore Removed`, data);
          }
        }
      }
    }
  }

  return data;
}

let pubwiseAnalytics = Object.assign(adapter(
  {
    defaultUrl,
    analyticsType
  }),
{
  // Override AnalyticsAdapter functions by supplying custom methods
  track({eventType, args}) {
    utils.logInfo(`${analyticsName} ${eventType} track`);
    this.handleEvent(eventType, args);
  }
});

pubwiseAnalytics.handleEvent = function(eventType, data) {
  utils.logInfo(`${analyticsName}Event ${eventType} ${pwAnalyticsEnabled}`, data);

  // put the typical items in the data bag
  let dataBag = {eventType: eventType, args: data};

  dataBag = enrichWithEnvironmentInfo(dataBag);

  // handle bid response settings
  if (eventType == CONSTANTS.EVENTS.SET_TARGETING) {
    targetSet = 1;
  }

  // handle bid response settings
  if (eventType == CONSTANTS.EVENTS.BID_RESPONSE) {
    dataBag['targetSet'] = targetSet;
  }

  if (eventType == CONSTANTS.EVENTS.AUCTION_END) {
    this.ensureSession();
  }

  // for certain events, track additional info
  if (eventType == CONSTANTS.EVENTS.AUCTION_INIT) {
    this.ensureSession();
    dataBag = enrichWithSessionInfo(dataBag);
    dataBag = enrichWithMetrics(dataBag);
    dataBag = enrichWithUTM(dataBag);

    // look at the initialization state
    if (initSent === false) {
      if (typeof PREBID_TIMEOUT !== 'undefined') {
        dataBag['targetTimeout'] = PREBID_TIMEOUT;
      } else {
        dataBag['targetTimeout'] = 'NA';
      }
    } else {
      dataBag['targetTimeout'] = '';
    }
    initSent = true;
  }

  // first we remove bids, then test for validity then continuing
  dataBag = removeIgnoredBids(eventType, dataBag);

  if (isValidEvent(eventType, dataBag) === true) {
    if (isUnitIgnored(eventType, dataBag) === false) {
      if (eventType != CONSTANTS.EVENTS.ADD_AD_UNITS && eventType != CONSTANTS.EVENTS.SET_TARGETING && eventType != CONSTANTS.EVENTS.REQUEST_BIDS && eventType != CONSTANTS.EVENTS.BID_ADJUSTMENT && eventType != CONSTANTS.EVENTS.AUCTION_END) {
        this.sendEventToEndpoint(configOptions.endpoint, dataBag);
      } else {
        this.filterAnalyticsEvent(eventType, dataBag);
      }
    } else {
      this.ignoreAnalyticsEvent(eventType, dataBag);
    }
  } else {
    this.invalidAnalyticsEvent(eventType, dataBag);
  }
};

pubwiseAnalytics.sendEventToEndpoint = function(endpoint, dataBag) {
  ajax(endpoint, (result) => utils.logInfo(`${analyticsName}Event Status is Sent`, result), JSON.stringify(dataBag));
};

pubwiseAnalytics.invalidAnalyticsEvent = function (eventType, dataBag) {
  this.logEventDisposition('Invalid', eventType, dataBag);
};

pubwiseAnalytics.filterAnalyticsEvent = function (eventType, dataBag) {
  this.logEventDisposition('Filtered', eventType, dataBag);
};

pubwiseAnalytics.ignoreAnalyticsEvent = function (eventType, dataBag) {
  this.logEventDisposition('Ignored', eventType, dataBag);
};

pubwiseAnalytics.logEventDisposition = function (disposition, eventType, dataBag) {
  utils.logInfo(`${analyticsName}Event Status is ${disposition} for ${eventType}`, dataBag);
};

pubwiseAnalytics.setConfig = function (config) {
  if (config.options.debug === undefined) {
    config.options.debug = utils.debugTurnedOn();
  }
  configOptions = config.options;

  if (typeof configOptions.ignoreAdUnitCodes === 'undefined') {
    configOptions.ignoreAdUnitCodes = [];
  }
};

pubwiseAnalytics.storeSessionID = function (userSessID) {
  localStorage.setItem(localStorageSessName(), userSessID);
};

// ensure a session exists, if not make one, always store it
pubwiseAnalytics.ensureSession = function () {
  // namespace.concat();
  if (sessionExpired() === true) {
    let userSessID = utils.generateUUID();
    this.storeSessionID(userSessID);
  }
  sessionData.sessId = userSessionID();
  extendUserSessionTimeout();
};

pubwiseAnalytics.adapterEnableAnalytics = pubwiseAnalytics.enableAnalytics;

pubwiseAnalytics.enableAnalytics = function (config) {
  this.setConfig(config);
  markEnabled();
  pubwiseAnalytics.adapterEnableAnalytics(config);
};

adaptermanager.registerAnalyticsAdapter({
  adapter: pubwiseAnalytics,
  code: 'pubwise'
});

export default pubwiseAnalytics;
