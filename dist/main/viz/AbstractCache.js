/**
 * AbstractCache
 * 
 */
'use strict';Object.defineProperty(exports, '__esModule', { value: true });var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}var _underscore = require(

'underscore');var _underscore2 = _interopRequireDefault(_underscore);
/*jshint unused:false */var _ContigInterval = require(
'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var _Interval = require(
'../Interval');var _Interval2 = _interopRequireDefault(_Interval);var _utils = require(

'../utils');var _utils2 = _interopRequireDefault(_utils);var _dataGenericFeatureJs = require(




'../data/genericFeature.js');var _dataGenericFeatureJs2 = _interopRequireDefault(_dataGenericFeatureJs);var 










AbstractCache = (function () {





  function AbstractCache(referenceSource) {_classCallCheck(this, AbstractCache);
    this.groups = {};
    this.refToPileup = {};
    this.referenceSource = referenceSource;}_createClass(AbstractCache, [{ key: 'pileupForRef', value: 


    function pileupForRef(ref) {
      if (ref in this.refToPileup) {
        return this.refToPileup[ref];} else 
      {
        var alt = _utils2['default'].altContigName(ref);
        if (alt in this.refToPileup) {
          return this.refToPileup[alt];} else 
        {
          return [];}}}




    // How many rows tall is the pileup for a given ref? This is related to the
    // maximum read depth. This is 'chr'-agnostic.
  }, { key: 'pileupHeightForRef', value: function pileupHeightForRef(ref) {
      var pileup = this.pileupForRef(ref);
      return pileup ? pileup.length : 0;}


    // Find groups overlapping the range. This is 'chr'-agnostic.
  }, { key: 'getGroupsOverlapping', value: function getGroupsOverlapping(range) {
      // TODO: speed this up using an interval tree
      return _underscore2['default'].filter(this.groups, function (group) {return group.span.intersects(range);});}


    // Determine the number of groups at a locus.
    // Like getGroupsOverlapping(range).length > 0, but more efficient.
  }, { key: 'anyGroupsOverlapping', value: function anyGroupsOverlapping(range) {
      for (var k in this.groups) {
        var group = this.groups[k];
        if (group.span.intersects(range)) {
          return true;}}


      return false;} }]);return AbstractCache;})();



module.exports = AbstractCache; // pileup row.
// tip-to-tip span for the read group
// interval for the connector, if applicable.
// maps groupKey to VisualGroup