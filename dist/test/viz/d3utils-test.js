'use strict';var _chai = require(


'chai');
var d3utils = require('../../main/viz/d3utils');

describe('d3utils', function () {
  describe('formatRange', function () {
    var formatRange = d3utils.formatRange;

    it('should format view sizes correctly', function (done) {
      var r = formatRange(101);
      (0, _chai.expect)(r.prefix).to.be.equal("101");
      (0, _chai.expect)(r.unit).to.be.equal("bp");

      r = formatRange(10001);
      (0, _chai.expect)(r.prefix).to.be.equal("10,001");
      (0, _chai.expect)(r.unit).to.be.equal("bp");

      r = formatRange(10001001);
      (0, _chai.expect)(r.prefix).to.be.equal("10,001");
      (0, _chai.expect)(r.unit).to.be.equal("kbp");

      r = formatRange(10001000001);
      (0, _chai.expect)(r.prefix).to.be.equal("10,001");
      (0, _chai.expect)(r.unit).to.be.equal("Mbp");
      done();});});



  describe('getTrackScale', function (done) {
    var getTrackScale = d3utils.getTrackScale;
    it('should define a linear scale', function (done) {
      var scale = getTrackScale({ start: 100, stop: 200 }, 1000);
      (0, _chai.expect)(scale(100)).to.equal(0);
      (0, _chai.expect)(scale(201)).to.equal(1000);
      done();});


    it('should be invertible', function (done) {
      var scale = getTrackScale({ start: 100, stop: 200 }, 1000);
      (0, _chai.expect)(scale.invert(0)).to.equal(100);
      (0, _chai.expect)(scale.invert(1000)).to.equal(201);
      done();});


    it('should be clampable', function (done) {
      var scale = getTrackScale({ start: 100, stop: 200 }, 1000);
      scale = scale.clamp(true);
      (0, _chai.expect)(scale(0)).to.equal(0);
      (0, _chai.expect)(scale(100)).to.equal(0);
      (0, _chai.expect)(scale(201)).to.equal(1000);
      (0, _chai.expect)(scale(500)).to.equal(1000);
      done();});});});