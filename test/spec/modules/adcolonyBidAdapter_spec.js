// import or require modules necessary for the test, e.g.:

import {expect} from 'chai';
import {spec} from 'modules/adcolonyBidAdapter.js';
import {_checkMediaType} from 'modules/adcolonyBidAdapter.js'; // this is exported only for testing so maintaining the JS convention of _ to indicate the intent
import {_parseAdSlot} from 'modules/adcolonyBidAdapter.js'; // this is exported only for testing so maintaining the JS convention of _ to indicate the intent
import * as utils from 'src/utils.js';

const sampleRequestBanner = {
  'id': '6c148795eb836a',
  'tagid': 'div-gpt-ad-1460505748561-0',
  'bidfloor': 1,
  'secure': 1,
  'bidfloorcur': 'USD',
  'banner': {
    'w': 300,
    'h': 250,
    'format': [
      {
        'w': 300,
        'h': 600
      }
    ],
    'pos': 0,
    'topframe': 1
  }
};

const sampleRequest = {
  'at': 1,
  'cur': [
    'USD'
  ],
  'imp': [
    sampleRequestBanner,
    {
      'id': 1,
      'tagid': 'div-gpt-ad-1460505748561-1',
      'secure': 1,
      'bidfloorcur': 'USD',
      'native': {
        'request': '{"assets":[{"id":1,"required":1,"title":{"len":80}},{"id":5,"required":1,"data":{"type":2}},{"id":2,"required":1,"img":{"type":{"ID":2,"KEY":"image","TYPE":0},"w":150,"h":50}},{"id":4,"required":1,"data":{"type":1}}]}'
      }
    }
  ],
  'site': {
    'page': 'http://localhost:9999/integrationExamples/gpt/hello_world.html?pbjs_debug=true',
    'ref': 'http://localhost:9999/integrationExamples/gpt/hello_world.html?pbjs_debug=true',
    'publisher': {
      'id': 'xxxxxx'
    }
  },
  'device': {
    'ua': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/86.0.4240.198 Safari/537.36',
    'js': 1,
    'dnt': 0,
    'h': 600,
    'w': 800,
    'language': 'en-US',
    'geo': {
      'lat': 33.91989876432274,
      'lon': -84.38897708175764
    }
  },
  'user': {
    'gender': 'M',
    'geo': {
      'lat': 33.91989876432274,
      'lon': -84.38897708175764
    },
    'yob': 2000
  },
  'test': 0,
  'ext': {
    'pw-ext': {
      'version': '0.0.1',
      'origImpressionId': ''
    }
  },
  'source': {
    'tid': '2c8cd034-f068-4419-8c30-f07292c0d17b'
  }
};

const sampleValidBannerBidRequest = {
  'bidder': 'adcolony',
  'params': {
    'siteId': 'xxxxxx',
    'appId': 'xxxxxx',
    'bundleId': 'ABCBundle',
    'bidFloor': '1.00',
    'currency': 'USD',
    'gender': 'M',
    'lat': '33.91989876432274',
    'lon': '-84.38897708175764',
    'yob': '2000',
    'bcat': ['IAB25-3', 'IAB26-1', 'IAB26-2', 'IAB26-3', 'IAB26-4'],
  },
  'gdprConsent': {
    'consentString': 'BOEFEAyOEFEAyAHABDENAI4AAAB9vABAASA',
    'gdprApplies': 1,
  },
  'uspConsent': 1,
  'crumbs': {
    'pubcid': '9a62f261-3c0b-4cc8-8db3-a72ae86ec6ba'
  },
  'fpd': {
    'context': {
      'adServer': {
        'name': 'gam',
        'adSlot': '/19968336/header-bid-tag-0'
      },
      'pbAdSlot': '/19968336/header-bid-tag-0'
    }
  },
  'mediaTypes': {
    'banner': {
      'sizes': [
        [
          300,
          250
        ],
        [
          300,
          600
        ]
      ]
    }
  },
  'adUnitCode': 'div-gpt-ad-1460505748561-0',
  'transactionId': '2001a8b2-3bcf-417d-b64f-92641dae21e0',
  'sizes': [
    [
      300,
      250
    ],
    [
      300,
      600
    ]
  ],
  'bidId': '6c148795eb836a',
  'bidderRequestId': '18a45bff5ff705',
  'auctionId': '9f20663c-4629-4b5c-bff6-ff3aa8319358',
  'src': 'client',
  'bidRequestsCount': 1,
  'bidderRequestsCount': 1,
  'bidderWinsCount': 0
};

const sampleValidBidRequests = [
  sampleValidBannerBidRequest,
  {
    'bidder': 'adcolony',
    'params': {
      'siteId': 'xxxxxx',
      'appId': 'xxxxxx',
      'bundleId': 'ABCBundle'
    },
    'crumbs': {
      'pubcid': '9a62f261-3c0b-4cc8-8db3-a72ae86ec6ba'
    },
    'nativeParams': {
      'title': {
        'required': true,
        'len': 80
      },
      'body': {
        'required': true
      },
      'image': {
        'required': true,
        'sizes': [
          150,
          50
        ]
      },
      'sponsoredBy': {
        'required': true
      },
      'icon': {
        'required': false
      }
    },
    'fpd': {
      'context': {
        'adServer': {
          'name': 'gam',
          'adSlot': '/19968336/header-bid-tag-0'
        },
        'pbAdSlot': '/19968336/header-bid-tag-0'
      }
    },
    'mediaTypes': {
      'native': {
        'title': {
          'required': true,
          'len': 80
        },
        'body': {
          'required': true
        },
        'image': {
          'required': true,
          'sizes': [
            150,
            50
          ]
        },
        'sponsoredBy': {
          'required': true
        },
        'icon': {
          'required': false
        }
      }
    },
    'adUnitCode': 'div-gpt-ad-1460505748561-1',
    'transactionId': '2c8cd034-f068-4419-8c30-f07292c0d17b',
    'sizes': [],
    'bidId': '6c148795eb836a',
    'bidderRequestId': '18a45bff5ff705',
    'auctionId': '9f20663c-4629-4b5c-bff6-ff3aa8319358',
    'src': 'client',
    'bidRequestsCount': 1,
    'bidderRequestsCount': 1,
    'bidderWinsCount': 0
  }
]

const sampleBidderBannerRequest = {
  'bidder': 'adcolony',
  'params': {
    'siteId': 'xxxxxx',
    'appId': 'xxxxxx',
    'bundleId': 'ABCBundle',
    'height': 250,
    'width': 300,
    'gender': 'M',
    'yob': '2000',
    'lat': '33.91989876432274',
    'lon': '-84.38897708175764',
    'bidFloor': '1.00',
    'currency': 'USD',
    'adSlot': '',
    'adUnit': 'div-gpt-ad-1460505748561-0',
    'bcat': [
      'IAB25-3',
      'IAB26-1',
      'IAB26-2',
      'IAB26-3',
      'IAB26-4',
    ],
  },
  'crumbs': {
    'pubcid': '9a62f261-3c0b-4cc8-8db3-a72ae86ec6ba'
  },
  'fpd': {
    'context': {
      'adServer': {
        'name': 'gam',
        'adSlot': '/19968336/header-bid-tag-0'
      },
      'pbAdSlot': '/19968336/header-bid-tag-0'
    }
  },
  'mediaTypes': {
    'banner': {
      'sizes': [
        [
          300,
          600
        ]
      ]
    }
  },
  'adUnitCode': 'div-gpt-ad-1460505748561-0',
  'transactionId': '2001a8b2-3bcf-417d-b64f-92641dae21e0',
  'sizes': [
    [
      300,
      250
    ],
    [
      300,
      600
    ]
  ],
  'bidId': '6c148795eb836a',
  'bidderRequestId': '18a45bff5ff705',
  'auctionId': '9f20663c-4629-4b5c-bff6-ff3aa8319358',
  'src': 'client',
  'bidRequestsCount': 1,
  'bidderRequestsCount': 1,
  'bidderWinsCount': 0,
  'gdprConsent': {
    'consentString': 'BOEFEAyOEFEAyAHABDENAI4AAAB9vABAASA',
    'gdprApplies': 1,
  },
  'uspConsent': 1,
};

const sampleBidderRequest = {
  'bidderCode': 'adcolony',
  'auctionId': '9f20663c-4629-4b5c-bff6-ff3aa8319358',
  'bidderRequestId': '18a45bff5ff705',
  'bids': [
    sampleBidderBannerRequest,
    {
      'bidder': 'adcolony',
      'params': {
        'siteId': 'xxxxxx',
        'appId': 'xxxxxx',
        'bundleId': 'ABCBundle',
      },
      'crumbs': {
        'pubcid': '9a62f261-3c0b-4cc8-8db3-a72ae86ec6ba'
      },
      'nativeParams': {
        'title': {
          'required': true,
          'len': 80
        },
        'body': {
          'required': true
        },
        'image': {
          'required': true,
          'sizes': [
            150,
            50
          ]
        },
        'sponsoredBy': {
          'required': true
        },
        'icon': {
          'required': false
        }
      },
      'fpd': {
        'context': {
          'adServer': {
            'name': 'gam',
            'adSlot': '/19968336/header-bid-tag-0'
          },
          'pbAdSlot': '/19968336/header-bid-tag-0'
        }
      },
      'mediaTypes': {
        'native': {
          'title': {
            'required': true,
            'len': 80
          },
          'body': {
            'required': true
          },
          'image': {
            'required': true,
            'sizes': [
              150,
              50
            ]
          },
          'sponsoredBy': {
            'required': true
          },
          'icon': {
            'required': false
          }
        }
      },
      'adUnitCode': 'div-gpt-ad-1460505748561-1',
      'transactionId': '2c8cd034-f068-4419-8c30-f07292c0d17b',
      'sizes': [],
      'bidId': '6c148795eb836a',
      'bidderRequestId': '18a45bff5ff705',
      'auctionId': '9f20663c-4629-4b5c-bff6-ff3aa8319358',
      'src': 'client',
      'bidRequestsCount': 1,
      'bidderRequestsCount': 1,
      'bidderWinsCount': 0
    }
  ],
  'auctionStart': 1606269202001,
  'timeout': 1000,
  'gdprConsent': {
    'consentString': 'BOEFEAyOEFEAyAHABDENAI4AAAB9vABAASA',
    'gdprApplies': 1,
  },
  'uspConsent': 1,
  'refererInfo': {
    'referer': 'http://localhost:9999/integrationExamples/gpt/hello_world.html?pbjs_debug=true',
    'reachedTop': true,
    'isAmp': false,
    'numIframes': 0,
    'stack': [
      'http://localhost:9999/integrationExamples/gpt/hello_world.html?pbjs_debug=true'
    ],
    'canonicalUrl': null
  },
  'start': 1606269202004
};

const sampleRTBResponse = {
  'body': {
    'id': '1606251348404',
    'seatbid': [
      {
        'bid': [
          {
            'id': '1606579704052',
            'impid': '6c148795eb836a',
            'price': 1.23,
            'adm': '\u003cdiv style="box-sizing: border-box;width:298px;height:248px;border: 1px solid rgba(0,0,0,.25);border-radius:10px;"\u003e\n\t\u003ch3 style="margin-top:80px;text-align: center;"\u003eAdColony Test Bid\u003c/h3\u003e\n\u003c/div\u003e',
            'crid': 'test',
            'w': 300,
            'h': 250
          },

        ]
      }
    ],
    'bidid': 'testtesttest'
  }
};

const samplePBBidObjects = [
  {
    'requestId': '6c148795eb836a',
    'cpm': '1.23',
    'width': 300,
    'height': 250,
    'creativeId': 'test',
    'currency': 'USD',
    'netRevenue': true,
    'ttl': 300,
    'ad': '<div style="box-sizing: border-box;width:298px;height:248px;border: 1px solid rgba(0,0,0,.25);border-radius:10px;">\n\t<h3 style="margin-top:80px;text-align: center;">AdColony Test Bid</h3>\n</div>',
    'pw_seat': null,
    'pw_dspid': null,
    'partnerImpId': '1606579704052',
    'meta': {},
    'mediaType': 'banner',
  }
];

describe('AdColonyAdapter', function () {
  describe('Properly Validates Bids', function () {
    it('valid bid', function () {
      let validBid = {
          bidder: 'adcolony',
          params: {
            siteId: 'xxxxxx',
            appId: 'xxxxxx',
            bundleId: 'ABCBundle'
          }
        },
        isValid = spec.isBidRequestValid(validBid);
      expect(isValid).to.equal(true);
    });

    it('valid bid: extra fields are ok', function () {
      let validBid = {
          bidder: 'adcolony',
          params: {
            siteId: 'xxxxxx',
            appId: 'xxxxxx',
            bundleId: 'ABCBundle',
            gender: 'M',
            randomField: 'Random'
          }
        },
        isValid = spec.isBidRequestValid(validBid);
      expect(isValid).to.equal(true);
    });

    it('invalid bid: no siteId', function () {
      let inValidBid = {
          bidder: 'adcolony',
          params: {
            gender: 'M',
          }
        },
        isValid = spec.isBidRequestValid(inValidBid);
      expect(isValid).to.equal(false);
    });

    it('invalid bid: siteId should be a string', function () {
      let validBid = {
          bidder: 'adcolony',
          params: {
            siteId: 123456,
            appId: 'xxxxxx',
            bundleId: 'ABCBundle'
          }
        },
        isValid = spec.isBidRequestValid(validBid);
      expect(isValid).to.equal(false);
    });
  });

  describe('Handling Request Construction', function () {
    it('bid requests are not mutable', function() {
      let sourceBidRequest = utils.deepClone(sampleValidBidRequests);
      spec.buildRequests(sampleValidBidRequests, {auctionId: 'placeholder'});
      expect(sampleValidBidRequests).to.deep.equal(sourceBidRequest, 'Should be unedited as they are used elsewhere');
    });
    it('should handle complex bidRequest', function() {
      let request = spec.buildRequests(sampleValidBidRequests, sampleBidderRequest);
      expect(request.bidderRequest).to.equal(sampleBidderRequest, "Bid Request Doesn't Match Sample");
      expect(request.data.source.tid).to.equal(sampleBidderRequest.auctionId, 'AuctionId -> source.tid Mismatch');
      expect(request.data.imp[0].ext.tid).to.equal(sampleBidderRequest.bids[0].transactionId, 'TransactionId -> ext.tid Mismatch');
    });
    it('must conform to API for buildRequests', function() {
      let request = spec.buildRequests(sampleValidBidRequests);
      expect(request.bidderRequest).to.be.undefined;
    });
  });

  describe('Identifies Media Types', function () {
    it('identifies native adm type', function() {
      let adm = '{"ver":"1.2","assets":[{"title":{"text":"AdColony Test"}},{"img":{"type":3,"url":"http://www.adcolony.com"}},{"img":{"type":1,"url":"http://www.adcolony.com"}},{"data":{"type":2,"value":"AdColony Test Desc"}},{"data":{"type":1,"value":"AdColony.com"}}],"link":{"url":""}}';
      let newBid = {mediaType: 'unknown'};
      _checkMediaType(adm, newBid);
      expect(newBid.mediaType).to.equal('native', adm + ' Is a Native adm');
    });

    it('identifies banner adm type', function() {
      let adm = '<div style="box-sizing: border-box;width:298px;height:248px;border: 1px solid rgba(0,0,0,.25);border-radius:10px;">↵	<h3 style="margin-top:80px;text-align: center;">AdColony Test Bid</h3>↵</div>';
      let newBid = {mediaType: 'unknown'};
      _checkMediaType(adm, newBid);
      expect(newBid.mediaType).to.equal('banner', adm + ' Is a Banner adm');
    });
  });

  describe('Properly Parses AdSlot Data', function () {
    it('parses banner', function() {
      let testBid = utils.deepClone(sampleValidBannerBidRequest)
      _parseAdSlot(testBid)
      expect(testBid).to.deep.equal(sampleBidderBannerRequest, JSON.stringify(testBid) + ' ' + JSON.stringify(sampleBidderBannerRequest));
    });
  });

  describe('Properly Handles Response', function () {
    it('handles response with muiltiple responses', function() {
      // the request when it comes back is on the data object
      let pbResponse = spec.interpretResponse(sampleRTBResponse, {'data': sampleRequest})
      expect(pbResponse).to.deep.equal(samplePBBidObjects);
    });
  });

  /** ****** Site Testing ***********/
  const sampleSiteValidBannerBidRequest = {
    'bidder': 'adcolony',
    'params': {
      'siteId': 'xxxxxx',
      'appId': 'xxxxxx',
      'bundleId': 'xxxxxx',
      'mode': 'site',
      'bidFloor': '1.00',
      'currency': 'USD',
      'gender': 'M',
      'lat': '33.91989876432274',
      'lon': '-84.38897708175764',
      'yob': '2000',
      'bcat': ['IAB25-3', 'IAB26-1', 'IAB26-2', 'IAB26-3', 'IAB26-4'],
    },
    'gdprConsent': {
      'consentString': 'BOEFEAyOEFEAyAHABDENAI4AAAB9vABAASA',
      'gdprApplies': 1,
    },
    'uspConsent': 1,
    'crumbs': {
      'pubcid': '9a62f261-3c0b-4cc8-8db3-a72ae86ec6ba'
    },
    'fpd': {
      'context': {
        'adServer': {
          'name': 'gam',
          'adSlot': '/19968336/header-bid-tag-0'
        },
        'pbAdSlot': '/19968336/header-bid-tag-0'
      }
    },
    'mediaTypes': {
      'banner': {
        'sizes': [
          [
            300,
            250
          ],
          [
            300,
            600
          ]
        ]
      }
    },
    'adUnitCode': 'div-gpt-ad-1460505748561-0',
    'transactionId': '2001a8b2-3bcf-417d-b64f-92641dae21e0',
    'sizes': [
      [
        300,
        250
      ],
      [
        300,
        600
      ]
    ],
    'bidId': '6c148795eb836a',
    'bidderRequestId': '18a45bff5ff705',
    'auctionId': '9f20663c-4629-4b5c-bff6-ff3aa8319358',
    'src': 'client',
    'bidRequestsCount': 1,
    'bidderRequestsCount': 1,
    'bidderWinsCount': 0
  };

  const sampleSiteValidBidRequests = [
    sampleSiteValidBannerBidRequest
  ]

  const sampleSiteBidderBannerRequest = {
    'bidder': 'adcolony',
    'params': {
      'siteId': 'xxxxxx',
      'appId': 'xxxxxx',
      'bundleId': 'xxxxxx',
      'mode': 'site',
      'height': 250,
      'width': 300,
      'gender': 'M',
      'yob': '2000',
      'lat': '33.91989876432274',
      'lon': '-84.38897708175764',
      'bidFloor': '1.00',
      'currency': 'USD',
      'adSlot': '',
      'adUnit': 'div-gpt-ad-1460505748561-0',
      'bcat': [
        'IAB25-3',
        'IAB26-1',
        'IAB26-2',
        'IAB26-3',
        'IAB26-4',
      ],
    },
    'crumbs': {
      'pubcid': '9a62f261-3c0b-4cc8-8db3-a72ae86ec6ba'
    },
    'fpd': {
      'context': {
        'adServer': {
          'name': 'gam',
          'adSlot': '/19968336/header-bid-tag-0'
        },
        'pbAdSlot': '/19968336/header-bid-tag-0'
      }
    },
    'mediaTypes': {
      'banner': {
        'sizes': [
          [
            300,
            600
          ]
        ]
      }
    },
    'adUnitCode': 'div-gpt-ad-1460505748561-0',
    'transactionId': '2001a8b2-3bcf-417d-b64f-92641dae21e0',
    'sizes': [
      [
        300,
        250
      ],
      [
        300,
        600
      ]
    ],
    'bidId': '6c148795eb836a',
    'bidderRequestId': '18a45bff5ff705',
    'auctionId': '9f20663c-4629-4b5c-bff6-ff3aa8319358',
    'src': 'client',
    'bidRequestsCount': 1,
    'bidderRequestsCount': 1,
    'bidderWinsCount': 0,
    'gdprConsent': {
      'consentString': 'BOEFEAyOEFEAyAHABDENAI4AAAB9vABAASA',
      'gdprApplies': 1,
    },
    'uspConsent': 1,
  };

  const sampleSiteBidderRequest = {
    'bidderCode': 'adcolony',
    'auctionId': '9f20663c-4629-4b5c-bff6-ff3aa8319358',
    'bidderRequestId': '18a45bff5ff705',
    'bids': [
      sampleSiteBidderBannerRequest
    ],
    'auctionStart': 1606269202001,
    'timeout': 1000,
    'gdprConsent': {
      'consentString': 'BOEFEAyOEFEAyAHABDENAI4AAAB9vABAASA',
      'gdprApplies': 1,
    },
    'uspConsent': 1,
    'refererInfo': {
      'referer': 'http://localhost:9999/integrationExamples/gpt/hello_world.html?pbjs_debug=true',
      'reachedTop': true,
      'isAmp': false,
      'numIframes': 0,
      'stack': [
        'http://localhost:9999/integrationExamples/gpt/hello_world.html?pbjs_debug=true'
      ],
      'canonicalUrl': null
    },
    'start': 1606269202004
  };

  describe('Properly Validates SITE Bids', function () {
    it('valid bid', function () {
      let validBid = {
          bidder: 'adcolony',
          params: {
            siteId: 'xxxxxx',
            mode: 'site',
          }
        },
        isValid = spec.isBidRequestValid(validBid);
      expect(isValid).to.equal(true);
    });

    it('should handle complex SITE bidRequest', function() {
      let request = spec.buildRequests(sampleSiteValidBidRequests, sampleSiteBidderRequest);

      expect(request.bidderRequest).to.equal(sampleSiteBidderRequest);
    });
  });
});
