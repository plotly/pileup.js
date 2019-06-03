'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(


'chai');var _mainDataGene = require(
'../../main/data/gene');var _mainDataGene2 = _interopRequireDefault(_mainDataGene);var _underscore = require(
'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _mainRemoteFile = require(
'../../main/RemoteFile');var _mainRemoteFile2 = _interopRequireDefault(_mainRemoteFile);

describe('Gene', function () {
  var json;

  before(function () {
    return new _mainRemoteFile2['default']('/test-data/refSeqGenes.chr17.75000000-75100000.json').getAllString().then(function (data) {
      json = data;});});



  it('should parse genes from GA4GH', function (done) {
    // parse json
    var parsedJson = JSON.parse(json);
    var genes = _underscore2['default'].values(parsedJson.features).map(function (gene) {return _mainDataGene2['default'].fromGA4GH(gene);});

    (0, _chai.expect)(genes).to.have.length(3);
    (0, _chai.expect)(genes[0].position.contig).to.equal("chr17");
    (0, _chai.expect)(genes[0].position.start()).to.equal(75084724);
    (0, _chai.expect)(genes[0].position.stop()).to.equal(75091068);
    (0, _chai.expect)(genes[0].score).to.equal(1000);
    (0, _chai.expect)(genes[0].name).to.equal("SNHG20");
    (0, _chai.expect)(genes[0].strand).to.equal('.');
    // check exons
    (0, _chai.expect)(genes[0].exons).to.have.length(3);
    (0, _chai.expect)(genes[0].exons[0].start).to.equal(75084724); // start
    (0, _chai.expect)(genes[0].exons[0].stop).to.equal(75085031); // start + blockSize
    (0, _chai.expect)(genes[0].codingRegion.start).to.equal(75091068);
    (0, _chai.expect)(genes[0].codingRegion.stop).to.equal(75091068);
    (0, _chai.expect)(genes[0].id).to.equal("NR_027058");
    (0, _chai.expect)(genes[0].geneId).to.equal("NR_027058");

    done();});});