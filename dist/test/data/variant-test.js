'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(


'chai');var _mainDataVariant = require(
'../../main/data/variant');var _underscore = require(
'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _mainRemoteFile = require(
'../../main/RemoteFile');var _mainRemoteFile2 = _interopRequireDefault(_mainRemoteFile);

describe('Variant', function () {
  var json;

  before(function () {
    return new _mainRemoteFile2['default']('/test-data/variants.ga4gh.chr1.10000-11000.json').getAllString().then(function (data) {
      json = data;});});



  it('should parse variants from GA4GH', function (done) {
    // parse json
    var parsedJson = JSON.parse(json);
    var variants = _underscore2['default'].values(parsedJson.variants).map(function (variant) {return _mainDataVariant.Variant.fromGA4GH(variant);});

    (0, _chai.expect)(variants).to.have.length(12);
    (0, _chai.expect)(variants[0].contig).to.equal("1");
    (0, _chai.expect)(variants[0].position).to.equal(10176);
    (0, _chai.expect)(variants[0].ref).to.equal("A");
    (0, _chai.expect)(variants[0].alt[0]).to.equal("AC");
    done();});});