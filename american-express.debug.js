(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.braintree || (g.braintree = {})).americanExpress = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

var BraintreeError = _dereq_('../lib/error');

/**
 * @class
 * @param {object} options Options
 * @description <strong>You cannot use this constructor directly. Use {@link module:braintree-web/american-express.create|braintree.american-express.create} instead.</strong>
 * @classdesc This class allows you use a nonce to interact with American Express Checkout.
 */
function AmericanExpress(options) {
  this._client = options.client;
}

/**
 * Gets the rewards balance associated with a Braintree nonce.
 * @public
 * @param {object} options Request options
 * @param {string} options.nonce An existing Braintree nonce.
 * @param {errback} callback The second argument, <code>data</code>, is the returned server data.
 * @returns {void}
 * @example
 * var americanExpress = require('braintree-web/american-express');
 *
 * americanExpress.create({client: client}, function (err, instance) {
 *   var options = {nonce: existingBraintreeNonce};
 *   instance.getRewardsBalance(options, function (err, payload) {
 *     if (err || payload.error) {
 *       // Handle error
 *       return;
 *     }
 *
 *     console.log('Rewards amount: ' + payload.rewardsAmount);
 *   });
 * });
 */
AmericanExpress.prototype.getRewardsBalance = function (options, callback) {
  if (typeof callback !== 'function') {
    throw new BraintreeError({
      type: BraintreeError.types.MERCHANT,
      message: 'getRewardsBalance must include a callback function.'
    });
  }

  if (!options.nonce) {
    callback(new BraintreeError({
      type: BraintreeError.types.MERCHANT,
      message: 'getRewardsBalance must be called with a nonce.'
    }));
    return;
  }

  this._client.request({
    method: 'get',
    endpoint: 'payment_methods/amex_rewards_balance',
    data: {
      _meta: {source: 'american-express'},
      paymentMethodNonce: options.nonce
    }
  }, function (err, response) {
    if (err) {
      callback(new BraintreeError({
        type: BraintreeError.types.NETWORK,
        message: 'A network error occured when getting the American Express rewards balance.',
        details: {
          originalError: err
        }
      }));
    } else {
      callback(null, response);
    }
  });
};

/**
 * Gets the Express Checkout nonce profile given a nonce from American Express.
 * @public
 * @param {object} options Request options
 * @param {string} options.nonce An existing nonce from American Express (note that this is <em>not</em> a nonce from Braintree).
 * @param {errback} callback The second argument, <code>data</code>, is the returned server data.
 * @returns {void}
 * @example
 * var americanExpress = require('braintree-web/american-express');
 *
 * americanExpress.create({client: client}, function (err, instance) {
 *   var options = {nonce: existingAmericanExpressNonce};
 *   instance.getExpressCheckoutProfile(options, function (err, payload) {
 *     if (err) {
 *       // Handle error
 *       return;
 *     }
 *
 *     console.log('Number of cards: ' + payload.amexExpressCheckoutCards.length);
 *   });
 * });
 */
AmericanExpress.prototype.getExpressCheckoutProfile = function (options, callback) {
  if (typeof callback !== 'function') {
    throw new BraintreeError({
      type: BraintreeError.types.MERCHANT,
      message: 'getExpressCheckoutProfile must include a callback function.'
    });
  }

  if (!options.nonce) {
    callback(new BraintreeError({
      type: BraintreeError.types.MERCHANT,
      message: 'getExpressCheckoutProfile must be called with a nonce.'
    }));
    return;
  }

  this._client.request({
    method: 'get',
    endpoint: 'payment_methods/amex_express_checkout_cards/' + options.nonce,
    data: {
      _meta: {source: 'american-express'},
      paymentMethodNonce: options.nonce
    }
  }, function (err, response) {
    if (err) {
      callback(new BraintreeError({
        type: BraintreeError.types.NETWORK,
        message: 'A network error occured when getting the American Express Checkout nonce profile.',
        details: {
          originalError: err
        }
      }));
    } else {
      callback(null, response);
    }
  });
};

module.exports = AmericanExpress;

},{"../lib/error":4}],2:[function(_dereq_,module,exports){
'use strict';
/**
 * @module braintree-web/american-express
 * @description This module is for use with Amex Express Checkout. To accept American Express cards, use Hosted Fields.
 */

var VERSION = "3.0.0-beta.5";
var BraintreeError = _dereq_('../lib/error');
var AmericanExpress = _dereq_('./american-express');

/**
 * @function
 * @param {object} options Object containing all {@link AmericanExpress} options
 * @param {Client} options.client A {@link Client} instance
 * @param {errback} callback The second argument, <code>data</code>, is the {@link AmericanExpress} instance
 * @returns {void}
 * @static
 */
function create(options, callback) {
  if (typeof callback !== 'function') {
    throw new BraintreeError({
      type: BraintreeError.types.MERCHANT,
      message: 'create must include a callback function.'
    });
  }

  if (options.client == null) {
    callback(new BraintreeError({
      type: BraintreeError.types.MERCHANT,
      message: 'A Client is required when instantiating American Express.'
    }));
    return;
  }

  if (options.client.getConfiguration().analyticsMetadata.sdkVersion !== VERSION) {
    callback(new BraintreeError({
      type: BraintreeError.types.MERCHANT,
      message: 'Client and American Express components must be from the same SDK version.'
    }));
    return;
  }

  callback(null, new AmericanExpress(options));
}

module.exports = {
  create: create,
  /**
   * @description The current version of the SDK, i.e. `{@pkg version}`.
   * @type {string}
   */
  VERSION: VERSION
};

},{"../lib/error":4,"./american-express":1}],3:[function(_dereq_,module,exports){
'use strict';

function enumerate(values, prefix) {
  prefix = prefix == null ? '' : prefix;

  return values.reduce(function (enumeration, value) {
    enumeration[value] = prefix + value;
    return enumeration;
  }, {});
}

module.exports = enumerate;

},{}],4:[function(_dereq_,module,exports){
'use strict';

var enumerate = _dereq_('./enumerate');

/**
 * @class
 * @global
 * @param {object} options Construction options
 * @classdesc This class is used to report error conditions, frequently as the first parameter to callbacks throughout the Braintree SDK.
 * @description <strong>You cannot use this constructor directly. Interact with instances of this class through {@link errback errbacks}.</strong>
 */
function BraintreeError(options) {
  if (!BraintreeError.types.hasOwnProperty(options.type)) {
    throw new Error(options.type + ' is not a valid type');
  }

  if (!options.message) {
    throw new Error('Error message required');
  }

  /**
   * @type {string}
   * @description A short description of the error
   */
  this.message = options.message;

  /**
   * @type {BraintreeError.types}
   * @description The type of error
   */
  this.type = options.type;

  /**
   * @type {object=}
   * @description Additional information about the error, such as an underlying network error response
   */
  this.details = options.details;
}

BraintreeError.prototype = Object.create(Error.prototype);
BraintreeError.prototype.constructor = BraintreeError;

/**
 * Enum for {@link BraintreeError} types
 * @name BraintreeError.types
 * @enum
 * @readonly
 * @memberof BraintreeError
 * @property {string} CUSTOMER Error caused by the customer
 * @property {string} MERCHANT Error that is actionable by the merchant
 * @property {string} NETWORK Error due to a network problem
 * @property {string} INTERNAL Error caused by Braintree code
 * @property {string} UNKNOWN Error of unknown origin
 */
BraintreeError.types = enumerate([
  'CUSTOMER',
  'MERCHANT',
  'NETWORK',
  'INTERNAL',
  'UNKNOWN'
]);

module.exports = BraintreeError;

},{"./enumerate":3}]},{},[2])(2)
});