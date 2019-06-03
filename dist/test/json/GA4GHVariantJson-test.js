'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(


'chai');var _mainContigInterval = require(

'../../main/ContigInterval');var _mainContigInterval2 = _interopRequireDefault(_mainContigInterval);var _mainJsonGA4GHVariantJson = require(
'../../main/json/GA4GHVariantJson');var _mainJsonGA4GHVariantJson2 = _interopRequireDefault(_mainJsonGA4GHVariantJson);var _mainRemoteFile = require(
'../../main/RemoteFile');var _mainRemoteFile2 = _interopRequireDefault(_mainRemoteFile);

describe('GA4GHVariantJson', function () {
  var json;

  before(function () {
    return new _mainRemoteFile2['default']('/test-data/variants.ga4gh.chr1.10000-11000.json').getAllString().then(function (data) {
      json = data;});});



  it('should filter variants from json', function (done) {

    var source = _mainJsonGA4GHVariantJson2['default'].create(json);

    var requestInterval = new _mainContigInterval2['default']('1', 10000, 10500);

    var variants = source.getVariantsInRange(requestInterval);
    (0, _chai.expect)(variants).to.have.length(3);
    done();});



  it('should filter genotypes from json', function (done) {

    var source = _mainJsonGA4GHVariantJson2['default'].create(json);

    var requestInterval = new _mainContigInterval2['default']('1', 10000, 10500);

    var variants = source.getGenotypesInRange(requestInterval);
    (0, _chai.expect)(variants).to.have.length(3);
    done();});



  it('should get call names from json', function (done) {

    var source = _mainJsonGA4GHVariantJson2['default'].create(json);

    source.getCallNames().then(function (samples) {
      (0, _chai.expect)(samples).to.have.length(1);
      done();});});



  it('should not fail on empty json string', function (done) {

    var source = _mainJsonGA4GHVariantJson2['default'].create("{}");

    var requestInterval = new _mainContigInterval2['default']('1', 10, 20);

    var variants = source.getVariantsInRange(requestInterval);
    (0, _chai.expect)(variants).to.have.length(0);
    done();});});