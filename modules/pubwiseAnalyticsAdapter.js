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
let pubwiseVersion = '3.1';
let pubwiseSchema = 'AVOCET';
let configOptions = {site: '', endpoint: 'https://api.pubwise.io/api/v4/event/default/', debug: '', c_host: '', c_script_type: '', c_slot1: '', c_slot2: '', c_slot3: '', c_slot4: ''};
let pwAnalyticsEnabled = false;
let utmKeys = {utm_source: '', utm_medium: '', utm_campaign: '', utm_term: '', utm_content: ''};

function markEnabled() {
  utils.logInfo(`${analyticsName}Enabled`, configOptions);
  pwAnalyticsEnabled = true;
}

function enrichWithMetrics(dataBag) {
  try {
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
        let itemValue = localStorage.getItem(`pw-${prop}`);
        if (itemValue !== null && itemValue.length !== 0) {
          dataBag[prop] = itemValue;
        }
      }
    } else {
      for (let prop in utmKeys) {
        localStorage.setItem(`pw-${prop}`, utmKeys[prop]);
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

function sendEvent(eventType, data) {
  utils.logInfo(`${analyticsName}Event ${eventType} ${pwAnalyticsEnabled}`, data);

  // put the typical items in the data bag
  let dataBag = {
    eventType: eventType,
    args: data,
    target_site: configOptions.site,
    pubwiseSchema: pubwiseSchema,
    debug: configOptions.debug ? 1 : 0,
  };

  dataBag = enrichWithMetrics(dataBag);
  // for certain events, track additional info
  if (eventType == CONSTANTS.EVENTS.AUCTION_INIT) {
    dataBag = enrichWithUTM(dataBag);
    dataBag = enrichWithCustomSegments(dataBag);
  }

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
    sendEvent(eventType, args);
  }
});

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
