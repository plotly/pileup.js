'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(




'chai');var _mainPileup = require(

'../../main/pileup');var _mainPileup2 = _interopRequireDefault(_mainPileup);var _dataCanvas = require(
'data-canvas');var _dataCanvas2 = _interopRequireDefault(_dataCanvas);var _async = require(
'../async');var _reactAddonsTestUtils = require(

'react-addons-test-utils');var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

describe('VariantTrack', function () {
  var testDiv = document.getElementById('testdiv');
  if (!testDiv) throw new Error("Failed to match: testdiv");

  beforeEach(function () {
    testDiv.style.width = '700px';
    _dataCanvas2['default'].RecordingContext.recordAll();});


  afterEach(function () {
    _dataCanvas2['default'].RecordingContext.reset();
    // avoid pollution between tests.
    testDiv.innerHTML = '';});var 

  drawnObjects = _dataCanvas2['default'].RecordingContext.drawnObjects;

  function ready() {
    return testDiv.getElementsByTagName('canvas').length > 0 && 
    drawnObjects(testDiv, '.variants').length > 0;}


  it('should render variants', function () {
    var variantClickedData = null;
    var variantClicked = function variantClicked(data) {
      variantClickedData = data;};

    var p = _mainPileup2['default'].create(testDiv, { 
      range: { contig: '17', start: 9386380, stop: 9537390 }, 
      tracks: [
      { 
        viz: _mainPileup2['default'].viz.genome(), 
        data: _mainPileup2['default'].formats.twoBit({ 
          url: '/test-data/test.2bit' }), 

        isReference: true }, 

      { 
        data: _mainPileup2['default'].formats.vcf({ 
          url: '/test-data/test.vcf' }), 

        viz: _mainPileup2['default'].viz.variants(), 
        options: { onVariantClicked: variantClicked } }] });




    return (0, _async.waitFor)(ready, 2000).
    then(function () {
      var variants = drawnObjects(testDiv, '.variants');
      (0, _chai.expect)(variants.length).to.be.equal(1);
      var canvasList = testDiv.getElementsByTagName('canvas');
      var canvas = canvasList[1];
      (0, _chai.expect)(variantClickedData).to.be['null'];

      //check clicking on variant
      _reactAddonsTestUtils2['default'].Simulate.click(canvas, { nativeEvent: { offsetX: 0, offsetY: 17 } });

      (0, _chai.expect)(variantClickedData).to.not.be['null'];
      p.destroy();});});});