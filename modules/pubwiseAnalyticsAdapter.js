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
let pubwiseVersion = '2.5';
let configOptions = {site: '', endpoint: 'https://api.pubwise.io/api/v4/event/default/', debug: ''};
let pwAnalyticsEnabled = false;
let utmKeys = {utm_source: '', utm_medium: '', utm_campaign: '', utm_term: '', utm_content: ''};
let sessionData = {sessionId: ''};
let pwNamespace = 'pubwise';
let pwEvents = [];
let metaData = {};
let lateEvent = false;
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

function enrichWithCustomSegments(dataBag) {
  // c_site: '', c_script_type: '', c_slot1: '', c_slot2: '', c_slot3: '', c_slot4: ''
  if (configOptions.c_host != '') {
    dataBag['c_host'] = configOptions.c_host;
  }

  if (configOptions.c_script_type != '') {
    dataBag['c_script_type'] = configOptions.c_script_type;
  }

  if (configOptions.c_slot1 != '') {
    dataBag['c_slot1'] = configOptions.c_slot1;
  }

  if (configOptions.c_slot2 != '') {
    dataBag['c_slot2'] = configOptions.c_slot2;
  }

  if (configOptions.c_slot3 != '') {
    dataBag['c_slot3'] = configOptions.c_slot3;
  }

  if (configOptions.c_slot4 != '') {
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
  localStorage.setItem(localStorageSessTimeoutName(), Date.now());
}

function userSessionID() {
  return localStorage.getItem(localStorageSessName()) ? localStorage.getItem(localStorageSessName()) : '';
}

function sessionExpired() {
  let sessLastTime = localStorage.getItem(localStorageSessTimeoutName());
  return (Date.now() - sessLastTime) > sessTimeout;
}

function flushEvents() {
  let localEvents = pwEvents; // get a copy
  pwEvents = []; // clear the queue
  let dataBag = {metaData: metaData, eventList: localEvents};
  ajax(configOptions.endpoint, (result) => utils.logInfo(`${analyticsName}Result`, result), JSON.stringify(dataBag));
}

let pubwiseAnalytics = Object.assign(adapter(
  {
    defaultUrl,
    analyticsType
  }),
  {
    // Override AnalyticsAdapter functions by supplying custom methods
    track({eventType, args}) {
      this.handleEvent(eventType, args);
    }
  });

pubwiseAnalytics.handleEvent = function(eventType, data) {
  utils.logInfo(`${analyticsName} Emitting Event ${eventType} ${pwAnalyticsEnabled}`, data);

  // we log most events, but some are information
  if (eventType != CONSTANTS.EVENTS.SET_TARGETING && eventType != CONSTANTS.EVENTS.ADD_AD_UNITS && eventType != CONSTANTS.EVENTS.REQUEST_BIDS && eventType != CONSTANTS.EVENTS.AUCTION_END) {
    // add data on init to the metadata container
    if (eventType == CONSTANTS.EVENTS.AUCTION_INIT) {
      this.ensureSession();
      // record metadata
      metaData = {
        target_site: configOptions.site,
        debug: configOptions.debug ? 1 : 0,
      };
      metaData = enrichWithSessionInfo(metaData);
      metaData = enrichWithCustomSegments(metaData);
      metaData = enrichWithMetrics(metaData);
      metaData = enrichWithUTM(metaData);
    }

    if (eventType == CONSTANTS.EVENTS.AUCTION_END) {
      lateEvent = true;
    }

    // add all events until SET_TARGETING to the monolithic event handler
    pwEvents.push({
      eventType: eventType,
      args: data
    });
  }

  if (eventType == CONSTANTS.EVENTS.SET_TARGETING || eventType == CONSTANTS.EVENTS.BID_WON || lateEvent == true) {
    // we consider auction_end to to be the end of the auction
    flushEvents();
  }
}

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
  if (config.options.debug === undefined) {
    config.options.debug = utils.debugTurnedOn();
  }
  configOptions = config.options;
  markEnabled();
  pubwiseAnalytics.adapterEnableAnalytics(config);
};

adaptermanager.registerAnalyticsAdapter({
  adapter: pubwiseAnalytics,
  code: 'pubwise'
});

export default pubwiseAnalytics;
