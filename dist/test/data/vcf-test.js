'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(


'chai');var _mainDataVcf = require(

'../../main/data/vcf');var _mainContigInterval = require(
'../../main/ContigInterval');var _mainContigInterval2 = _interopRequireDefault(_mainContigInterval);var _mainRemoteFile = require(
'../../main/RemoteFile');var _mainRemoteFile2 = _interopRequireDefault(_mainRemoteFile);var _mainLocalStringFile = require(
'../../main/LocalStringFile');var _mainLocalStringFile2 = _interopRequireDefault(_mainLocalStringFile);

describe('VCF', function () {
  describe('should respond to queries', function () {
    var testQueries = function testQueries(vcf) {
      var range = new _mainContigInterval2['default']('20', 63799, 69094);
      return vcf.getFeaturesInRange(range).then(function (features) {
        (0, _chai.expect)(features).to.have.length(6);

        var v0 = features[0].variant;

        var v5 = features[5].variant;

        (0, _chai.expect)(v0.contig).to.equal('20');
        (0, _chai.expect)(v0.position).to.equal(63799);
        (0, _chai.expect)(v0.ref).to.equal('C');
        (0, _chai.expect)(v0.alt).to.equal('T');

        (0, _chai.expect)(v5.contig).to.equal('20');
        (0, _chai.expect)(v5.position).to.equal(69094);
        (0, _chai.expect)(v5.ref).to.equal('G');
        (0, _chai.expect)(v5.alt).to.equal('A');});};



    var remoteFile = new _mainRemoteFile2['default']('/test-data/snv.vcf');

    it('remote file', function (done) {
      var vcf = new _mainDataVcf.VcfFile(remoteFile);
      testQueries(vcf);
      done();});


    it('local file from string', function () {
      return remoteFile.getAllString().then(function (content) {
        var localFile = new _mainLocalStringFile2['default'](content);
        var vcf = new _mainDataVcf.VcfFile(localFile);
        testQueries(vcf);});});});




  it('should have frequency', function () {
    var vcf = new _mainDataVcf.VcfFile(new _mainRemoteFile2['default']('/test-data/allelFrequency.vcf'));
    var range = new _mainContigInterval2['default']('chr20', 61790, 61800);
    return vcf.getFeaturesInRange(range).then(function (features) {
      (0, _chai.expect)(features).to.have.length(1);
      (0, _chai.expect)(features[0].variant.contig).to.equal('20');
      (0, _chai.expect)(features[0].variant.majorFrequency).to.equal(0.7);
      (0, _chai.expect)(features[0].variant.minorFrequency).to.equal(0.7);});});



  it('should have highest frequency', function () {
    var vcf = new _mainDataVcf.VcfFile(new _mainRemoteFile2['default']('/test-data/allelFrequency.vcf'));
    var range = new _mainContigInterval2['default']('chr20', 61730, 61740);
    return vcf.getFeaturesInRange(range).then(function (features) {
      (0, _chai.expect)(features).to.have.length(1);
      (0, _chai.expect)(features[0].variant.contig).to.equal('20');
      (0, _chai.expect)(features[0].variant.majorFrequency).to.equal(0.6);
      (0, _chai.expect)(features[0].variant.minorFrequency).to.equal(0.3);});});



  it('should add chr', function () {
    var vcf = new _mainDataVcf.VcfFile(new _mainRemoteFile2['default']('/test-data/snv.vcf'));
    var range = new _mainContigInterval2['default']('chr20', 63799, 69094);
    return vcf.getFeaturesInRange(range).then(function (features) {
      (0, _chai.expect)(features).to.have.length(6);
      (0, _chai.expect)(features[0].variant.contig).to.equal('20'); // not chr20
      (0, _chai.expect)(features[5].variant.contig).to.equal('20');});});



  it('should handle unsorted VCFs', function () {
    var vcf = new _mainDataVcf.VcfFile(new _mainRemoteFile2['default']('/test-data/sort-bug.vcf'));
    var chr1 = new _mainContigInterval2['default']('chr1', 1, 1234567890);
    // all of chr1

    var chr5 = new _mainContigInterval2['default']('chr5', 1, 1234567890);
    return vcf.getFeaturesInRange(chr1).then(function (features) {
      (0, _chai.expect)(features).to.have.length(5);
      return vcf.getFeaturesInRange(chr5);}).
    then(function (features) {
      (0, _chai.expect)(features).to.have.length(5);});});



  it('should get samples', function () {
    var vcf = new _mainDataVcf.VcfFile(new _mainRemoteFile2['default']('/test-data/sort-bug.vcf'));

    return vcf.getCallNames().then(function (samples) {
      (0, _chai.expect)(samples).to.have.length(2);});});



  it('should get genotypes', function () {
    var vcf = new _mainDataVcf.VcfFile(new _mainRemoteFile2['default']('/test-data/snv.vcf'));
    var range = new _mainContigInterval2['default']('chr20', 63799, 69094);
    return vcf.getFeaturesInRange(range).then(function (features) {
      (0, _chai.expect)(features[0].calls).to.have.length(2);
      (0, _chai.expect)(features[0].calls[0].genotype).to.deep.equal([0, 1]);
      (0, _chai.expect)(features[0].calls[0].callSetName).to.equal("NORMAL");

      (0, _chai.expect)(features[0].calls[1].genotype).to.deep.equal([0, 1]);
      (0, _chai.expect)(features[0].calls[1].callSetName).to.equal("TUMOR");});});});