/**
 * This module adds the PubWise.io provider to the Real Time Data module (rtdModule)
 * The {@link module:modules/realTimeData} module is required
 * The module allows page level traffic quality assessments as well as audience ad targeting information
 * @requires module:modules/realTimeData
 */

import * as utils from '../src/utils.js';
import { submodule } from '../src/hook.js';
import { getGlobal } from '../src/prebidGlobal.js';
import { ajaxBuilder } from '../src/ajax.js';

let _moduleParams = {};
let _assessmentData = {quality: {result: 0}};

function init(provider, userConsent) {
  const win = window.top;
  const doc = win.document;

  _moduleParams = provider.params;
  if (_moduleParams && _moduleParams.siteId) {
    let paramData = {
      ...{
        siteId: _moduleParams.siteId,
        pageUrl: `${doc.location.protocol}//${doc.location.host}${doc.location.pathname}`,
      },
      ...(document.referrer ? {r: document.referrer} : {}),
      ...(document.title ? {at: document.title} : {})
    };
    getAssessment(`${_moduleParams.endpoint}/traffic/quality/?${toUrlParams(paramData)}`);
  } else {
    utils.logError('missing params for PubWise audience rtd module');
  }
  return true;
}

/**
 * serialize object and return query params string
 * @param {Object} data
 * @return {string}
 */
function toUrlParams(data) {
  return Object.keys(data)
    .map(key => key + '=' + encodeURIComponent(data[key]))
    .join('&');
}

function getAssessment(url) {
  let ajax = ajaxBuilder();

  ajax(url,
    {
      success: function (response, req) {
        if (req.status === 200) {
          try {
            const data = JSON.parse(response);
            if (data && data.quality) {
              setData({quality: data.quality});
            } else {
              setData({});
            }
          } catch (err) {
            utils.logError('unable to parse assessment data');
            setData({})
          }
        } else if (req.status === 204) {
          // unrecognized site key
          setData({});
        }
      },
      error: function () {
        setData({});
        utils.logError('unable to get assessment data');
      }
    }
  );
}

function setData(data) {
  _assessmentData = data;
}

function processBidRequestData(reqBidsConfigObj, onDone, config, userConsent) {
  if (_assessmentData.quality == 1) {
    const adUnits = reqBidsConfigObj.adUnits || getGlobal().adUnits;
    adUnits.forEach(adUnit => {
      delete adUnit.bids;
    });
    reqBidsConfigObj.adUnitCodes = {};
    reqBidsConfigObj.timeout = 1;
  }
  onDone();
}

export const pubwiseRtdSubmodule = {
  name: 'pubwise',
  init: init,
  getBidRequestData: processBidRequestData
};

submodule('realTimeData', pubwiseRtdSubmodule);
