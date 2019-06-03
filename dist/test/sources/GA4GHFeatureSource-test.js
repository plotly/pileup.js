'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(


'chai');var _sinon = require(

'sinon');var _sinon2 = _interopRequireDefault(_sinon);var _mainContigInterval = require(

'../../main/ContigInterval');var _mainContigInterval2 = _interopRequireDefault(_mainContigInterval);var _mainSourcesGA4GHFeatureSource = require(
'../../main/sources/GA4GHFeatureSource');var _mainSourcesGA4GHFeatureSource2 = _interopRequireDefault(_mainSourcesGA4GHFeatureSource);var _mainRemoteFile = require(
'../../main/RemoteFile');var _mainRemoteFile2 = _interopRequireDefault(_mainRemoteFile);

describe('GA4GHFeatureSource', function () {
  var server = null, response, source;

  beforeEach(function () {
    source = _mainSourcesGA4GHFeatureSource2['default'].create({ 
      endpoint: '/v0.6.0', 
      featureSetId: "WyIxa2dlbm9tZXMiLCJ2cyIsInBoYXNlMy1yZWxlYXNlIl0" });


    return new _mainRemoteFile2['default']('/test-data/features.ga4gh.chr1.120000-125000.chr17.7500000-7515100.json').getAllString().then(function (data) {
      response = data;
      server = _sinon2['default'].fakeServer.create();});});




  afterEach(function () {
    server.restore();});


  it('should fetch features from a server', function (done) {
    server.respondWith('POST', '/v0.6.0/features/search', 
    [200, { "Content-Type": "application/json" }, response]);

    var requestInterval = new _mainContigInterval2['default']('chr1', 130000, 135000);
    (0, _chai.expect)(source.getFeaturesInRange(requestInterval)).
    to.deep.equal([]);

    var progress = [];
    source.on('networkprogress', function (e) {progress.push(e);});
    source.on('networkdone', function (e) {progress.push('done');});
    source.on('newdata', function () {
      var features = source.getFeaturesInRange(requestInterval);
      (0, _chai.expect)(features).to.have.length(2);
      done();});


    source.rangeChanged({ contig: 'chr1', start: 130000, stop: 135000 });
    server.respond();});


  it('should return empty with no data', function (done) {
    server.respondWith('POST', '/v0.6.0/features/search', 
    [200, { "Content-Type": "application/json" }, response]);

    var requestInterval = new _mainContigInterval2['default']('2', 10000, 20000);
    (0, _chai.expect)(source.getFeaturesInRange(requestInterval)).
    to.deep.equal([]);

    var progress = [];
    source.on('networkprogress', function (e) {progress.push(e);});
    source.on('networkdone', function (e) {progress.push('done');});
    source.on('newdata', function () {
      var features = source.getFeaturesInRange(requestInterval);
      (0, _chai.expect)(features).to.have.length(0);
      done();});


    source.rangeChanged({ contig: '2', start: 10000, stop: 20000 });
    server.respond();});});