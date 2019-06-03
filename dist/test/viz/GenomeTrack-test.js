/**
 * This tests that the Controls and reference track render correctly, even when
 * an externally-set range uses a different chromosome naming system (e.g. '17'
 * vs 'chr17'). See https://github.com/hammerlab/pileup.js/issues/146
 * 
 */

'use strict';var _slicedToArray = (function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i['return']) _i['return']();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError('Invalid attempt to destructure non-iterable instance');}};})();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(

'chai');var _reactAddonsTestUtils = require(

'react-addons-test-utils');var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);var _mainPileup = require(

'../../main/pileup');var _mainPileup2 = _interopRequireDefault(_mainPileup);var _mainDataTwoBit = require(
'../../main/data/TwoBit');var _mainDataTwoBit2 = _interopRequireDefault(_mainDataTwoBit);var _mainSourcesTwoBitDataSource = require(
'../../main/sources/TwoBitDataSource');var _mainSourcesTwoBitDataSource2 = _interopRequireDefault(_mainSourcesTwoBitDataSource);var _dataCanvas = require(
'data-canvas');var _dataCanvas2 = _interopRequireDefault(_dataCanvas);var _MappedRemoteFile = require(
'../MappedRemoteFile');var _MappedRemoteFile2 = _interopRequireDefault(_MappedRemoteFile);var _async = require(
'../async');

describe('GenomeTrack', function () {
  var testDiv = document.getElementById('testdiv');
  if (!testDiv) throw new Error("Failed to match: testdiv");

  beforeEach(function () {
    // A fixed width container results in predictable x-positions for mismatches.
    testDiv.style.width = '800px';
    _dataCanvas2['default'].RecordingContext.recordAll();});


  afterEach(function () {
    _dataCanvas2['default'].RecordingContext.reset();
    // avoid pollution between tests.
    testDiv.innerHTML = '';
    testDiv.style.width = '';});


  var twoBitFile = new _MappedRemoteFile2['default'](
  '/test-data/hg19.2bit.mapped', 
  [[0, 16383], [691179834, 691183928], [694008946, 694011447]]), 
  referenceSource = _mainSourcesTwoBitDataSource2['default'].createFromTwoBitFile(new _mainDataTwoBit2['default'](twoBitFile));var 

  drawnObjects = _dataCanvas2['default'].RecordingContext.drawnObjects;
  var hasReference = function hasReference() {
    // The reference initially shows "unknown" base pairs, so we have to
    // check for a specific known one to ensure that it's really loaded.
    return testDiv.querySelector('canvas') != null && 
    drawnObjects(testDiv, '.reference').length > 0;};


  var referenceTrackLoaded = function referenceTrackLoaded() {
    //this can be done in a preatier way
    return testDiv.querySelector('canvas') !== null;};


  it('should tolerate non-chr ranges', function () {
    var p = _mainPileup2['default'].create(testDiv, { 
      range: { contig: '17', start: 7500730, stop: 7500790 }, 
      tracks: [
      { 
        data: referenceSource, 
        viz: _mainPileup2['default'].viz.genome(), 
        isReference: true }] });




    return (0, _async.waitFor)(hasReference, 2000).then(function () {
      // The contig selector should list have "chr" prefixes & an active selection.
      var options = testDiv.querySelectorAll('option');
      (0, _chai.expect)(options).to.have.length.above(20);
      (0, _chai.expect)(options[0].textContent).to.equal('chr1');
      var opt17 = options[17];
      (0, _chai.expect)(opt17.textContent).to.equal('chr17');
      (0, _chai.expect)(opt17.selected).to.be['true'];
      (0, _chai.expect)(p.getRange()).to.deep.equal({ 
        contig: 'chr17', 
        start: 7500730, 
        stop: 7500790 });

      p.destroy();});});



  var getInputs = function getInputs(selector) {
    var els = testDiv.querySelectorAll(selector);
    // note: this isn't really true, but it makes flow happy
    return els;};


  /**
   * Test case show situation when we zoom in from very global view
   * (range span is milions of nucleotides) into very narrow view
   * (tens of nucleotides).
   */
  it('should zoom from huge zoom out', function () {

    var p = _mainPileup2['default'].create(testDiv, { 
      range: { contig: '17', start: 0, stop: 114529884 }, 
      tracks: [{ 
        data: referenceSource, 
        viz: _mainPileup2['default'].viz.genome(), 
        isReference: true }] });




    (0, _chai.expect)(testDiv.querySelectorAll('.zoom-controls')).to.have.length(1);

    var buttons = testDiv.querySelectorAll('.controls button');var _buttons = _slicedToArray(
    buttons, 3);var goBtn = _buttons[0];var minusBtn = _buttons[1];var plusBtn = _buttons[2];var _getInputs = 
    getInputs('.controls input[type="text"]');var _getInputs2 = _slicedToArray(_getInputs, 1);var locationTxt = _getInputs2[0];
    (0, _chai.expect)(goBtn.textContent).to.equal('Go');
    (0, _chai.expect)(minusBtn.className).to.equal('btn-zoom-out');
    (0, _chai.expect)(plusBtn.className).to.equal('btn-zoom-in');

    return (0, _async.waitFor)(referenceTrackLoaded, 2000).then(function () {
      //in global view we shouldn't see reference track
      (0, _chai.expect)(hasReference()).to.be['false'];
      p.setRange({ contig: '17', start: 7500725, stop: 7500775 });}).
    delay(300).then(function () {
      //after zoom in we should see reference track
      (0, _chai.expect)(hasReference()).to.be['true'];
      (0, _chai.expect)(locationTxt.value).to.equal('7,500,725-7,500,775');
      p.destroy();});});



  it('should zoom in and out', function () {
    var p = _mainPileup2['default'].create(testDiv, { 
      range: { contig: '17', start: 7500725, stop: 7500775 }, 
      tracks: [
      { 
        data: referenceSource, 
        viz: _mainPileup2['default'].viz.genome(), 
        isReference: true }] });




    (0, _chai.expect)(testDiv.querySelectorAll('.zoom-controls')).to.have.length(1);

    var buttons = testDiv.querySelectorAll('.controls button');var _buttons2 = _slicedToArray(
    buttons, 3);var goBtn = _buttons2[0];var minusBtn = _buttons2[1];var plusBtn = _buttons2[2];var _getInputs3 = 
    getInputs('.controls input[type="text"]');var _getInputs32 = _slicedToArray(_getInputs3, 1);var locationTxt = _getInputs32[0];
    (0, _chai.expect)(goBtn.textContent).to.equal('Go');
    (0, _chai.expect)(minusBtn.className).to.equal('btn-zoom-out');
    (0, _chai.expect)(plusBtn.className).to.equal('btn-zoom-in');

    return (0, _async.waitFor)(hasReference, 2000).then(function () {
      (0, _chai.expect)(locationTxt.value).to.equal('7,500,725-7,500,775');
      _reactAddonsTestUtils2['default'].Simulate.click(minusBtn);}).
    delay(50).then(function () {
      (0, _chai.expect)(p.getRange()).to.deep.equal({ 
        contig: 'chr17', 
        start: 7500700, 
        stop: 7500800 });

      (0, _chai.expect)(locationTxt.value).to.equal('7,500,700-7,500,800');
      _reactAddonsTestUtils2['default'].Simulate.click(plusBtn);}).
    delay(50).then(function () {
      (0, _chai.expect)(p.getRange()).to.deep.equal({ 
        contig: 'chr17', 
        start: 7500725, 
        stop: 7500775 });

      (0, _chai.expect)(locationTxt.value).to.equal('7,500,725-7,500,775');
      p.destroy();});});



  it('should zoom according to the value of the slider', function () {
    var p = _mainPileup2['default'].create(testDiv, { 
      range: { contig: '17', start: 7500725, stop: 7500775 }, 
      tracks: [
      { 
        data: referenceSource, 
        viz: _mainPileup2['default'].viz.genome(), 
        isReference: true }] });




    (0, _chai.expect)(testDiv.querySelectorAll('.zoom-controls')).to.have.length(1);
    (0, _chai.expect)(testDiv.querySelectorAll('.zoom-slider')).to.have.length(1);
    // querySelectorAll returns HTMLElement
    // cast to any and then to HTMLInputElement to make flow happy
    var slider = testDiv.querySelectorAll('.zoom-slider')[0];var _getInputs4 = 
    getInputs('.controls input[type="text"]');var _getInputs42 = _slicedToArray(_getInputs4, 1);var locationTxt = _getInputs42[0];

    return (0, _async.waitFor)(hasReference, 2000).then(function () {
      slider.value = "-1";
      _reactAddonsTestUtils2['default'].Simulate.input(slider);}).

    delay(50).then(function () {

      (0, _chai.expect)(p.getRange()).to.deep.equal({ 
        contig: 'chr17', 
        start: 7500748, 
        stop: 7500752 });

      (0, _chai.expect)(locationTxt.value).to.equal('7,500,748-7,500,752');
      slider.value = "-2";
      _reactAddonsTestUtils2['default'].Simulate.input(slider);}).
    delay(50).then(function () {
      (0, _chai.expect)(p.getRange()).to.deep.equal({ 
        contig: 'chr17', 
        start: 7500746, 
        stop: 7500754 });

      (0, _chai.expect)(locationTxt.value).to.equal('7,500,746-7,500,754');
      slider.value = "-5";
      _reactAddonsTestUtils2['default'].Simulate.input(slider);}).
    delay(50).then(function () {
      (0, _chai.expect)(p.getRange()).to.deep.equal({ 
        contig: 'chr17', 
        start: 7500718, 
        stop: 7500782 });

      (0, _chai.expect)(locationTxt.value).to.equal('7,500,718-7,500,782');
      p.destroy();});});



  it('should accept user-entered locations', function () {
    var p = _mainPileup2['default'].create(testDiv, { 
      range: { contig: '17', start: 7500725, stop: 7500775 }, 
      tracks: [
      { 
        data: referenceSource, 
        viz: _mainPileup2['default'].viz.genome(), 
        isReference: true }] });var _getInputs5 = 




    getInputs('.controls input[type="text"]');var _getInputs52 = _slicedToArray(_getInputs5, 1);var locationTxt = _getInputs52[0];var _testDiv$querySelectorAll = 
    testDiv.querySelectorAll('.controls button');var _testDiv$querySelectorAll2 = _slicedToArray(_testDiv$querySelectorAll, 1);var goBtn = _testDiv$querySelectorAll2[0];
    (0, _chai.expect)(goBtn.textContent).to.equal('Go');

    return (0, _async.waitFor)(hasReference, 2000).then(function () {
      (0, _chai.expect)(locationTxt.value).to.equal('7,500,725-7,500,775');
      locationTxt.value = '17:7500745-7500785';
      _reactAddonsTestUtils2['default'].Simulate.click(goBtn);}).
    delay(50).then(function () {
      (0, _chai.expect)(p.getRange()).to.deep.equal({ 
        contig: 'chr17', // note: not '17'
        start: 7500745, 
        stop: 7500785 });

      (0, _chai.expect)(locationTxt.value).to.equal('7,500,745-7,500,785');
      p.destroy();});});});