/**
 * Tools for working with indexed BAM (BAI) files.
 * These have nothing to say about parsing the BAM file itself. For that, see
 * bam.js.
 * 
 */
'use strict';var _slicedToArray = (function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i['return']) _i['return']();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError('Invalid attempt to destructure non-iterable instance');}};})();var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}var _jbinary = require(





'jbinary');var _jbinary2 = _interopRequireDefault(_jbinary);var _jdataview = require(
'jdataview');var _jdataview2 = _interopRequireDefault(_jdataview);var _underscore = require(
'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _q = require(
'q');var _q2 = _interopRequireDefault(_q);var _formatsBamTypes = require(
'./formats/bamTypes');var _formatsBamTypes2 = _interopRequireDefault(_formatsBamTypes);var _VirtualOffset = require(
'./VirtualOffset');var _VirtualOffset2 = _interopRequireDefault(_VirtualOffset);


// In the event that index chunks aren't available from an external source, it
// winds up saving time to do a fast pass over the data to compute them. This
// allows us to parse a single contig at a time using jBinary.
function computeIndexChunks(buffer) {
  var BLOCK_SIZE = 65536;
  var view = new _jdataview2['default'](buffer, 0, buffer.byteLength, true /* little endian */);

  var minBlockIndex = Infinity;
  var contigStartOffsets = [];
  view.getInt32(); // magic
  var n_ref = view.getInt32();
  for (var j = 0; j < n_ref; j++) {
    contigStartOffsets.push(view.tell());
    var n_bin = view.getInt32();
    for (var i = 0; i < n_bin; i++) {
      view.getUint32(); // bin ID
      var n_chunk = view.getInt32();
      view.skip(n_chunk * 16);}

    var n_intv = view.getInt32();
    if (n_intv) {
      var offset = _VirtualOffset2['default'].fromBlob(view.getBytes(8), 0), 
      coffset = offset.coffset + (offset.uoffset ? BLOCK_SIZE : 0);
      minBlockIndex = coffset ? Math.min(coffset, minBlockIndex) : BLOCK_SIZE;
      view.skip((n_intv - 1) * 8);}}


  contigStartOffsets.push(view.tell());

  // At this point, `minBlockIndex` should be non-Infinity (see #405 & #406)
  return { 
    chunks: _underscore2['default'].zip(_underscore2['default'].initial(contigStartOffsets), _underscore2['default'].rest(contigStartOffsets)), 
    minBlockIndex: minBlockIndex };}




function readChunks(buf) {
  return new _jbinary2['default'](buf, _formatsBamTypes2['default'].TYPE_SET).read('ChunksArray');}


function readIntervals(blob) {
  var intervals = new Array(Math.floor(blob.length / 8));
  for (var pos = 0; pos < blob.length - 7; pos += 8) {
    intervals[pos >> 3] = _VirtualOffset2['default'].fromBlob(blob, pos);}

  return intervals;}


function doChunksOverlap(a, b) {
  return a.chunk_beg.isLessThanOrEqual(b.chunk_end) && 
  b.chunk_beg.isLessThanOrEqual(a.chunk_end);}


function areChunksAdjacent(a, b) {
  return a.chunk_beg.isEqual(b.chunk_end) || a.chunk_end.isEqual(b.chunk_beg);}


// This coalesces adjacent & overlapping chunks to minimize fetches.
// It also applies the "linear optimization", which can greatly reduce the
// number of network fetches needed to fulfill a request.
function optimizeChunkList(chunkList, minimumOffset) {
  chunkList.sort(function (a, b) {
    var result = a.chunk_beg.compareTo(b.chunk_beg);
    if (result === 0) {
      result = a.chunk_end.compareTo(b.chunk_end);}

    return result;});


  var newChunks = [];
  chunkList.forEach(function (chunk) {
    if (chunk.chunk_end.isLessThan(minimumOffset)) {
      return; // linear index optimization
    }

    if (newChunks.length === 0) {
      newChunks.push(chunk);
      return;}


    var lastChunk = newChunks[newChunks.length - 1];
    if (!doChunksOverlap(lastChunk, chunk) && 
    !areChunksAdjacent(lastChunk, chunk)) {
      newChunks.push(chunk);} else 
    {
      if (lastChunk.chunk_end.isLessThan(chunk.chunk_end)) {
        lastChunk.chunk_end = chunk.chunk_end;}}});




  return newChunks;}


// This version of BaiFile is not completely immediate, but it does guarantee
// that the index chunks are available.
var ImmediateBaiFile = (function () {




  // ref ID -> linear index

  function ImmediateBaiFile(buffer, remoteFile, indexChunks) {_classCallCheck(this, ImmediateBaiFile);
    this.buffer = buffer;
    this.remoteFile = remoteFile;
    if (buffer) {
      this.indexChunks = computeIndexChunks(buffer);} else 
    {
      if (indexChunks) {
        this.indexChunks = indexChunks;} else 
      {
        throw 'Without index chunks, the entire BAI buffer must be loaded';}}


    this.indexCache = new Array(this.indexChunks.chunks.length);
    this.intervalsCache = new Array(this.indexChunks.chunks.length);}_createClass(ImmediateBaiFile, [{ key: 'getChunksForInterval', value: 


    function getChunksForInterval(range) {var _this = this;
      if (range.contig < 0 || range.contig > this.indexChunks.chunks.length) {
        return _q2['default'].reject('Invalid contig ' + range.contig);}


      var bins = reg2bins(range.start(), range.stop() + 1);

      return this.indexForContig(range.contig).then(function (contigIndex) {
        var chunks = _underscore2['default'].chain(contigIndex.bins).
        filter(function (b) {return bins.indexOf(b.bin) >= 0;}).
        map(function (b) {return readChunks(b.chunks);}).
        flatten().
        value();

        var linearIndex = _this.getIntervals(contigIndex.intervals, range.contig);
        var startIdx = Math.max(0, Math.floor(range.start() / 16384));
        var minimumOffset = linearIndex[startIdx];

        chunks = optimizeChunkList(chunks, minimumOffset);

        return chunks;});}



    // Retrieve and parse the index for a particular contig.
  }, { key: 'indexForContig', value: function indexForContig(contig) {
      var v = this.indexCache[contig];
      if (v) {
        return v;}var _indexChunks$chunks$contig = _slicedToArray(


      this.indexChunks.chunks[contig], 2);var start = _indexChunks$chunks$contig[0];var stop = _indexChunks$chunks$contig[1];
      this.indexCache[contig] = this.getSlice(start, stop).then(function (buffer) {
        var jb = new _jbinary2['default'](buffer, _formatsBamTypes2['default'].TYPE_SET);
        return jb.read('BaiIndex');});

      return this.indexCache[contig];} }, { key: 'getSlice', value: 


    function getSlice(start, stop) {
      if (this.buffer) {
        return _q2['default'].when(this.buffer.slice(start, stop));} else 
      {
        return this.remoteFile.getBytes(start, stop - start + 1);}}



    // Cached wrapper around readIntervals()
  }, { key: 'getIntervals', value: function getIntervals(blob, refId) {
      var linearIndex = this.intervalsCache[refId];
      if (linearIndex) {
        return linearIndex;}

      linearIndex = readIntervals(blob);
      this.intervalsCache[refId] = linearIndex;
      return linearIndex;} }]);return ImmediateBaiFile;})();var 




BaiFile = (function () {



  function BaiFile(remoteFile, indexChunks) {_classCallCheck(this, BaiFile);
    this.remoteFile = remoteFile;
    if (indexChunks) {
      this.immediate = _q2['default'].when(new ImmediateBaiFile(null, remoteFile, indexChunks));} else 
    {
      this.immediate = remoteFile.getAll().then(function (buf) {
        return new ImmediateBaiFile(buf, remoteFile, indexChunks);});}


    this.immediate.done();}
















  // These functions come directly from the SAM paper
  // See https://samtools.github.io/hts-specs/SAMv1.pdf section 5.3

  // calculate the list of bins that may overlap with region [beg,end) (zero-based)
  _createClass(BaiFile, [{ key: 'getChunksForInterval', value: function getChunksForInterval(range) {return this.immediate.then(function (immediate) {return immediate.getChunksForInterval(range);});} }, { key: 'getHeaderSize', value: function getHeaderSize() {return this.immediate.then(function (immediate) {return immediate.indexChunks.minBlockIndex;});} }]);return BaiFile;})();function reg2bins(beg, end) {
  var k, list = [];
  --end;
  list.push(0);
  for (k = 1 + (beg >> 26); k <= 1 + (end >> 26); ++k) list.push(k);
  for (k = 9 + (beg >> 23); k <= 9 + (end >> 23); ++k) list.push(k);
  for (k = 73 + (beg >> 20); k <= 73 + (end >> 20); ++k) list.push(k);
  for (k = 585 + (beg >> 17); k <= 585 + (end >> 17); ++k) list.push(k);
  for (k = 4681 + (beg >> 14); k <= 4681 + (end >> 14); ++k) list.push(k);
  return list;}


module.exports = BaiFile; // ref ID -> parsed BaiIndex