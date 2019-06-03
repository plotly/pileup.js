/**
 * Data management for PileupTrack.
 *
 * This class groups paired reads and piles them up.
 *
 * 
 */
'use strict';













// This bundles everything intrinsic to the alignment that we need to display
// it, i.e. everything not dependend on scale/viewport.
Object.defineProperty(exports, '__esModule', { value: true });var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();var _get = function get(_x, _x2, _x3) {var _again = true;_function: while (_again) {var object = _x, property = _x2, receiver = _x3;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {var parent = Object.getPrototypeOf(object);if (parent === null) {return undefined;} else {_x = parent;_x2 = property;_x3 = receiver;_again = true;desc = parent = undefined;continue _function;}} else if ('value' in desc) {return desc.value;} else {var getter = desc.get;if (getter === undefined) {return undefined;}return getter.call(receiver);}}};function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass) {if (typeof superClass !== 'function' && superClass !== null) {throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var _AbstractCache2 = require('./AbstractCache');var _AbstractCache3 = _interopRequireDefault(_AbstractCache2);var _underscore = require('underscore');var _underscore2 = _interopRequireDefault(_underscore);var _ContigInterval = require('../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var _Interval = require('../Interval');var _Interval2 = _interopRequireDefault(_Interval);var _pileuputils = require('./pileuputils');var _utils = require('../utils');var _utils2 = _interopRequireDefault(_utils);







// Insert sizes within this percentile range will be considered "normal".
var MIN_OUTLIER_PERCENTILE = 0.5;
var MAX_OUTLIER_PERCENTILE = 99.5;
var MAX_INSERT_SIZE = 30000; // ignore inserts larger than this in calculations
var MIN_READS_FOR_OUTLIERS = 500; // minimum reads for reliable stats






// This class provides data management for the visualization, grouping paired
// reads and managing the pileup.
var PileupCache = (function (_AbstractCache) {_inherits(PileupCache, _AbstractCache);







  function PileupCache(referenceSource, viewAsPairs) {_classCallCheck(this, PileupCache);
    _get(Object.getPrototypeOf(PileupCache.prototype), 'constructor', this).call(this, referenceSource);
    this.viewAsPairs = viewAsPairs;
    this._insertStats = null;}



















































































































































  // Helper method for addRead.
  // Given 1-2 intervals, compute their span and insert (interval between them).
  // For one interval, these are both trivial.
  // TODO: what this calls an "insert" is not what most people mean by that.
  // read name would make a good key, but paired reads from different contigs
  // shouldn't be grouped visually. Hence we use read name + contig.
  _createClass(PileupCache, [{ key: 'groupKey', value: function groupKey(read) {if (this.viewAsPairs) {return read.name + ':' + read.ref;} else {return read.getKey();}} // Load a new read into the visualization cache.
    // Calling this multiple times with the same read is a no-op.
  }, { key: 'addAlignment', value: function addAlignment(read) {this._insertStats = null; // invalidate
      var key = this.groupKey(read), range = read.getInterval();if (!(key in this.groups)) {this.groups[key] = { key: key, row: -1, // TBD
          insert: null, // TBD
          span: range, items: [] };}var group = this.groups[key];if (_underscore2['default'].find(group.items, function (a) {return a.read == read;})) {return; // we've already got it.
      }var opInfo = (0, _pileuputils.getOpInfo)(read, this.referenceSource);var visualAlignment = { read: read, strand: read.getStrand(), refLength: range.length(), ops: opInfo.ops, mismatches: opInfo.mismatches };group.items.push(visualAlignment);var mateInterval = null;if (group.items.length == 1) {// This is the first read in the group. Infer its span from its mate properties.
        // TODO: if the mate Alignment is also available, it would be better to use that.
        if (this.viewAsPairs) {var mateProps = read.getMateProperties();var intervals = [range];if (mateProps && mateProps.ref && mateProps.ref == read.ref) {mateInterval = new _ContigInterval2['default'](mateProps.ref, mateProps.pos, mateProps.pos + range.length());intervals.push(mateInterval);}group = _underscore2['default'].extend(group, spanAndInsert(intervals));} else {group.span = range;}if (!(read.ref in this.refToPileup)) {this.refToPileup[read.ref] = [];}var pileup = this.refToPileup[read.ref];group.row = (0, _pileuputils.addToPileup)(group.span.interval, pileup);} else if (group.items.length == 2) {// Refine the connector
        mateInterval = group.items[0].read.getInterval();var _spanAndInsert = spanAndInsert([range, mateInterval]);var span = _spanAndInsert.span;var insert = _spanAndInsert.insert;group.insert = insert;if (insert) {group.span = span;}} else {// this must be a chimeric read.
      }} // Updates reference mismatch information for previously-loaded reads.
  }, { key: 'updateMismatches', value: function updateMismatches(range) {for (var k in this.groups) {var reads = this.groups[k].items;var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {for (var _iterator = reads[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var vRead = _step.value;var read = vRead.read;if (read.getInterval().intersects(range)) {var opInfo = (0, _pileuputils.getOpInfo)(read, this.referenceSource);vRead.mismatches = opInfo.mismatches;}}} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator['return']) {_iterator['return']();}} finally {if (_didIteratorError) {throw _iteratorError;}}}}} // Re-sort the pileup so that reads overlapping the locus are on top.
  }, { key: 'sortReadsAt', value: function sortReadsAt(contig, position) {// Strategy: For each pileup row, determine whether it overlaps the locus.
      // Then sort the array indices to get a permutation.
      // Build a new pileup by permuting the old pileup
      // Update all the `row` properties of the relevant visual groups
      var pileup = this.pileupForRef(contig); // Find the groups for which an alignment overlaps the locus.
      var groups = _underscore2['default'].filter(this.groups, function (group) {return _underscore2['default'].any(group.items, function (a) {return a.read.getInterval().containsLocus(contig, position);});}); // For each row, find the left-most point (for sorting).
      var rowsOverlapping = _underscore2['default'].mapObject(_underscore2['default'].groupBy(groups, function (g) {return g.row;}), function (gs) {return _underscore2['default'].min(gs, function (g) {return g.span.start();}).span.start();}); // Sort groups by whether they overlap, then by their start.
      // TODO: is there an easier way to construct the forward map directly?
      var permutation = _underscore2['default'].sortBy(_underscore2['default'].range(0, pileup.length), function (idx) {return rowsOverlapping[idx] || Infinity;});var oldToNew = [];permutation.forEach(function (oldIndex, newIndex) {oldToNew[oldIndex] = newIndex;});var newPileup = _underscore2['default'].range(0, pileup.length).map(function (i) {return pileup[oldToNew[i]];});var normRef = contig in this.refToPileup ? contig : _utils2['default'].altContigName(contig);this.refToPileup[normRef] = newPileup;_underscore2['default'].each(this.groups, function (g) {if (g.span.chrOnContig(contig)) {g.row = oldToNew[g.row];}});} }, { key: 'getInsertStats', value: function getInsertStats() {if (this._insertStats) return this._insertStats;var inserts = _underscore2['default'].map(this.groups, function (g) {return g.items[0].read.getInferredInsertSize();}).filter(function (x) {return x < MAX_INSERT_SIZE;});var insertStats = inserts.length >= MIN_READS_FOR_OUTLIERS ? { minOutlierSize: _utils2['default'].computePercentile(inserts, MIN_OUTLIER_PERCENTILE), maxOutlierSize: _utils2['default'].computePercentile(inserts, MAX_OUTLIER_PERCENTILE) } : { minOutlierSize: 0, maxOutlierSize: Infinity };this._insertStats = insertStats;return insertStats;} }]);return PileupCache;})(_AbstractCache3['default']);function spanAndInsert(_x4) {var _again2 = true;_function2: while (_again2) {var intervals = _x4;_again2 = false;if (intervals.length == 1) {return { insert: null, span: intervals[0] };} else if (intervals.length != 2) {throw 'Called spanAndInsert with ' + intervals.length + ' \notin [1, 2]';}if (!intervals[0].chrOnContig(intervals[1].contig)) {_x4 = [intervals[0]];_again2 = true;continue _function2;}var iv1 = intervals[0].interval, iv2 = intervals[1].interval, insert = iv1.start < iv2.start ? new _Interval2['default'](iv1.stop, iv2.start) : new _Interval2['default'](iv2.stop, iv1.start);var span = _Interval2['default'].boundingInterval([iv1, iv2]);return { insert: insert, span: new _ContigInterval2['default'](intervals[0].contig, span.start, span.stop) };}}
module.exports = PileupCache; // span on the reference (accounting for indels)
// maps groupKey to VisualGroup