'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(




'chai');var _underscore = require(
'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _mainVizGenericFeatureCache = require(

'../../main/viz/GenericFeatureCache');var _mainContigInterval = require(
'../../main/ContigInterval');var _mainContigInterval2 = _interopRequireDefault(_mainContigInterval);var _FakeAlignment = require(
'../FakeAlignment');


describe('GenericFeatureCache', function () {
  function ci(chr, start, end) {
    return new _mainContigInterval2['default'](chr, start, end);}


  function makeCache(features) {
    var cache = new _mainVizGenericFeatureCache.GenericFeatureCache(_FakeAlignment.fakeSource);
    _underscore2['default'].flatten(features).forEach(function (feature) {return cache.addFeature(feature);});
    return cache;}


  it('should put non-overlapping features in the same row', function (done) {
    var a = { id: "A", 
      featureType: "Feature", 
      position: new _mainContigInterval2['default']('chr1', 100, 200), 
      score: 1000 };

    var b = { id: "B", 
      featureType: "Feature", 
      position: new _mainContigInterval2['default']('chr1', 300, 400), 
      score: 1000 };

    var c = { id: "C", 
      featureType: "Feature", 
      position: new _mainContigInterval2['default']('chr1', 700, 800), 
      score: 1000 };

    var cache = makeCache([a, b, c]);

    var groups = _underscore2['default'].values(cache.groups);
    (0, _chai.expect)(groups).to.have.length(3);
    (0, _chai.expect)(groups[0].row).to.equal(0);
    (0, _chai.expect)(groups[1].row).to.equal(0);
    (0, _chai.expect)(groups[2].row).to.equal(0);
    (0, _chai.expect)(cache.pileupHeightForRef('chr1')).to.equal(1);
    done();});



  it('should put overlapping features in the different row', function (done) {
    var a = { id: "A", 
      featureType: "Feature", 
      position: new _mainContigInterval2['default']('chr1', 100, 200), 
      score: 1000 };

    var b = { id: "B", 
      featureType: "Feature", 
      position: new _mainContigInterval2['default']('chr1', 100, 200), 
      score: 1000 };

    var c = { id: "C", 
      featureType: "Feature", 
      position: new _mainContigInterval2['default']('chr1', 150, 300), 
      score: 1000 };

    var cache = makeCache([a, b, c]);

    var groups = _underscore2['default'].values(cache.groups);
    (0, _chai.expect)(groups).to.have.length(3);
    (0, _chai.expect)(groups[0].row).to.equal(0);
    (0, _chai.expect)(groups[1].row).to.equal(1);
    (0, _chai.expect)(groups[2].row).to.equal(2);
    (0, _chai.expect)(cache.pileupHeightForRef('chr1')).to.equal(3);
    done();});


  it('should find overlapping features', function (done) {
    var a = { id: "A", 
      featureType: "Feature", 
      position: new _mainContigInterval2['default']('chr1', 100, 200), 
      score: 1000 };

    var b = { id: "B", 
      featureType: "Feature", 
      position: new _mainContigInterval2['default']('chr1', 300, 400), 
      score: 1000 };

    var c = { id: "C", 
      featureType: "Feature", 
      position: new _mainContigInterval2['default']('chr1', 700, 800), 
      score: 1000 };

    var cache = makeCache([a, b, c]);

    (0, _chai.expect)(cache.getGroupsOverlapping(ci('chr1', 100, 200))).to.have.length(1);
    (0, _chai.expect)(cache.getGroupsOverlapping(ci('chr1', 150, 500))).to.have.length(2);
    (0, _chai.expect)(cache.getGroupsOverlapping(ci('chr1', 100, 800))).to.have.length(3);

    // 'chr'-tolerance
    (0, _chai.expect)(cache.getGroupsOverlapping(ci('chr1', 100, 200))).to.have.length(1);
    done();});});