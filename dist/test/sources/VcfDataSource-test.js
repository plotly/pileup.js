'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(


'chai');var _mainDataVcf = require(

'../../main/data/vcf');var _mainSourcesVcfDataSource = require(
'../../main/sources/VcfDataSource');var _mainSourcesVcfDataSource2 = _interopRequireDefault(_mainSourcesVcfDataSource);var _mainContigInterval = require(
'../../main/ContigInterval');var _mainContigInterval2 = _interopRequireDefault(_mainContigInterval);var _mainRemoteFile = require(
'../../main/RemoteFile');var _mainRemoteFile2 = _interopRequireDefault(_mainRemoteFile);

describe('VcfDataSource', function () {
  function getTestSource() {
    var vcf = new _mainDataVcf.VcfFile(new _mainRemoteFile2['default']('/test-data/snv.vcf'));
    return _mainSourcesVcfDataSource2['default'].createFromVcfFile(vcf);}


  it('should extract variants in a range', function (done) {
    var source = getTestSource();
    var range = new _mainContigInterval2['default']('20', 63799, 69094);

    // No variants are cached yet.
    var variants = source.getVariantsInRange(range);
    (0, _chai.expect)(variants).to.deep.equal([]);

    source.on('newdata', function () {
      var variants = source.getVariantsInRange(range);
      (0, _chai.expect)(variants).to.have.length(6);
      (0, _chai.expect)(variants[0].contig).to.equal('20');
      (0, _chai.expect)(variants[0].position).to.equal(63799);
      (0, _chai.expect)(variants[0].ref).to.equal('C');
      (0, _chai.expect)(variants[0].alt).to.equal('T');
      done();});

    source.rangeChanged({ 
      contig: range.contig, 
      start: range.start(), 
      stop: range.stop() });});



  it('should extract genotypes in a range', function (done) {
    var source = getTestSource();
    var range = new _mainContigInterval2['default']('20', 63799, 69094);

    // No variants are cached yet.
    var variants = source.getGenotypesInRange(range);
    (0, _chai.expect)(variants).to.deep.equal([]);

    source.on('newdata', function () {
      var variants = source.getGenotypesInRange(range);
      (0, _chai.expect)(variants).to.have.length(6);
      (0, _chai.expect)(variants[0].variant.contig).to.equal('20');
      (0, _chai.expect)(variants[0].variant.position).to.equal(63799);
      (0, _chai.expect)(variants[0].variant.ref).to.equal('C');
      (0, _chai.expect)(variants[0].variant.alt).to.equal('T');
      (0, _chai.expect)(variants[0].calls).to.have.length(2);
      (0, _chai.expect)(variants[0].calls[0].genotype).to.deep.equal([0, 1]);
      (0, _chai.expect)(variants[0].calls[0].callSetName).to.equal("NORMAL");
      done();});

    source.rangeChanged({ 
      contig: range.contig, 
      start: range.start(), 
      stop: range.stop() });});



  it('should extract samples from a vcf file', function (done) {
    var source = getTestSource();

    source.getCallNames().then(function (samples) {
      (0, _chai.expect)(samples).to.have.length(2);
      done();});});});