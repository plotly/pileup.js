/**
 * Data management for FeatureTrack.
 *
 * This class groups features and piles them up.
 *
 * 
 */













// This class provides data management for the visualization
'use strict';var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();var _get = function get(_x, _x2, _x3) {var _again = true;_function: while (_again) {var object = _x, property = _x2, receiver = _x3;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {var parent = Object.getPrototypeOf(object);if (parent === null) {return undefined;} else {_x = parent;_x2 = property;_x3 = receiver;_again = true;desc = parent = undefined;continue _function;}} else if ('value' in desc) {return desc.value;} else {var getter = desc.get;if (getter === undefined) {return undefined;}return getter.call(receiver);}}};function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass) {if (typeof superClass !== 'function' && superClass !== null) {throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var _underscore = require('underscore');var _underscore2 = _interopRequireDefault(_underscore); /*jshint unused:false */var _dataGenericFeatureJs = require('../data/genericFeature.js');var _dataGenericFeatureJs2 = _interopRequireDefault(_dataGenericFeatureJs);var _Interval = require('../Interval');var _Interval2 = _interopRequireDefault(_Interval);var _pileuputils = require('./pileuputils');var _AbstractCache2 = require('./AbstractCache');var _AbstractCache3 = _interopRequireDefault(_AbstractCache2);var GenericFeatureCache = (function (_AbstractCache) {_inherits(GenericFeatureCache, _AbstractCache);





  function GenericFeatureCache(referenceSource) {_classCallCheck(this, GenericFeatureCache);
    _get(Object.getPrototypeOf(GenericFeatureCache.prototype), 'constructor', this).call(this, referenceSource);}


  // name would make a good key, but features from different contigs
  // shouldn't be grouped visually. Hence we use feature name + contig.
  _createClass(GenericFeatureCache, [{ key: 'groupKey', value: function groupKey(f) {
      return f.id || f.position.toString();}


    // Load a new feature into the visualization cache.
    // Calling this multiple times with the same feature is a no-op.
  }, { key: 'addFeature', value: function addFeature(feature) {
      var key = this.groupKey(feature);

      if (!(key in this.groups)) {
        this.groups[key] = { 
          key: key, 
          span: feature.position, 
          row: -1, // TBD
          insert: null, 
          items: [] };}


      var group = this.groups[key];

      if (_underscore2['default'].find(group.items, function (f) {return f.gFeature == feature.gFeature;})) {
        return; // we've already got it.
      }

      group.items.push(feature);

      if (!(feature.position.contig in this.refToPileup)) {
        this.refToPileup[feature.position.contig] = [];}

      var pileup = this.refToPileup[feature.position.contig];
      group.row = (0, _pileuputils.addToPileup)(group.span.interval, pileup);} }]);return GenericFeatureCache;})(_AbstractCache3['default']);




module.exports = { 
  GenericFeatureCache: GenericFeatureCache }; // maps groupKey to VisualGroup