// The fields are described at http://genome.ucsc.edu/FAQ/FAQformat#format1

















// Fields 4-12 are optional
'use strict';var _slicedToArray = (function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i['return']) _i['return']();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError('Invalid attempt to destructure non-iterable instance');}};})();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _Alignment = require('../Alignment');var _underscore = require('underscore');var _underscore2 = _interopRequireDefault(_underscore);var _q = require('q');var _q2 = _interopRequireDefault(_q);var _backbone = require('backbone');var _ContigInterval = require('../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var _Interval = require('../Interval');var _Interval2 = _interopRequireDefault(_Interval);var _dataBigBed = require('../data/BigBed');var _dataBigBed2 = _interopRequireDefault(_dataBigBed);var _dataGene = require('../data/gene');var _dataGene2 = _interopRequireDefault(_dataGene);function parseBedFeature(f) {
  var position = new _ContigInterval2['default'](f.contig, f.start, f.stop), 
  x = f.rest.split('\t');

  // if no id, generate randomly for unique storage
  var id = x[0] ? x[0] : position.toString(); // e.g. ENST00000359597
  var score = x[1] ? parseInt(x[1]) : 1000; // number from 0-1000
  var strand = (0, _Alignment.strToStrand)(x[2]); // either +, - or .
  var codingRegion = x[3] && x[4] ? new _Interval2['default'](Number(x[3]), Number(x[4])) : new _Interval2['default'](f.start, f.stop);
  var geneId = x[9] ? x[9] : id;
  var name = x[10] ? x[10] : "";

  // parse exons
  var exons = [];
  if (x[7] && x[8]) {
    // exons arrays sometimes have trailing commas
    var exonLengths = x[7].replace(/,*$/, '').split(',').map(Number), 
    exonStarts = x[8].replace(/,*$/, '').split(',').map(Number);

    exons = _underscore2['default'].zip(exonStarts, exonLengths).
    map(function (_ref) {var _ref2 = _slicedToArray(_ref, 2);var start = _ref2[0];var length = _ref2[1];
      return new _Interval2['default'](f.start + start, f.start + start + length);});}



  return new _dataGene2['default']({ 
    position: position, 
    id: id, 
    score: score, 
    strand: strand, 
    codingRegion: codingRegion, 
    geneId: geneId, 
    name: name, 
    exons: exons });}



function createFromBigBedFile(remoteSource) {
  // Collection of genes that have already been loaded.
  var genes = {};

  // Ranges for which we have complete information -- no need to hit network.
  var coveredRanges = [];

  function addGene(newGene) {
    if (!genes[newGene.id]) {
      genes[newGene.id] = newGene;}}



  function getFeaturesInRange(range) {
    if (!range) return [];
    var results = [];
    _underscore2['default'].each(genes, function (gene) {
      if (range.intersects(gene.position)) {
        results.push(gene);}});


    return results;}


  function fetch(range) {
    var interval = new _ContigInterval2['default'](range.contig, range.start, range.stop);

    // Check if this interval is already in the cache.
    if (interval.isCoveredBy(coveredRanges)) {
      return _q2['default'].when();}


    coveredRanges.push(interval);
    coveredRanges = _ContigInterval2['default'].coalesce(coveredRanges);

    return remoteSource.getFeatureBlocksOverlapping(interval).then(function (featureBlocks) {
      featureBlocks.forEach(function (fb) {
        coveredRanges.push(fb.range);
        coveredRanges = _ContigInterval2['default'].coalesce(coveredRanges);
        var genes = fb.rows.map(parseBedFeature);
        genes.forEach(function (gene) {return addGene(gene);});});

      //we have new data from our internal block range
      o.trigger('newdata', interval);
      o.trigger('networkdone');});}



  var o = { 
    rangeChanged: function rangeChanged(newRange) {
      fetch(newRange).done();}, 

    getFeaturesInRange: getFeaturesInRange, 

    // These are here to make Flow happy.
    on: function on() {}, 
    once: function once() {}, 
    off: function off() {}, 
    trigger: function trigger(status, param) {} };

  _underscore2['default'].extend(o, _backbone.Events); // Make this an event emitter

  return o;}


function create(data) {
  var url = data.url;
  if (!url) {
    throw new Error('Missing URL from track: ' + JSON.stringify(data));}


  return createFromBigBedFile(new _dataBigBed2['default'](url));}


module.exports = { 
  create: create, 
  createFromBigBedFile: createFromBigBedFile };