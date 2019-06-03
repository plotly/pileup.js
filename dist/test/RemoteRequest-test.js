'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(


'chai');var _sinon = require(

'sinon');var _sinon2 = _interopRequireDefault(_sinon);var _mainRemoteRequest = require(

'../main/RemoteRequest');var _mainRemoteFile = require(
'../main/RemoteFile');var _mainRemoteFile2 = _interopRequireDefault(_mainRemoteFile);

describe('RemoteRequest', function () {
  var server = null, response;
  var url = '/test';
  var contig = 'chr17';
  var start = 10;
  var stop = 20;

  before(function () {
    return new _mainRemoteFile2['default']('/test-data/alignments.ga4gh.chr17.1-250.json').getAllString().then(function (data) {
      response = data;
      server = _sinon2['default'].fakeServer.create();});});



  after(function () {
    server.restore();});


  it('should fetch json from a server', function (done) {
    var remoteRequest = new _mainRemoteRequest.RemoteRequest(url);
    var endpoint = remoteRequest.getEndpointFromContig(contig, start, stop);
    server.respondWith('GET', endpoint, 
    [200, { "Content-Type": "application/json" }, response]);

    var promisedData = remoteRequest.get(contig, start, stop);
    promisedData.then(function (obj) {
      var ret = obj.alignments;
      (0, _chai.expect)(remoteRequest.numNetworkRequests).to.equal(1);
      (0, _chai.expect)(ret.length).to.equal(14);
      done();});


    server.respond();});


  it('should cache data after server response', function (done) {
    var remoteRequest = new _mainRemoteRequest.RemoteRequest(url);
    // verify cache is cleared for testing
    remoteRequest.cache.clear();
    var endpoint = remoteRequest.getEndpointFromContig(contig, start, stop);
    server.respondWith('GET', endpoint, 
    [200, { "Content-Type": "application/json" }, response]);

    var promisedData = remoteRequest.get(contig, start, stop);
    promisedData.then(function (obj) {
      var promisedData2 = remoteRequest.get(contig, start, stop);
      promisedData2.then(function (obj2) {
        var ret = obj2.alignments;
        (0, _chai.expect)(remoteRequest.numNetworkRequests).to.equal(1);
        (0, _chai.expect)(ret.length).to.equal(14);
        done();});});



    server.respond();});});