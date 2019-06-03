/**
 * This tests whether coverage information is being shown/drawn correctly
 * in the track. The alignment information comes from the test BAM files.
 *
 * 
 */
'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(

'chai');var _sinon = require(

'sinon');var _sinon2 = _interopRequireDefault(_sinon);var _mainPileup = require(

'../../main/pileup');var _mainPileup2 = _interopRequireDefault(_mainPileup);var _mainDataTwoBit = require(
'../../main/data/TwoBit');var _mainDataTwoBit2 = _interopRequireDefault(_mainDataTwoBit);var _mainSourcesTwoBitDataSource = require(
'../../main/sources/TwoBitDataSource');var _mainSourcesTwoBitDataSource2 = _interopRequireDefault(_mainSourcesTwoBitDataSource);var _MappedRemoteFile = require(
'../MappedRemoteFile');var _MappedRemoteFile2 = _interopRequireDefault(_MappedRemoteFile);var _mainRemoteFile = require(
'../../main/RemoteFile');var _mainRemoteFile2 = _interopRequireDefault(_mainRemoteFile);var _dataCanvas = require(
'data-canvas');var _dataCanvas2 = _interopRequireDefault(_dataCanvas);var _async = require(
'../async');

describe('CoverageTrack', function () {
  var testDiv = document.getElementById('testdiv');
  if (!testDiv) throw new Error("Failed to match: testdiv");
  var range = { contig: '17', start: 7500730, stop: 7500790 };

  var p;
  var server = null, response;

  before(function () {
    // server for coverage features
    return new _mainRemoteFile2['default']('/test-data/features.ga4gh.chr1.120000-125000.chr17.7500000-7515100.json').getAllString().then(function (data) {
      response = data;
      server = _sinon2['default'].fakeServer.create();

      server.autoRespond = true;

      // Sinon should ignore 2bit request. RemoteFile handles this request.
      _sinon2['default'].fakeServer.xhr.useFilters = true;
      _sinon2['default'].fakeServer.xhr.addFilter(function (method, url) {
        return url === '/test-data/test.2bit';});

      _sinon2['default'].fakeServer.xhr.addFilter(function (method, url) {
        return url === '/test-data/hg19.2bit.mapped';});

      _sinon2['default'].fakeServer.xhr.addFilter(function (method, url) {
        return url === '/test-data/synth3.normal.17.7500000-7515000.bam';});

      _sinon2['default'].fakeServer.xhr.addFilter(function (method, url) {
        return url === '/test-data/synth3.normal.17.7500000-7515000.bam.bai';});});});




  after(function () {
    server.restore();});


  beforeEach(function () {
    _dataCanvas2['default'].RecordingContext.recordAll();
    // A fixed width container results in predictable x-positions for mismatches.
    testDiv.style.width = '800px';});


  afterEach(function () {
    _dataCanvas2['default'].RecordingContext.reset();
    if (p) p.destroy();
    // avoid pollution between tests.
    testDiv.innerHTML = '';
    testDiv.style.width = '';});




  var twoBitFile = new _MappedRemoteFile2['default'](
  '/test-data/hg19.2bit.mapped', 
  [[0, 16383], [691179834, 691183928], [694008946, 694011447]]);
  var referenceSource = _mainSourcesTwoBitDataSource2['default'].createFromTwoBitFile(new _mainDataTwoBit2['default'](twoBitFile));var _dataCanvas$RecordingContext = 

  _dataCanvas2['default'].RecordingContext;var drawnObjectsWith = _dataCanvas$RecordingContext.drawnObjectsWith;var callsOf = _dataCanvas$RecordingContext.callsOf;

  var findCoverageBins = function findCoverageBins() {
    return drawnObjectsWith(testDiv, '.coverage', function (b) {return b.count;});};


  var findMismatchBins = function findMismatchBins() {
    return drawnObjectsWith(testDiv, '.coverage', function (b) {return b.base;});};


  var findCoverageLabels = function findCoverageLabels() {
    return drawnObjectsWith(testDiv, '.coverage', function (l) {return l.type == 'label';});};


  function createAlignmentPileup() {
    p = _mainPileup2['default'].create(testDiv, { 
      range: range, 
      tracks: [
      { 
        data: referenceSource, 
        viz: _mainPileup2['default'].viz.genome(), 
        isReference: true }, 

      { 
        viz: _mainPileup2['default'].viz.coverage(), 
        data: _mainPileup2['default'].formats.bam({ 
          url: '/test-data/synth3.normal.17.7500000-7515000.bam', 
          indexUrl: '/test-data/synth3.normal.17.7500000-7515000.bam.bai' }), 

        cssClass: 'tumor-coverage', 
        name: 'Coverage' }] });}





  function createFeaturePileup() {
    p = _mainPileup2['default'].create(testDiv, { 
      range: range, 
      tracks: [
      { 
        data: referenceSource, 
        viz: _mainPileup2['default'].viz.genome(), 
        isReference: true }, 

      { 
        viz: _mainPileup2['default'].viz.coverage(), 
        data: _mainPileup2['default'].formats.GAFeature({ 
          endpoint: '/v0.6.0', 
          featureSetId: "WyIxa2dlbm9tZXMiLCJ2cyIsInBoYXNlMy1yZWxlYXNlIl0" }), 

        cssClass: 'tumor-coverage', 
        name: 'FeatureCoverage' }] });}





  var hasCoverage = function hasCoverage() {
    // Check whether the coverage bins are loaded yet
    return testDiv.querySelector('canvas') != null && 
    findCoverageBins().length > 1 && 
    findMismatchBins().length > 0 && 
    findCoverageLabels().length > 1;};


  var hasCoverageWithoutMismatches = function hasCoverageWithoutMismatches() {
    // Check whether the coverage bins are loaded yet
    return testDiv.querySelector('canvas') != null && 
    findCoverageBins().length > 1 && 
    findCoverageLabels().length > 1;};



  it('should create coverage information for all bases shown in the view', function () {
    createAlignmentPileup();
    return (0, _async.waitFor)(hasCoverage, 2000).then(function () {
      var bins = findCoverageBins();
      (0, _chai.expect)(bins).to.have.length.at.least(range.stop - range.start + 1);});});



  it('should show mismatch information', function () {
    createAlignmentPileup();
    return (0, _async.waitFor)(hasCoverage, 2000).then(function () {
      var visibleMismatches = findMismatchBins().
      filter(function (bin) {return bin.position >= range.start && bin.position <= range.stop;});
      (0, _chai.expect)(visibleMismatches).to.deep.equal(
      [{ position: 7500765, count: 23, base: 'C' }, 
      { position: 7500765, count: 22, base: 'T' }]);
      // TODO: IGV shows counts of 20 and 20 at this locus. Whither the five reads?
      // `samtools view` reports the full 45 reads at 17:7500765
    });});


  it('should create correct labels for coverage', function () {
    createAlignmentPileup();
    return (0, _async.waitFor)(hasCoverage, 2000).then(function () {
      // These are the objects being used to draw labels
      var labelTexts = findCoverageLabels();
      (0, _chai.expect)(labelTexts[0].label).to.equal('0X');
      (0, _chai.expect)(labelTexts[labelTexts.length - 1].label).to.equal('50X');

      // Now let's test if they are actually being put on the screen
      var texts = callsOf(testDiv, '.coverage', 'fillText');
      (0, _chai.expect)(texts.map(function (t) {return t[1];})).to.deep.equal(['0X', '25X', '50X']);});});



  it('should create coverage from features', function () {
    createFeaturePileup();
    server.respondWith('POST', '/v0.6.0/features/search', 
    [200, { "Content-Type": "application/json" }, response]);


    return (0, _async.waitFor)(hasCoverageWithoutMismatches, 2000).then(function () {
      // These are the objects being used to draw labels
      var labelTexts = findCoverageLabels();
      (0, _chai.expect)(labelTexts[0].label).to.equal('0X');
      (0, _chai.expect)(labelTexts[labelTexts.length - 1].label).to.equal('1X');

      // Now let's test if they are actually being put on the screen
      var texts = callsOf(testDiv, '.coverage', 'fillText');
      (0, _chai.expect)(texts.map(function (t) {return t[1];})).to.deep.equal(['0X', '1X', '1X']);});});});