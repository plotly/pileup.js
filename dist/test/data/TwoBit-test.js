'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(


'chai');var _mainDataTwoBit = require(

'../../main/data/TwoBit');var _mainDataTwoBit2 = _interopRequireDefault(_mainDataTwoBit);var _mainRemoteFile = require(
'../../main/RemoteFile');var _mainRemoteFile2 = _interopRequireDefault(_mainRemoteFile);

describe('TwoBit', function () {
  function getTestTwoBit() {
    // See test/data/README.md for provenance
    return new _mainDataTwoBit2['default'](new _mainRemoteFile2['default']('/test-data/test.2bit'));}


  it('should have the right contigs', function () {
    var twoBit = getTestTwoBit();
    return twoBit.getContigList().
    then(function (contigs) {
      (0, _chai.expect)(contigs).to.deep.equal(['chr1', 'chr17', 'chr22']);});});



  it('should extract unknowns', function () {
    // This test mirrors dalliance's (chr22:19178140-19178170)
    var twoBit = getTestTwoBit();
    return twoBit.getFeaturesInRange('chr22', 0, 30).
    then(function (basePairs) {
      (0, _chai.expect)(basePairs).to.equal('NTCACAGATCACCATACCATNTNNNGNNCNA');});});



  it('should reject invalid contigs', function () {
    var twoBit = getTestTwoBit();
    return twoBit.getFeaturesInRange('chrZ', 12, 34).
    then(function () {_chai.assert.fail('Should have thrown');})['catch'](
    function (err) {
      (0, _chai.expect)(err).to.match(/Invalid contig/);});});



  it('should add chr', function () {
    var twoBit = getTestTwoBit();
    return twoBit.getFeaturesInRange('22', 0, 4) // 22, not chr22
    .then(function (basePairs) {
      (0, _chai.expect)(basePairs).to.equal('NTCAC');});});



  it('should parse huge headers', function () {
    var twoBit = new _mainDataTwoBit2['default'](new _mainRemoteFile2['default']('/test-data/susScr3-head.2bit'));
    // shouldn't throw an exception
    return twoBit.header.then(function (header) {
      (0, _chai.expect)(header.sequenceCount).to.equal(4583);});});



  // TODO: masked regions
});