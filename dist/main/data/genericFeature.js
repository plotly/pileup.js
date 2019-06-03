/**
 * Generic object that can be displayed. This can be a gene, feature or variant, etc.
 * See ../viz/GenericFeatureCache.js
 * 
 */
'use strict';

/*jshint unused:false */function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}var _ContigInterval = require(
'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var 


GenericFeature = 




function GenericFeature(id, position, genericFeature) {_classCallCheck(this, GenericFeature);
  this.id = genericFeature.id;
  this.position = genericFeature.position;
  this.gFeature = genericFeature;};



module.exports = GenericFeature;