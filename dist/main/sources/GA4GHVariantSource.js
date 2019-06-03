/**
 * A data source which implements the GA4GH Variant protocol.
 * 
 */
'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _underscore = require(

'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _q = require(
'q');var _q2 = _interopRequireDefault(_q);var _backbone = require(
'backbone');var _ContigInterval = require(

'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var _dataVariant = require(


'../data/variant');

var BASE_PAIRS_PER_FETCH = 100;
var VARIANTS_PER_REQUEST = 400;
var ZERO_BASED = false;





// optional parameter for displaying call set names.
// Without this parameter, users must make extra http
// request for call set names for Genotype Track display


function create(spec) {
  var url = spec.endpoint + '/variants/search';

  var variants = {};


  // Ranges for which we have complete information -- no need to hit network.
  var coveredRanges = [];

  function addVariantsFromResponse(response) {
    if (response.variants === undefined) {
      return;}


    response.variants.forEach(function (ga4ghVariant) {
      var key = ga4ghVariant.id;
      if (key in variants) return;

      var variant = new _dataVariant.VariantContext(_dataVariant.Variant.fromGA4GH(ga4ghVariant), ga4ghVariant.calls);
      variants[key] = variant;});}



  function rangeChanged(newRange) {
    var interval = new _ContigInterval2['default'](newRange.contig, newRange.start, newRange.stop);

    if (interval.isCoveredBy(coveredRanges)) return;

    interval = interval.round(BASE_PAIRS_PER_FETCH, ZERO_BASED);

    // select only intervals not yet loaded into coveredRangesß
    var intervals = interval.complementIntervals(coveredRanges);

    // We "cover" the interval immediately (before the reads have arrived) to
    // prevent duplicate network requests.
    coveredRanges.push(interval);
    coveredRanges = _ContigInterval2['default'].coalesce(coveredRanges);

    intervals.forEach(function (i) {
      fetchVariantsForInterval(i, null, 1 /* first request */);});}



  function notifyFailure(message) {
    o.trigger('networkfailure', message);
    o.trigger('networkdone');
    console.warn(message);}


  function fetchVariantsForInterval(range, 
  pageToken, 
  numRequests) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.addEventListener('load', function (e) {
      var response = this.response;
      if (this.status >= 400) {
        notifyFailure(this.status + ' ' + this.statusText + ' ' + JSON.stringify(response));} else 
      {
        if (response.errorCode) {
          notifyFailure('Error from GA4GH Variant endpoint: ' + JSON.stringify(response));} else 
        {
          addVariantsFromResponse(response);
          o.trigger('newdata', range); // display data as it comes in.
          if (response.nextPageToken) {
            fetchVariantsForInterval(range, response.nextPageToken, numRequests + 1);} else 
          {
            o.trigger('networkdone');}}}});




    xhr.addEventListener('error', function (e) {
      notifyFailure('Request failed with status: ' + this.status);});


    o.trigger('networkprogress', { numRequests: numRequests });
    xhr.send(JSON.stringify({ 
      variantSetId: spec.variantSetId, 
      pageToken: pageToken, 
      pageSize: VARIANTS_PER_REQUEST, 
      referenceName: range.contig, 
      callSetIds: spec.callSetIds, 
      start: range.start(), 
      end: range.stop() }));}



  function getVariantsInRange(range) {
    if (!range) return [];

    var filtered = _underscore2['default'].filter(variants, function (variant) {return variant.intersects(range);});
    return _underscore2['default'].map(filtered, function (f) {return f.variant;});}


  function getGenotypesInRange(range) {
    if (!range) return [];

    return _underscore2['default'].filter(variants, function (variant) {return variant.intersects(range);});}


  function getCallNames() {
    if (spec.callSetNames) {
      return _q2['default'].resolve(spec.callSetNames);} else 
    {
      return _q2['default'].resolve(spec.callSetIds);}}




  var o = { 
    rangeChanged: rangeChanged, 
    getVariantsInRange: getVariantsInRange, 
    getGenotypesInRange: getGenotypesInRange, 
    getCallNames: getCallNames, 

    // These are here to make Flow happy.
    on: function on() {}, 
    once: function once() {}, 
    off: function off() {}, 
    trigger: function trigger(status, param) {} };

  _underscore2['default'].extend(o, _backbone.Events); // Make this an event emitter
  return o;}


module.exports = { 
  create: create };