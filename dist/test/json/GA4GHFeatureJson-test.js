'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(


'chai');var _mainContigInterval = require(

'../../main/ContigInterval');var _mainContigInterval2 = _interopRequireDefault(_mainContigInterval);var _mainJsonGA4GHFeatureJson = require(
'../../main/json/GA4GHFeatureJson');var _mainJsonGA4GHFeatureJson2 = _interopRequireDefault(_mainJsonGA4GHFeatureJson);var _mainRemoteFile = require(
'../../main/RemoteFile');var _mainRemoteFile2 = _interopRequireDefault(_mainRemoteFile);

describe('GA4GHFeatureJson', function () {
  var json;

  before(function () {
    return new _mainRemoteFile2['default']('/test-data/features.ga4gh.chr1.120000-125000.chr17.7500000-7515100.json').getAllString().then(function (data) {
      json = data;});});



  it('should filter features from json', function (done) {

    var source = _mainJsonGA4GHFeatureJson2['default'].create(json);

    var requestInterval = new _mainContigInterval2['default']('chr1', 130000, 135000);

    var features = source.getFeaturesInRange(requestInterval);
    (0, _chai.expect)(features).to.have.length(2);
    done();});



  it('should not fail on empty json string', function (done) {

    var source = _mainJsonGA4GHFeatureJson2['default'].create("{}");

    var requestInterval = new _mainContigInterval2['default']('chr17', 10, 20);

    var reads = source.getFeaturesInRange(requestInterval);
    (0, _chai.expect)(reads).to.have.length(0);
    done();});});