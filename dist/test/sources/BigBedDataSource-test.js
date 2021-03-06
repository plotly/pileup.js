'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(


'chai');var _mainDataBigBed = require(

'../../main/data/BigBed');var _mainDataBigBed2 = _interopRequireDefault(_mainDataBigBed);var _mainSourcesBigBedDataSource = require(
'../../main/sources/BigBedDataSource');var _mainSourcesBigBedDataSource2 = _interopRequireDefault(_mainSourcesBigBedDataSource);var _mainContigInterval = require(
'../../main/ContigInterval');var _mainContigInterval2 = _interopRequireDefault(_mainContigInterval);

describe('BigBedDataSource', function () {
  function getTestSource() {
    // See test/data/README.md
    return _mainSourcesBigBedDataSource2['default'].createFromBigBedFile(
    new _mainDataBigBed2['default']('/test-data/ensembl.chr17.bb'));}


  it('should extract features in a range', function (done) {
    this.timeout(5000);
    var source = getTestSource();

    // No genes fetched initially
    var tp53range = new _mainContigInterval2['default']('chr17', 7512444, 7517300);
    var tp53 = source.getFeaturesInRange(tp53range);
    (0, _chai.expect)(tp53).to.deep.equal([]);

    // Fetching that one gene should cache its entire block.
    source.on('newdata', function () {
      var tp53s = source.getFeaturesInRange(tp53range);
      (0, _chai.expect)(tp53s).to.have.length(1);

      var tp53 = tp53s[0];
      (0, _chai.expect)(tp53.name).to.equal('TP53');
      (0, _chai.expect)(tp53.exons).to.have.length(11);
      done();});

    source.rangeChanged({ 
      contig: tp53range.contig, 
      start: tp53range.start(), 
      stop: tp53range.stop() });});});