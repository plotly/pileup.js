'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(


'chai');var _mainGA4GHAlignment = require(

'../main/GA4GHAlignment');var _mainGA4GHAlignment2 = _interopRequireDefault(_mainGA4GHAlignment);var _mainRemoteFile = require(
'../main/RemoteFile');var _mainRemoteFile2 = _interopRequireDefault(_mainRemoteFile);var _mainDataBam = require(
'../main/data/bam');var _mainDataBam2 = _interopRequireDefault(_mainDataBam);

describe('GA4GHAlignment', function () {
  var sampleAlignments = [];

  before(function () {
    return new _mainRemoteFile2['default']('/test-data/alignments.ga4gh.1.10000-11000.json').getAllString().then(function (data) {
      sampleAlignments = JSON.parse(data).alignments;});});



  it('should read the sample alignments', function (done) {
    (0, _chai.expect)(sampleAlignments).to.have.length(100);
    done();});


  it('should provide basic accessors', function (done) {
    var a = new _mainGA4GHAlignment2['default'](sampleAlignments[0]);
    (0, _chai.expect)(a.name).to.equal('ERR181329.21587964');
    (0, _chai.expect)(a.getSequence()).to.equal('ATAACCCTAACCATAACCCTAACCCTAACCCTAACCCTAACCCTAACCCTAACCCTAACCCTAACCCTAACCCTAACCCTAACCCTAACCCTAACCCTAA');
    (0, _chai.expect)(a.getQualityScores()).to.deep.equal([2, 36, 36, 37, 37, 38, 37, 39, 37, 38, 38, 38, 3, 38, 38, 39, 38, 39, 39, 39, 38, 39, 39, 38, 40, 40, 38, 39, 39, 39, 39, 40, 38, 40, 39, 40, 38, 38, 38, 39, 38, 40, 37, 40, 38, 39, 39, 40, 40, 40, 39, 32, 39, 35, 39, 36, 38, 40, 39, 39, 39, 36, 39, 37, 39, 40, 39, 31, 39, 35, 36, 39, 37, 32, 40, 41, 38, 38, 37, 32, 39, 38, 38, 39, 33, 36, 25, 37, 38, 19, 35, 13, 37, 31, 35, 33, 34, 8, 33, 18]);
    (0, _chai.expect)(a.getStrand()).to.equal('+');
    (0, _chai.expect)(a.getInterval().toString()).to.equal('1:9999-10098'); // 0-based
    (0, _chai.expect)(a.cigarOps).to.deep.equal([
    { op: 'M', length: 100 }]);

    (0, _chai.expect)(a.getMateProperties()).to.deep.equal({ 
      ref: '1', 
      pos: 10007, 
      strand: '-' });

    (0, _chai.expect)(a.debugString().length).to.be.above(0);
    done();});


  it('should match SamRead', function () {
    var bam = new _mainDataBam2['default'](new _mainRemoteFile2['default']('/test-data/chr17.1-250.bam'));
    var json = new _mainRemoteFile2['default']('/test-data/alignments.ga4gh.chr17.1-250.json');

    json.getAllString().then(function (data) {
      var matchingBamAlignments = JSON.parse(data).alignments;

      return bam.readAll().then(function (_ref) {var samReads = _ref.alignments;
        // This is a workaround. See https://github.com/ga4gh/server/issues/488
        samReads.splice(-1, 1);

        (0, _chai.expect)(matchingBamAlignments.length).to.equal(samReads.length);
        for (var i = 0; i < matchingBamAlignments.length; i++) {
          var ga4gh = new _mainGA4GHAlignment2['default'](matchingBamAlignments[i]), 
          bam = samReads[i];
          (0, _chai.expect)(ga4gh.getSequence()).to.equal(bam.getSequence());
          var interval = ga4gh.getInterval();
          (0, _chai.expect)(interval.start()).to.equal(bam.pos);

          // See https://github.com/ga4gh/server/issues/491
          // expect(ga4gh.getStrand()).to.equal(bam.getStrand());
          // For the if statement, see https://github.com/ga4gh/server/issues/492
          var quality = ga4gh.getQualityScores();
          if (quality.length) {
            (0, _chai.expect)(quality).to.deep.equal(bam.getQualityScores());}

          (0, _chai.expect)(ga4gh.cigarOps).to.deep.equal(bam.cigarOps);
          // After ga4gh#491, change this to a .deep.equal on getMateProperties()
          var ga4ghMate = ga4gh.getMateProperties(), 
          bamMate = bam.getMateProperties();
          (0, _chai.expect)(!!ga4ghMate).to.equal(!!bamMate);
          if (ga4ghMate && bamMate) {
            (0, _chai.expect)(ga4ghMate.ref).to.equal(bamMate.ref);
            (0, _chai.expect)(ga4ghMate.pos).to.equal(bamMate.pos);}}});});});});