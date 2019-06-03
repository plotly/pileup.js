/**
 * Class for parsing features.
 * 
 */
'use strict';var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}var _ContigInterval = require(

'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var 


Feature = (function () {





  function Feature(feature) {_classCallCheck(this, Feature);
    this.id = feature.id;
    this.featureType = feature.featureType;
    this.position = feature.position;
    this.score = feature.score;}_createClass(Feature, [{ key: 'getKey', value: 


    function getKey() {
      return this.id;} }, { key: 'getInterval', value: 


    function getInterval() {
      return this.position;} }, { key: 'getCoverage', value: 


    function getCoverage(referenceSource) {
      return { 
        range: this.getInterval(), 
        opInfo: null };} }, { key: 'intersects', value: 















    function intersects(range) {
      return range.intersects(this.position);} }], [{ key: 'fromGA4GH', value: function fromGA4GH(ga4ghFeature) {var position = new _ContigInterval2['default'](ga4ghFeature.referenceName, parseInt(ga4ghFeature.start), parseInt(ga4ghFeature.end));return new Feature({ id: ga4ghFeature.id, featureType: ga4ghFeature.featureType, position: position, score: 1000 });} }]);return Feature;})();



module.exports = Feature;