/**
 * This tests that the Controls and reference track render correctly, even when
 * an externally-set range uses a different chromosome naming system (e.g. '17'
 * vs 'chr17'). See https://github.com/hammerlab/pileup.js/issues/146
 * 
 */

'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(

'chai');var _sinon = require(

'sinon');var _sinon2 = _interopRequireDefault(_sinon);var _mainPileup = require(

'../../main/pileup');var _mainPileup2 = _interopRequireDefault(_mainPileup);var _dataCanvas = require(
'data-canvas');var _dataCanvas2 = _interopRequireDefault(_dataCanvas);var _async = require(
'../async');var _mainRemoteFile = require(
'../../main/RemoteFile');var _mainRemoteFile2 = _interopRequireDefault(_mainRemoteFile);

describe('GenotypeTrack', function () {
  var server = null, response;

  var testDiv = document.getElementById('testdiv');
  if (!testDiv) throw new Error("Failed to match: testdiv");

  before(function () {

    return new _mainRemoteFile2['default']('/test-data/variants.ga4gh.chr1.10000-11000.json').getAllString().then(function (data) {
      response = data;

      server = _sinon2['default'].createFakeServer();
      server.autoRespond = true;

      // Sinon should ignore 2bit request. RemoteFile handles this request.
      _sinon2['default'].fakeServer.xhr.useFilters = true;
      _sinon2['default'].fakeServer.xhr.addFilter(function (method, url) {
        return url === '/test-data/test.2bit';});

      // Sinon should ignore vcf file requests. RemoteFile handles this request.
      _sinon2['default'].fakeServer.xhr.addFilter(function (method, url) {
        return url === '/test-data/test.vcf';});});});





  after(function () {
    server.restore();});


  beforeEach(function () {
    testDiv.style.width = '800px';
    _dataCanvas2['default'].RecordingContext.recordAll();});


  afterEach(function () {
    _dataCanvas2['default'].RecordingContext.reset();
    // avoid pollution between tests.
    testDiv.innerHTML = '';});


  var drawnObjects = _dataCanvas2['default'].RecordingContext.drawnObjects;

  function ready() {
    return testDiv.getElementsByTagName('canvas').length > 0 && 
    drawnObjects(testDiv, '.genotypeRows').length > 1;}


  it('should render genotypes from vcf file', function () {

    var p = _mainPileup2['default'].create(testDiv, { 
      range: { contig: '17', start: 9386380, stop: 9386390 }, 
      tracks: [
      { 
        viz: _mainPileup2['default'].viz.genome(), 
        data: _mainPileup2['default'].formats.twoBit({ 
          url: '/test-data/test.2bit' }), 

        isReference: true }, 

      { 
        data: _mainPileup2['default'].formats.vcf({ 
          url: '/test-data/test.vcf' }), 

        viz: _mainPileup2['default'].viz.genotypes() }] });




    return (0, _async.waitFor)(ready, 2000).
    then(function () {
      var labels = drawnObjects(testDiv, '.genotypeLabels');

      (0, _chai.expect)(labels).to.have.length(2);
      (0, _chai.expect)(labels).to.deep.equal(
      ["NORMAL", "TUMOR"]);

      var genotypes = drawnObjects(testDiv, '.genotypeRows');

      (0, _chai.expect)(genotypes).to.have.length(3);
      (0, _chai.expect)(genotypes[0]).to.deep.equal("NORMAL");
      (0, _chai.expect)(genotypes[1]).to.deep.equal("TUMOR");
      (0, _chai.expect)(genotypes[2].position).to.deep.equal(9386385);


      p.destroy();});});



  it('should render genotypes from GA4GH Variants', function () {


    server.respondWith('POST', '/v0.6.0/variants/search', 
    [200, { "Content-Type": "application/json" }, response]);


    var callSetId = "WyIxa2dlbm9tZXMiLCJ2cyIsInBoYXNlMy1yZWxlYXNlIiwiSEcwMDA5NiJd";
    var callSetName = "HG00096";

    var p = _mainPileup2['default'].create(testDiv, { 
      range: { contig: '17', start: 9386380, stop: 9386390 }, 
      tracks: [
      { 
        viz: _mainPileup2['default'].viz.genome(), 
        data: _mainPileup2['default'].formats.twoBit({ 
          url: '/test-data/test.2bit' }), 

        isReference: true }, 

      { 
        data: _mainPileup2['default'].formats.GAVariant({ 
          endpoint: '/v0.6.0', 
          variantSetId: "WyIxa2dlbm9tZXMiLCJ2cyIsInBoYXNlMy1yZWxlYXNlIl0", 
          callSetIds: [callSetId], 
          callSetNames: [callSetName] }), 

        viz: _mainPileup2['default'].viz.genotypes() }] });




    return (0, _async.waitFor)(ready, 2000).
    then(function () {
      var labels = drawnObjects(testDiv, '.genotypeLabels');

      (0, _chai.expect)(labels).to.have.length(1);
      (0, _chai.expect)(labels).to.deep.equal(
      [callSetName]);

      var genotypes = drawnObjects(testDiv, '.genotypeRows');

      (0, _chai.expect)(genotypes).to.have.length(2);
      (0, _chai.expect)(genotypes[0]).to.deep.equal(callSetName);
      (0, _chai.expect)(genotypes[1].position).to.deep.equal(9386385);

      p.destroy();});});




  it('should render genotypes from GA4GH Variants when call names are not specified', function () {


    server.respondWith('POST', '/v0.6.0/variants/search', 
    [200, { "Content-Type": "application/json" }, response]);


    var callSetId = "WyIxa2dlbm9tZXMiLCJ2cyIsInBoYXNlMy1yZWxlYXNlIiwiSEcwMDA5NiJd";

    var p = _mainPileup2['default'].create(testDiv, { 
      range: { contig: '17', start: 9386380, stop: 9386390 }, 
      tracks: [
      { 
        viz: _mainPileup2['default'].viz.genome(), 
        data: _mainPileup2['default'].formats.twoBit({ 
          url: '/test-data/test.2bit' }), 

        isReference: true }, 

      { 
        data: _mainPileup2['default'].formats.GAVariant({ 
          endpoint: '/v0.6.0', 
          variantSetId: "WyIxa2dlbm9tZXMiLCJ2cyIsInBoYXNlMy1yZWxlYXNlIl0", 
          callSetIds: [callSetId] }), 

        viz: _mainPileup2['default'].viz.genotypes() }] });





    return (0, _async.waitFor)(ready, 2000).
    then(function () {
      var labels = drawnObjects(testDiv, '.genotypeLabels');

      (0, _chai.expect)(labels).to.have.length(1);
      (0, _chai.expect)(labels).to.deep.equal(
      [callSetId]);

      var genotypes = drawnObjects(testDiv, '.genotypeRows');

      (0, _chai.expect)(genotypes).to.have.length(2);
      (0, _chai.expect)(genotypes[0]).to.deep.equal(callSetId);
      (0, _chai.expect)(genotypes[1].position).to.deep.equal(9386385);

      p.destroy();});});




  it('should render genotypes from GA4GH Variant JSON', function () {

    var p = _mainPileup2['default'].create(testDiv, { 
      range: { contig: '17', start: 9386380, stop: 9386390 }, 
      tracks: [
      { 
        viz: _mainPileup2['default'].viz.genome(), 
        data: _mainPileup2['default'].formats.twoBit({ 
          url: '/test-data/test.2bit' }), 

        isReference: true }, 

      { 
        data: _mainPileup2['default'].formats.variantJson(response), 
        viz: _mainPileup2['default'].viz.genotypes() }] });




    var callSetName = "HG00096";

    return (0, _async.waitFor)(ready, 2000).
    then(function () {
      var labels = drawnObjects(testDiv, '.genotypeLabels');

      (0, _chai.expect)(labels).to.have.length(1);
      (0, _chai.expect)(labels).to.deep.equal(
      [callSetName]);

      var genotypes = drawnObjects(testDiv, '.genotypeRows');

      (0, _chai.expect)(genotypes).to.have.length(2);
      (0, _chai.expect)(genotypes[0]).to.deep.equal(callSetName);
      (0, _chai.expect)(genotypes[1].position).to.deep.equal(9386385);

      p.destroy();});});});