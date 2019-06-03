'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(


'chai');var _mainDataFeature = require(
'../../main/data/feature');var _mainDataFeature2 = _interopRequireDefault(_mainDataFeature);var _underscore = require(
'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _mainRemoteFile = require(
'../../main/RemoteFile');var _mainRemoteFile2 = _interopRequireDefault(_mainRemoteFile);

describe('Feature', function () {
  var json;

  before(function () {
    return new _mainRemoteFile2['default']('/test-data/features.ga4gh.chr1.120000-125000.chr17.7500000-7515100.json').getAllString().then(function (data) {
      json = data;});});



  it('should parse features from GA4GH', function (done) {
    // parse json
    var parsedJson = JSON.parse(json);
    var features = _underscore2['default'].values(parsedJson.features).map(function (feature) {return _mainDataFeature2['default'].fromGA4GH(feature);});

    (0, _chai.expect)(features).to.have.length(10);
    (0, _chai.expect)(features[0].position.contig).to.equal("chr1");
    (0, _chai.expect)(features[0].position.start()).to.equal(89295);
    (0, _chai.expect)(features[0].position.stop()).to.equal(120932);
    (0, _chai.expect)(features[0].id).to.equal("WyIxa2dlbm9tZXMiLCJnZW5jb2RlX3YyNGxpZnQzNyIsIjE0MDUwOTE3MjM1NDE5MiJd");
    (0, _chai.expect)(features[0].score).to.equal(1000);
    done();});});