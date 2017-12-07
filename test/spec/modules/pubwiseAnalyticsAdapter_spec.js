import pubwiseAnalytics from 'modules/pubwiseAnalyticsAdapter';
import pubwiseAnalytics0 from 'modules/pubwiseAnalyticsAdapter';
import pubwiseAnalytics1 from 'modules/pubwiseAnalyticsAdapter';
import pubwiseAnalytics2 from 'modules/pubwiseAnalyticsAdapter';
import {expect} from 'chai';

let events = require('src/events');
let adaptermanager = require('src/adaptermanager');
let adaptermanager1 = require('src/adaptermanager');
let constants = require('src/constants.json');

let sendableEvents = [
  {
    name: constants.EVENTS.AUCTION_INIT,
    valid: {timestamp: 1000000000000, auctionId: 'auctiona-test-test-test-testtesttest', timeout: 1000}
  },
  {
    name: constants.EVENTS.BID_REQUESTED,
    valid: {
      auctionId: 'auctiona-test-test-test-testtesttest',
      auctionStart: 1000000000000,
      bidderCode: 'testc',
      bidderRequestId: '13d0a64a59babe',
      bids: [{
        adUnitCode: 'test-test-1000',
        auctionId: 'auctiona-test-test-test-testtesttest',
        bidId: 'thisisabidid',
        bidder: 'testc',
        bidderRequestId: 'thisisabidid',
        params: {siteId: '0000', adSizes: '728x90'},
        sizes: [[728, 90]],
        transactionId: 'transact-test-test-test-testtesttest'
      }, {
        adUnitCode: 'test-test-2000',
        auctionId: 'auctiona-test-test-test-testtesttest',
        bidId: 'thisisabidid',
        bidder: 'testc',
        bidderRequestId: 'thisisabidid',
        params: {siteId: '0000', adSizes: '728x90'},
        sizes: [[728, 90]],
        transactionId: 'transact-test-test-test-testtesttest'
      }],
      doneCbCallCount: 1,
      start: 1000000000000,
      timeout: 1000
    }
  },
  {
    name: constants.EVENTS.BID_RESPONSE,
    valid: {
      ad: '<div>test ad only</div>',
      adId: '45ccb8c7da9a63',
      adUnitCode: 'test-test-1000',
      adserverTargeting: {hb_bidder: 'jcm', hb_adid: '45ccb8c7da9a63', hb_pb: '1.58', hb_size: '728x90'},
      auctionId: 'testaaaa-test-test-test-testtesttest',
      bidder: 'jcm',
      bidderCode: 'jcm',
      cpm: 1.5875999,
      creativeId: 'jcm45ccb8c7da9a63',
      currency: 'USD',
      height: 90,
      mediaType: 'banner',
      netRevenue: true,
      pbAg: '1.55',
      pbCg: '',
      pbDg: '1.58',
      pbHg: '1.58',
      pbLg: '1.50',
      pbMg: '1.50',
      requestTimestamp: 1511901262899,
      responseTimestamp: 1511901262985,
      size: '728x90',
      statusMessage: 'Bid available',
      timeToRespond: 86,
      ttl: 60,
      width: 728
    }
  },
  {
    name: constants.EVENTS.BID_WON,
    valid: {
      auctionId: 'testaaaa-test-test-test-testtesttest',
      adUnitCode: 'test-test-1000'
    }
  },
  {
    name: constants.EVENTS.BID_TIMEOUT,
    valid: {
      auctionId: 'testaaaa-test-test-test-testtesttest'
    }
  }
];

let nonSendableEvents = [
  {
    name: constants.EVENTS.SET_TARGETING,
    valid: {
      auctionId: 'testaaaa-test-test-test-testtesttest'
    }
  },
  {
    name: constants.EVENTS.AUCTION_END,
    valid: {
      auctionId: 'testaaaa-test-test-test-testtesttest'
    }
  }
];

let ignoreTestEvents = [{
  name: constants.EVENTS.BID_REQUESTED,
  valid: {
    auctionId: 'auctiona-test-test-test-testtesttest',
    auctionStart: 1000000000000,
    bidderCode: 'testc',
    bidderRequestId: '13d0a64a59babe',
    bids: [{
      adUnitCode: 'test-test-1000',
      auctionId: 'auctiona-test-test-test-testtesttest',
      bidId: 'thisisabidid',
      bidder: 'testc',
      bidderRequestId: 'thisisabidid',
      params: {siteId: '0000', adSizes: '728x90'},
      sizes: [[728, 90]],
      transactionId: 'transact-test-test-test-testtesttest'
    }, {
      adUnitCode: 'test-test-2000',
      auctionId: 'auctiona-test-test-test-testtesttest',
      bidId: 'thisisabidid',
      bidder: 'testc',
      bidderRequestId: 'thisisabidid',
      params: {siteId: '0000', adSizes: '728x90'},
      sizes: [[728, 90]],
      transactionId: 'transact-test-test-test-testtesttest'
    }],
    doneCbCallCount: 1,
    start: 1000000000000,
    timeout: 1000
  }
}, {
  name: constants.EVENTS.BID_RESPONSE,
  valid: {
    ad: '<div>test ad only</div>',
    adId: '45ccb8c7da9a63',
    adUnitCode: 'test-test-1000',
    adserverTargeting: {hb_bidder: 'jcm', hb_adid: '45ccb8c7da9a63', hb_pb: '1.58', hb_size: '728x90'},
    auctionId: 'testaaaa-test-test-test-testtesttest',
    bidder: 'jcm',
    bidderCode: 'jcm',
    cpm: 1.5875999,
    creativeId: 'jcm45ccb8c7da9a63',
    currency: 'USD',
    height: 90,
    mediaType: 'banner',
    netRevenue: true,
    pbAg: '1.55',
    pbCg: '',
    pbDg: '1.58',
    pbHg: '1.58',
    pbLg: '1.50',
    pbMg: '1.50',
    requestTimestamp: 1511901262899,
    responseTimestamp: 1511901262985,
    size: '728x90',
    statusMessage: 'Bid available',
    timeToRespond: 86,
    ttl: 60,
    width: 728
  }
}, {
  name: constants.EVENTS.BID_WON,
  valid: {
    auctionId: 'testaaaa-test-test-test-testtesttest',
    adUnitCode: 'test-test-1000'
  }
}, {
  name: constants.EVENTS.BID_REQUESTED,
  valid: {
    auctionId: 'auctiona-test-test-test-testtesttest',
    auctionStart: 1000000000000,
    bidderCode: 'testc',
    bidderRequestId: '13d0a64a59babe',
    bids: [{
      adUnitCode: 'test-test-noignore',
      auctionId: 'auctiona-test-test-test-testtesttest',
      bidId: 'thisisabidid',
      bidder: 'testc',
      bidderRequestId: 'thisisabidid',
      params: {siteId: '0000', adSizes: '728x90'},
      sizes: [[728, 90]],
      transactionId: 'transact-test-test-test-testtesttest'
    }, {
      adUnitCode: 'test-test-2000',
      auctionId: 'auctiona-test-test-test-testtesttest',
      bidId: 'thisisabidid',
      bidder: 'testc',
      bidderRequestId: 'thisisabidid',
      params: {siteId: '0000', adSizes: '728x90'},
      sizes: [[728, 90]],
      transactionId: 'transact-test-test-test-testtesttest'
    }],
    doneCbCallCount: 1,
    start: 1000000000000,
    timeout: 1000
  }
}, {
  name: constants.EVENTS.BID_RESPONSE,
  valid: {
    ad: '<div>test ad only</div>',
    adId: '45ccb8c7da9a63',
    adUnitCode: 'test-test-noignore',
    adserverTargeting: {hb_bidder: 'jcm', hb_adid: '45ccb8c7da9a63', hb_pb: '1.58', hb_size: '728x90'},
    auctionId: 'testaaaa-test-test-test-testtesttest',
    bidder: 'jcm',
    bidderCode: 'jcm',
    cpm: 1.5875999,
    creativeId: 'jcm45ccb8c7da9a63',
    currency: 'USD',
    height: 90,
    mediaType: 'banner',
    netRevenue: true,
    pbAg: '1.55',
    pbCg: '',
    pbDg: '1.58',
    pbHg: '1.58',
    pbLg: '1.50',
    pbMg: '1.50',
    requestTimestamp: 1511901262899,
    responseTimestamp: 1511901262985,
    size: '728x90',
    statusMessage: 'Bid available',
    timeToRespond: 86,
    ttl: 60,
    width: 728
  }
}, {
  name: constants.EVENTS.BID_WON,
  valid: {
    auctionId: 'testaaaa-test-test-test-testtesttest',
    adUnitCode: 'test-test-noignore'
  }
}, {
  name: constants.EVENTS.BID_REQUESTED,
  valid: {
    auctionId: 'auctiona-test-test-test-testtesttest',
    auctionStart: 1000000000000,
    bidderCode: 'testc',
    bidderRequestId: '13d0a64a59babe',
    bids: [{
      adUnitCode: 'test-test-1000',
      auctionId: 'auctiona-test-test-test-testtesttest',
      bidId: 'thisisabidid',
      bidder: 'testc',
      bidderRequestId: 'thisisabidid',
      params: {siteId: '0000', adSizes: '728x90'},
      sizes: [[728, 90]],
      transactionId: 'transact-test-test-test-testtesttest'
    }],
    doneCbCallCount: 1,
    start: 1000000000000,
    timeout: 1000
  }
}];

describe('Testing PubWise', function () {
  adaptermanager.registerAnalyticsAdapter({
    code: 'pubwise',
    adapter: pubwiseAnalytics
  });

  adaptermanager.enableAnalytics([{
    provider: 'pubwise',
    options: {
      site: ['test-test-test-test0']
    }
  }]);

  describe('Sessions Are Managed', function () {
    beforeEach(() => {
      sinon.spy(pubwiseAnalytics, 'storeSessionID');
    });

    afterEach(() => {
      pubwiseAnalytics.storeSessionID.restore();
    });

    describe('If no Session Exists then One Is Created', function () {
      it(`Calls StoreSessionID to add`, function () {
        localStorage.removeItem('pubwise_sess_id');
        localStorage.removeItem('pubwise_sess_timeout');
        events.emit(constants.EVENTS.AUCTION_INIT, {});
        sinon.assert.callCount(pubwiseAnalytics.storeSessionID, 1);
      });
    });

    describe('If Session Expires then a New One Is Created', function () {
      it(`Calls storeSessionID to Add`, function () {
        let defaultTimer = 1800000;
        localStorage.setItem('pubwise_sess_timeout', Date.now() - 1800000 - 10); // 10 extra seconds to expire it
        events.emit(constants.EVENTS.AUCTION_INIT, {});
        sinon.assert.callCount(pubwiseAnalytics.storeSessionID, 1);
      });
    });

    describe('ensureSession is only called for certain events', function () {
      it(`ensureSession is Called on AUCTION_INIT and AUCTION_END`, function () {
        sinon.spy(pubwiseAnalytics, 'ensureSession');
        events.emit(constants.EVENTS.AUCTION_INIT, {});
        events.emit(constants.EVENTS.AUCTION_END, {});
        sinon.assert.callCount(pubwiseAnalytics.ensureSession, 2);
        pubwiseAnalytics.ensureSession.restore();
      });

      it(`but ensureSessions is not called for other events`, function () {
        sinon.spy(pubwiseAnalytics, 'ensureSession');
        events.emit(constants.EVENTS.BID_REQUESTED, {});
        events.emit(constants.EVENTS.BID_RESPONSE, {});
        events.emit(constants.EVENTS.BID_WON, {});
        sinon.assert.callCount(pubwiseAnalytics.ensureSession, 0);
        pubwiseAnalytics.ensureSession.restore();
      });
    });
  });

  describe('track events', function () {
    let spyTrackAnalytics;

    beforeEach(() => {
      spyTrackAnalytics = sinon.spy(pubwiseAnalytics, 'track');
    });

    afterEach(() => {
      spyTrackAnalytics.restore();
    });

    sendableEvents.forEach(function(element) {
      it('should track ' + element.name, function () {
        events.emit(element.name, {});
        expect(spyTrackAnalytics.callCount).to.equal(1);
      });
    });

    nonSendableEvents.forEach(function(element) {
      it('should track ' + element.name, function () {
        events.emit(element.name, {});
        expect(spyTrackAnalytics.callCount).to.equal(1);
      });
    });
  });

  describe('Invalid events should be sent to invalidAnlyticsEvent', function () {
    beforeEach(() => {
      sinon.spy(pubwiseAnalytics, 'invalidAnalyticsEvent');
    });

    afterEach(() => {
      pubwiseAnalytics.invalidAnalyticsEvent.restore();
    });

    sendableEvents.forEach(function(element) {
      it(`${element.name} is invalid`, function () {
        events.emit(element.name, {});
        sinon.assert.callCount(pubwiseAnalytics.invalidAnalyticsEvent, 1);
      });
    });

    nonSendableEvents.forEach(function(element) {
      it(`${element.name} is invalid`, function () {
        events.emit(element.name, {});
        sinon.assert.callCount(pubwiseAnalytics.invalidAnalyticsEvent, 1);
      });
    });
  });

  describe('succeed events', function () {
    beforeEach(() => {
      sinon.spy(pubwiseAnalytics, 'sendEventToEndpoint');
    });

    afterEach(() => {
      pubwiseAnalytics.sendEventToEndpoint.restore();
    });

    sendableEvents.forEach(function(element) {
      it(`valid ${element.name} should be sent`, function () {
        events.emit(element.name, element.valid);
        sinon.assert.callCount(pubwiseAnalytics.sendEventToEndpoint, 1);
      });
    });
  });

  describe('Some Valid Events are Filtered Events', function () {
    beforeEach(() => {
      sinon.spy(pubwiseAnalytics, 'filterAnalyticsEvent');
    });

    afterEach(() => {
      pubwiseAnalytics.filterAnalyticsEvent.restore();
    });

    nonSendableEvents.forEach(function(element) {
      it(`${element.name} should be filtered`, function () {
        events.emit(element.name, element.valid);
        sinon.assert.callCount(pubwiseAnalytics.filterAnalyticsEvent, 1);
      });
    });
  });

  describe('When Ad Units are Ignored Init Always Goes', function () {
    before(() => {
      pubwiseAnalytics.setConfig({
        provider: 'pubwise',
        options: {
          site: ['test-test-test-test4'],
          ignoreAdUnitCodes: ['test-test-1000']
        }
      });
    });

    beforeEach(() => {
      sinon.spy(pubwiseAnalytics, 'sendEventToEndpoint');
    });

    afterEach(() => {
      pubwiseAnalytics.sendEventToEndpoint.restore();
    });

    it(`Init should always go`, function () {
      events.emit(sendableEvents[0].name, sendableEvents[0].valid);
      sinon.assert.callCount(pubwiseAnalytics.sendEventToEndpoint, 1);
    });
  });

  describe('When Events are for Ignored AdUnitCodes the event is Ignored', function () {
    beforeEach(() => {
      sinon.spy(pubwiseAnalytics, 'ignoreAnalyticsEvent');
    });

    afterEach(() => {
      pubwiseAnalytics.ignoreAnalyticsEvent.restore();
    });

    // bidResponse data is for test-test-1000 and should be filtered
    it(`${sendableEvents[2].name} should be ignored`, function () {
      events.emit(sendableEvents[2].name, sendableEvents[2].valid);
      sinon.assert.callCount(pubwiseAnalytics.ignoreAnalyticsEvent, 1);
    });

    // bidResponse data is for test-test-1000 and should be filtered
    it(`${sendableEvents[3].name} should be ignored`, function () {
      events.emit(sendableEvents[3].name, sendableEvents[3].valid);
      sinon.assert.callCount(pubwiseAnalytics.ignoreAnalyticsEvent, 1);
    });
  });

  describe('When BidRequested Events are for ONLY Ignored AdUnitCodes the event is DEEMED INVALID', function () {
    beforeEach(() => {
      sinon.spy(pubwiseAnalytics, 'invalidAnalyticsEvent');
    });

    afterEach(() => {
      pubwiseAnalytics.invalidAnalyticsEvent.restore();
    });

    // ignoreTestEvents 6 - bidRequested for only test-test-1000
    it(`${ignoreTestEvents[6].name} should be ignored`, function () {
      events.emit(ignoreTestEvents[6].name, ignoreTestEvents[6].valid);
      sinon.assert.callCount(pubwiseAnalytics.invalidAnalyticsEvent, 1);
    });
  });
});
