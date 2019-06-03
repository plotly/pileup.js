'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(


'chai');var _sinon = require(

'sinon');var _sinon2 = _interopRequireDefault(_sinon);var _mainContigInterval = require(

'../../main/ContigInterval');var _mainContigInterval2 = _interopRequireDefault(_mainContigInterval);var _mainSourcesGA4GHVariantSource = require(
'../../main/sources/GA4GHVariantSource');var _mainSourcesGA4GHVariantSource2 = _interopRequireDefault(_mainSourcesGA4GHVariantSource);var _mainRemoteFile = require(
'../../main/RemoteFile');var _mainRemoteFile2 = _interopRequireDefault(_mainRemoteFile);

describe('GA4GHVariantSource', function () {
  var server = null, response, source;

  beforeEach(function () {
    source = _mainSourcesGA4GHVariantSource2['default'].create({ 
      endpoint: '/v0.6.0', 
      variantSetId: "WyIxa2dlbm9tZXMiLCJ2cyIsInBoYXNlMy1yZWxlYXNlIl0", 
      callSetIds: ["WyIxa2dlbm9tZXMiLCJ2cyIsInBoYXNlMy1yZWxlYXNlIiwiSEcwMDA5NiJd"] });


    return new _mainRemoteFile2['default']('/test-data/variants.ga4gh.chr1.10000-11000.json').getAllString().then(function (data) {
      response = data;
      server = _sinon2['default'].fakeServer.create();});});




  afterEach(function () {
    server.restore();});


  it('should fetch variants from a server', function (done) {
    server.respondWith('POST', '/v0.6.0/variants/search', 
    [200, { "Content-Type": "application/json" }, response]);

    var requestInterval = new _mainContigInterval2['default']('1', 10000, 10500);
    (0, _chai.expect)(source.getVariantsInRange(requestInterval)).
    to.deep.equal([]);

    var progress = [];
    source.on('networkprogress', function (e) {progress.push(e);});
    source.on('networkdone', function (e) {progress.push('done');});
    source.on('newdata', function () {
      var variants = source.getVariantsInRange(requestInterval);
      (0, _chai.expect)(variants).to.have.length(3);
      done();});


    source.rangeChanged({ contig: '1', start: 10000, stop: 10500 });
    server.respond();});


  it('should return empty with no data', function (done) {
    server.respondWith('POST', '/v0.6.0/variants/search', 
    [200, { "Content-Type": "application/json" }, response]);

    var requestInterval = new _mainContigInterval2['default']('2', 10000, 20000);
    (0, _chai.expect)(source.getVariantsInRange(requestInterval)).
    to.deep.equal([]);

    var progress = [];
    source.on('networkprogress', function (e) {progress.push(e);});
    source.on('networkdone', function (e) {progress.push('done');});
    source.on('newdata', function () {
      var variants = source.getVariantsInRange(requestInterval);
      (0, _chai.expect)(variants).to.have.length(0);
      done();});


    source.rangeChanged({ contig: '2', start: 10000, stop: 20000 });
    server.respond();});


  it('should return genotype information', function (done) {
    server.respondWith('POST', '/v0.6.0/variants/search', 
    [200, { "Content-Type": "application/json" }, response]);

    var requestInterval = new _mainContigInterval2['default']('1', 10000, 10500);
    (0, _chai.expect)(source.getGenotypesInRange(requestInterval)).
    to.deep.equal([]);

    var progress = [];
    source.on('networkprogress', function (e) {progress.push(e);});
    source.on('networkdone', function (e) {progress.push('done');});
    source.on('newdata', function () {
      var variants = source.getGenotypesInRange(requestInterval);
      (0, _chai.expect)(variants[0].calls).to.have.length(1);
      var call = variants[0].calls[0];
      (0, _chai.expect)(call.genotype).to.have.length(2);
      (0, _chai.expect)(call.callSetName).to.equal("HG00096");
      (0, _chai.expect)(call.phaseset).to.equal("True");
      done();});


    source.rangeChanged({ contig: '1', start: 10000, stop: 10500 });
    server.respond();});


  it('should genotype IDs after data is loaded', function (done) {
    source.getCallNames().then(function (samples) {
      (0, _chai.expect)(samples).to.have.length(1);
      done();});});});