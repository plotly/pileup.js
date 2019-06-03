/**
 * A data source which implements generic JSON protocol.
 * Currently only used to load alignments.
 * 
 */
'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _dataVariant = require(


'../data/variant');var _underscore = require(

'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _backbone = require(
'backbone');var _q = require(
'q');var _q2 = _interopRequireDefault(_q);var _ContigInterval = require(
'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);


function create(json) {

  // parse json
  var parsedJson = JSON.parse(json);
  var variants = [];
  var callSetNames = [];

  // fill variants with json
  if (!_underscore2['default'].isEmpty(parsedJson)) {
    variants = _underscore2['default'].values(parsedJson.variants).map(function (variant) {return new _dataVariant.VariantContext(_dataVariant.Variant.fromGA4GH(variant), variant.calls);});
    callSetNames = _underscore2['default'].map(variants[0].calls, function (c) {return c.callSetName;});}


  function rangeChanged(newRange) {
    // Data is already parsed, so immediately return
    var range = new _ContigInterval2['default'](newRange.contig, newRange.start, newRange.stop);
    o.trigger('newdata', range);
    o.trigger('networkdone');
    return;}


  function getVariantsInRange(range) {
    if (!range) return [];
    var filtered = _underscore2['default'].filter(variants, function (variant) {return variant.intersects(range);});
    return _underscore2['default'].map(filtered, function (f) {return f.variant;});}


  function getGenotypesInRange(range) {
    if (!range) return [];

    return _underscore2['default'].filter(variants, function (variant) {return variant.intersects(range);});}


  function getCallNames() {
    return _q2['default'].resolve(callSetNames);}


  var o = { 
    rangeChanged: rangeChanged, 
    getVariantsInRange: getVariantsInRange, 
    getGenotypesInRange: getGenotypesInRange, 
    getCallNames: getCallNames, 

    on: function on() {}, 
    once: function once() {}, 
    off: function off() {}, 
    trigger: function trigger(string, any) {} };

  _underscore2['default'].extend(o, _backbone.Events);
  return o;}


module.exports = { 
  create: create };