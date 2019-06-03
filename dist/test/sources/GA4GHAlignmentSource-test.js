'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(


'chai');var _sinon = require(

'sinon');var _sinon2 = _interopRequireDefault(_sinon);var _mainContigInterval = require(

'../../main/ContigInterval');var _mainContigInterval2 = _interopRequireDefault(_mainContigInterval);var _mainSourcesGA4GHAlignmentSource = require(
'../../main/sources/GA4GHAlignmentSource');var _mainSourcesGA4GHAlignmentSource2 = _interopRequireDefault(_mainSourcesGA4GHAlignmentSource);var _mainRemoteFile = require(
'../../main/RemoteFile');var _mainRemoteFile2 = _interopRequireDefault(_mainRemoteFile);

describe('GA4GHAlignmentSource', function () {
  var server = null;
  var response = null;

  before(function () {
    return new _mainRemoteFile2['default']('/test-data/alignments.ga4gh.1.10000-11000.json').getAllString().then(function (data) {
      response = data;
      server = _sinon2['default'].fakeServer.create(); // _after_ we do a real XHR!
    });});


  after(function () {
    server.restore();});


  it('should fetch alignments from a server', function (done) {
    server.respondWith('POST', '/v0.6.0a10/reads/search', 
    [200, { "Content-Type": "application/json" }, response]);

    var source = _mainSourcesGA4GHAlignmentSource2['default'].create({ 
      endpoint: '/v0.6.0a10', 
      readGroupId: 'some-group-set:some-read-group', 
      forcedReferenceId: null });


    var requestInterval = new _mainContigInterval2['default']('1', 10000, 10007);
    (0, _chai.expect)(source.getFeaturesInRange(requestInterval)).
    to.deep.equal([]);

    var progress = [];
    source.on('networkprogress', function (e) {progress.push(e);});
    source.on('networkdone', function (e) {progress.push('done');});
    source.on('newdata', function () {
      var reads = source.getFeaturesInRange(requestInterval);
      (0, _chai.expect)(reads).to.have.length(16);
      done();});


    source.rangeChanged({ contig: '1', start: 10000, stop: 10007 });
    server.respond();});});