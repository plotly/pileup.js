'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(


'chai');var _mainContigInterval = require(

'../../main/ContigInterval');var _mainContigInterval2 = _interopRequireDefault(_mainContigInterval);var _mainJsonGA4GHAlignmentJson = require(
'../../main/json/GA4GHAlignmentJson');var _mainJsonGA4GHAlignmentJson2 = _interopRequireDefault(_mainJsonGA4GHAlignmentJson);var _mainRemoteFile = require(
'../../main/RemoteFile');var _mainRemoteFile2 = _interopRequireDefault(_mainRemoteFile);

describe('GA4GHAlignmentJson', function () {
  var json;

  before(function () {
    return new _mainRemoteFile2['default']('/test-data/alignments.ga4gh.chr17.1-250.json').getAllString().then(function (data) {
      json = data;});});



  it('should filter alignments from json', function (done) {

    var source = _mainJsonGA4GHAlignmentJson2['default'].create(json);

    var requestInterval = new _mainContigInterval2['default']('chr17', 10, 20);

    var reads = source.getFeaturesInRange(requestInterval);
    (0, _chai.expect)(reads).to.have.length(2);
    done();});



  it('should not fail on empty json string', function (done) {

    var source = _mainJsonGA4GHAlignmentJson2['default'].create("{}");

    var requestInterval = new _mainContigInterval2['default']('chr17', 10, 20);

    var reads = source.getFeaturesInRange(requestInterval);
    (0, _chai.expect)(reads).to.have.length(0);
    done();});});