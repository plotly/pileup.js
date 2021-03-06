'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(


'chai');var _q = require(

'q');var _q2 = _interopRequireDefault(_q);var _mainDataBigBed = require(

'../../main/data/BigBed');var _mainDataBigBed2 = _interopRequireDefault(_mainDataBigBed);var _mainContigInterval = require(
'../../main/ContigInterval');var _mainContigInterval2 = _interopRequireDefault(_mainContigInterval);var _underscore = require(
"underscore");var _underscore2 = _interopRequireDefault(_underscore);

describe('BigBed', function () {
  function getTestBigBed() {
    return new _mainDataBigBed2['default']('/test-data/itemRgb.bb'); // See test-data/README.md
  }

  function getUncompressedTestBigBed() {
    return new _mainDataBigBed2['default']('/test-data/simple17unc.bb'); // See test-data/README.md
  }

  it('should extract features in a range', function () {
    var bb = getTestBigBed();

    return bb.getFeaturesInRange('chrX', 151077036, 151078532).
    then(function (features) {
      // Here's what these two lines in the file look like:
      // chrX 151077031 151078198 MID_BLUE 0 - 151077031 151078198 0,0,128
      // chrX 151078198 151079365 VIOLET_RED1 0 - 151078198 151079365 255,62,150
      (0, _chai.expect)(features).to.have.length(2);
      (0, _chai.expect)(features[0].contig).to.equal('chrX');
      (0, _chai.expect)(features[0].start).to.equal(151077031);
      (0, _chai.expect)(features[0].stop).to.equal(151078198);
      (0, _chai.expect)(features[1].contig).to.equal('chrX');
      (0, _chai.expect)(features[1].start).to.equal(151078198);
      (0, _chai.expect)(features[1].stop).to.equal(151079365);

      var rest0 = features[0].rest.split('\t');
      (0, _chai.expect)(rest0).to.have.length(6);
      (0, _chai.expect)(rest0[0]).to.equal('MID_BLUE');
      (0, _chai.expect)(rest0[2]).to.equal('-');
      (0, _chai.expect)(rest0[5]).to.equal('0,0,128');

      var rest1 = features[1].rest.split('\t');
      (0, _chai.expect)(rest1).to.have.length(6);
      (0, _chai.expect)(rest1[0]).to.equal('VIOLET_RED1');
      (0, _chai.expect)(rest1[2]).to.equal('-');
      (0, _chai.expect)(rest1[5]).to.equal('255,62,150');});});



  it('should extract features from an uncompressed BigBed', function () {
    var bb = getUncompressedTestBigBed();

    return bb.getFeaturesInRange('chr17', 60000, 270000).
    then(function (features) {
      // Here's what these three lines in the file look like:
      // chr17	62296	202576
      // chr17	62296	202576
      // chr17	260433	264713
      (0, _chai.expect)(features).to.deep.equal(
      [
      { contig: 'chr17', start: 62296, stop: 202576, rest: "" }, 
      { contig: 'chr17', start: 62296, stop: 202576, rest: "" }, 
      { contig: 'chr17', start: 260433, stop: 264713, rest: "" }]);});});





  it('should have inclusive ranges', function () {
    // The matches looks like this:
    // chrX 151071196 151072363 RED
    // chrX 151094536 151095703 PeachPuff
    var red = [151071196, 151072362]; // note: stop is inclusive

    var bb = getTestBigBed();
    var expectN = function expectN(n) {return function (features) {
        (0, _chai.expect)(features).to.have.length(n);};};


    return _q2['default'].all([
    // request for precisely one row from the file.
    bb.getFeaturesInRange('chrX', red[0], red[1]).
    then(expectN(1)), 
    // the additional base in the range hits another row.
    bb.getFeaturesInRange('chrX', red[0], 1 + red[1]).
    then(expectN(2)), 
    // this overlaps exactly one base pair of the first feature.
    bb.getFeaturesInRange('chrX', red[0] - 1000, red[0]).
    then(expectN(1)), 
    // but this range ends one base pair before it.
    bb.getFeaturesInRange('chrX', red[0] - 1000, red[0] - 1).
    then(expectN(0))]);});



  it('should add "chr" to contig names', function () {
    var bb = getTestBigBed();

    return bb.getFeaturesInRange('X', 151077036, 151078532).
    then(function (features) {
      // (same as 'should extract features in a range' test)
      (0, _chai.expect)(features).to.have.length(2);
      (0, _chai.expect)(features[0].contig).to.equal('chrX');
      (0, _chai.expect)(features[1].contig).to.equal('chrX');});});



  it('should cache requests in a block', function () {
    var bb = getTestBigBed();

    var remote = bb.remoteFile;
    return bb.getFeaturesInRange('X', 151077036, 151078532).then(function () {
      // cache has been warmed up -- flush it to get a deterministic test.
      remote.clearCache();
      remote.numNetworkRequests = 0;

      // This should generate one new request.
      return bb.getFeaturesInRange('X', 151077036, 151078532);}).
    then(function (features) {
      (0, _chai.expect)(features).to.have.length(2);
      (0, _chai.expect)(remote.numNetworkRequests).to.equal(1);
      return bb.getFeaturesInRange('X', 151071196, 151072362);}).
    then(function (features) {
      // Another request in the same block should not generate a new request.
      (0, _chai.expect)(features).to.have.length(1);
      (0, _chai.expect)(remote.numNetworkRequests).to.equal(1);
      return bb.getFeaturesInRange('Y', 50, 51);}).
    then(function (features) {
      // But a request from another block (the 'Y' block) should.
      (0, _chai.expect)(features).to.have.length(1);
      (0, _chai.expect)(remote.numNetworkRequests).to.equal(2);});});



  it('should fetch full blocks', function () {
    var bb = getTestBigBed();

    var range = new _mainContigInterval2['default']('X', 151077036, 151078532);
    return bb.getFeatureBlocksOverlapping(range).
    then(function (blockFeatures) {
      (0, _chai.expect)(blockFeatures).to.have.length(1); // just one block fetched.
      var range = blockFeatures[0].range;

      var rows = blockFeatures[0].rows;
      (0, _chai.expect)(rows).to.have.length(21); // all the chrX features.
      (0, _chai.expect)(range.toString()).to.equal('chrX:151071196-151095703');});});



  it('file with 257 contigs', function () {
    var bigBed = new _mainDataBigBed2['default']('/test-data/257-contigs.bb');
    return bigBed.contigMap.then(function (contigs) {
      (0, _chai.expect)(_underscore2['default'].keys(contigs).length).to.equal(257);});});



  // Things left to test:
  // - getFeatures which crosses a block boundary
  // - uncompressed bigBed file.
});