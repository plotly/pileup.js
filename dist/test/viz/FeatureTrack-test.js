/**
 * This tests whether feature information is being shown/drawn correctly
 * in the track.
 *
 * 
 */
'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(

'chai');var _underscore = require(

'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _mainRemoteFile = require(
'../../main/RemoteFile');var _mainRemoteFile2 = _interopRequireDefault(_mainRemoteFile);var _mainPileup = require(
'../../main/pileup');var _mainPileup2 = _interopRequireDefault(_mainPileup);var _dataCanvas = require(
'data-canvas');var _dataCanvas2 = _interopRequireDefault(_dataCanvas);var _async = require(
'../async');var _mainVizPileuputils = require(

'../../main/viz/pileuputils');var _reactAddonsTestUtils = require(

'react-addons-test-utils');var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

describe('FeatureTrack', function () {
  var testDiv = document.getElementById('testdiv');
  if (!testDiv) throw new Error("Failed to match: testdiv");

  var drawnObjects = _dataCanvas2['default'].RecordingContext.drawnObjects;

  function ready() {
    return testDiv.querySelector('.features canvas') !== null && 
    testDiv.querySelector('.features canvas') !== undefined && 
    drawnObjects(testDiv, '.features').length > 0;}


  describe('jsonFeatures', function () {
    var json;

    beforeEach(function () {
      testDiv.style.width = '800px';
      _dataCanvas2['default'].RecordingContext.recordAll();});


    afterEach(function () {
      _dataCanvas2['default'].RecordingContext.reset();
      // avoid pollution between tests.
      testDiv.innerHTML = '';});


    before(function () {
      return new _mainRemoteFile2['default']('/test-data/features.ga4gh.chr1.120000-125000.chr17.7500000-7515100.json').getAllString().then(function (data) {
        json = data;});});



    it('should render features with json', function () {
      var featureClickedData = null;
      var featureClicked = function featureClicked(data) {
        featureClickedData = data;};


      var p = _mainPileup2['default'].create(testDiv, { 
        range: { contig: 'chr1', start: 130000, stop: 135000 }, 
        tracks: [
        { 
          viz: _mainPileup2['default'].viz.genome(), 
          data: _mainPileup2['default'].formats.twoBit({ 
            url: '/test-data/test.2bit' }), 

          isReference: true }, 

        { 
          viz: _mainPileup2['default'].viz.features(), 
          data: _mainPileup2['default'].formats.featureJson(json), 
          options: { onFeatureClicked: featureClicked } }] });




      return (0, _async.waitFor)(ready, 2000).
      then(function () {
        var features = drawnObjects(testDiv, '.features');
        // there can be duplicates in the case where features are
        // overlapping  more than one section of the canvas
        features = _underscore2['default'].uniq(features, false, function (x) {
          return x.position.start();});


        (0, _chai.expect)(features).to.have.length(4);
        (0, _chai.expect)(features.map(function (f) {return f.position.start();})).to.deep.equal(
        [89295, 92230, 110953, 120725]);

        var height = Math.round((0, _mainVizPileuputils.yForRow)(4) * window.devicePixelRatio); // should be 4 rows
        features = testDiv.querySelector('.features');
        (0, _chai.expect)(features).to.not.be['null'];
        if (features != null) {
          (0, _chai.expect)(features.style.height).to.equal(height + 'px');}


        // check clicking on feature
        var canvasList = testDiv.getElementsByTagName('canvas');
        var canvas = canvasList[1];
        (0, _chai.expect)(featureClickedData).to.be['null'];
        _reactAddonsTestUtils2['default'].Simulate.click(canvas, { nativeEvent: { offsetX: 430, offsetY: 50 * window.devicePixelRatio } });
        (0, _chai.expect)(featureClickedData).to.not.be['null'];

        p.destroy();});});});




  describe('bigBedFeatures', function () {

    beforeEach(function () {
      testDiv.style.width = '800px';
      _dataCanvas2['default'].RecordingContext.recordAll();});


    afterEach(function () {
      _dataCanvas2['default'].RecordingContext.reset();
      // avoid pollution between tests.
      testDiv.innerHTML = '';});


    it('should render features with bigBed file', function () {

      var p = _mainPileup2['default'].create(testDiv, { 
        range: { contig: 'chr17', start: 10000, stop: 16500 }, 
        tracks: [
        { 
          viz: _mainPileup2['default'].viz.genome(), 
          data: _mainPileup2['default'].formats.twoBit({ 
            url: '/test-data/test.2bit' }), 

          isReference: true }, 

        { 
          viz: _mainPileup2['default'].viz.features(), 
          data: _mainPileup2['default'].formats.bigBed({ 
            url: '/test-data/chr17.22.10000-21000.bb' }), 

          name: 'Features' }] });





      return (0, _async.waitFor)(ready, 2000).then(function () {
        var features = drawnObjects(testDiv, '.features');
        // there can be duplicates in the case where features are
        // overlapping  more than one section of the canvas
        features = _underscore2['default'].uniq(features, false, function (x) {
          return x.position.start();});


        (0, _chai.expect)(features).to.have.length.at.least(2);

        p.setRange({ contig: 'chr22', start: 20000, stop: 21000 });}).
      delay(300).then(function () {
        var features = drawnObjects(testDiv, '.features');
        // there can be duplicates in the case where features are
        // overlapping  more than one section of the canvas
        features = _underscore2['default'].uniq(features, false, function (x) {
          return x.position.start();});


        (0, _chai.expect)(features).to.have.length(10);

        // canvas height should be maxed out, should not exceed parent height limits
        var expectedHeight = Math.round(150 * window.devicePixelRatio);
        var featureCanvas = testDiv.querySelector('.features');
        (0, _chai.expect)(featureCanvas).to.not.be['null'];
        if (featureCanvas != null) {
          (0, _chai.expect)(featureCanvas.style.height).to.equal(expectedHeight + 'px');}

        p.destroy();});});});});