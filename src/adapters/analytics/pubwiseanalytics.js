import {ajax} from 'src/ajax';
import adapter from 'AnalyticsAdapter';
import CONSTANTS from 'src/constants.json';
const utils = require('../../utils');

/****
 * PubWise.io Analytics
 * Contact: support@pubwise.io
 * Developer: Stephen Johnston
 */

const analyticsType = 'endpoint';
let target_url = 'https://staging.api.pubwise.io';
let config_options = {site: 'unknown',endpoint:target_url};
let pw_version = '2.2';
let event_queue = {'event':[]};
let pwa_enabled = false;

function sendEvent(event_data) {
  utils.logInfo('PubWise Analytics: Sending Event',event_data);
  event_data.target_site = config_options.site;
  ajax(config_options.endpoint,(result) => utils.logInfo('PubWise Analytics: Result', result), JSON.stringify(event_data));
}

function sendQueuedEvents(){
  if (event_queue.event.length){
    utils.logInfo('PubWise Analytics: Pushing Queued Events',event_queue.event.length);
  }
}

function queueEvent(event_data) {
  utils.logInfo('PubWise Analytics: Event Queued',event_data);
  event_queue.event.push(event_data);
}

let pubwiseAnalytics = Object.assign(adapter(
  {
    target_url,
    analyticsType
  }
  ),
  {
    // Override AnalyticsAdapter functions by supplying custom methods
    track({eventType, args}) {
      utils.logInfo('PubWise Analytics: Tracking Event ' + eventType, config_options);

      let eventDataLayer = [];

      let event_data = {
        eventType,
        args,
        pw_version,
        eventDataLayer
      };

      if (pwa_enabled === false){
        // queue this event
        queueEvent(event_data);
      }else{
        // flush any queued events (there may be none)
        sendQueuedEvents();
        // send this event
        sendEvent(event_data);
      }
    }
  });

pubwiseAnalytics.localEnableAnalytics = pubwiseAnalytics.enableAnalytics;

pubwiseAnalytics.enableAnalytics = function (config) {
  config_options = config.options;
  utils.logInfo('PubWise Analytics: Initialized', config_options);
  pwa_enabled = true;
  pubwiseAnalytics.localEnableAnalytics(config);
};

export default pubwiseAnalytics;
