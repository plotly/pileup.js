'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _chai = require(


'chai');var _mainLocalStringFile = require(

'../main/LocalStringFile');var _mainLocalStringFile2 = _interopRequireDefault(_mainLocalStringFile);var _jbinary = require(
'jbinary');var _jbinary2 = _interopRequireDefault(_jbinary);

describe('LocalStringFile', function () {
  function bufferToText(buf) {
    return new _jbinary2['default'](buf).read('string');}


  it('should fetch a subset of a file', function () {
    var f = new _mainLocalStringFile2['default']('0123456789\n');
    var promisedData = f.getBytes(4, 5);

    return promisedData.then(function (buf) {
      (0, _chai.expect)(buf).to.not.be['null'];
      if (buf != null) {
        (0, _chai.expect)(buf.byteLength).to.equal(5);
        (0, _chai.expect)(bufferToText(buf)).to.equal('45678');}});});




  it('should fetch subsets from cache', function () {
    var f = new _mainLocalStringFile2['default']('0123456789\n');
    return f.getBytes(0, 10).then(function (buf) {
      (0, _chai.expect)(buf).to.not.be['null'];
      if (buf != null) {
        (0, _chai.expect)(buf.byteLength).to.equal(10);
        (0, _chai.expect)(bufferToText(buf)).to.equal('0123456789');}

      return f.getBytes(4, 5).then(function (buf) {
        (0, _chai.expect)(buf).to.not.be['null'];
        if (buf != null) {
          (0, _chai.expect)(buf.byteLength).to.equal(5);
          (0, _chai.expect)(bufferToText(buf)).to.equal('45678');}});});});





  it('should fetch entire files', function () {
    var f = new _mainLocalStringFile2['default']('0123456789\n');
    return f.getAll().then(function (buf) {
      (0, _chai.expect)(buf).to.not.be['null'];
      if (buf != null) {
        (0, _chai.expect)(buf.byteLength).to.equal(11);
        (0, _chai.expect)(bufferToText(buf)).to.equal('0123456789\n');}});});




  it('should determine file lengths', function () {
    var f = new _mainLocalStringFile2['default']('0123456789\n');
    return f.getSize().then(function (size) {
      (0, _chai.expect)(size).to.equal(11);});});



  it('should get file lengths from full requests', function () {
    var f = new _mainLocalStringFile2['default']('0123456789\n');
    return f.getAll().then(function (buf) {
      return f.getSize().then(function (size) {
        (0, _chai.expect)(size).to.equal(11);});});});




  it('should get file lengths from range requests', function () {
    var f = new _mainLocalStringFile2['default']('0123456789\n');
    return f.getBytes(4, 5).then(function (buf) {
      return f.getSize().then(function (size) {
        (0, _chai.expect)(size).to.equal(11);});});});




  it('should cache requests for full files', function () {
    var f = new _mainLocalStringFile2['default']('0123456789\n');
    return f.getAll().then(function (buf) {
      (0, _chai.expect)(buf).to.not.be['null'];
      if (buf != null) {
        (0, _chai.expect)(buf.byteLength).to.equal(11);
        (0, _chai.expect)(bufferToText(buf)).to.equal('0123456789\n');}

      return f.getAll().then(function (buf) {
        (0, _chai.expect)(buf).to.not.be['null'];
        if (buf != null) {
          (0, _chai.expect)(buf.byteLength).to.equal(11);
          (0, _chai.expect)(bufferToText(buf)).to.equal('0123456789\n');}});});});





  it('should serve range requests from cache after getAll', function () {
    var f = new _mainLocalStringFile2['default']('0123456789\n');
    return f.getAll().then(function (buf) {
      (0, _chai.expect)(buf).to.not.be['null'];
      if (buf != null) {
        (0, _chai.expect)(buf.byteLength).to.equal(11);
        (0, _chai.expect)(bufferToText(buf)).to.equal('0123456789\n');}

      return f.getBytes(4, 5).then(function (buf) {
        (0, _chai.expect)(buf).to.not.be['null'];
        if (buf != null) {
          (0, _chai.expect)(buf.byteLength).to.equal(5);
          (0, _chai.expect)(bufferToText(buf)).to.equal('45678');}});});});





  it('should truncate requests past EOF', function () {
    var f = new _mainLocalStringFile2['default']('0123456789\n');
    var promisedData = f.getBytes(4, 100);

    return promisedData.then(function (buf) {
      (0, _chai.expect)(buf).to.not.be['null'];
      if (buf != null) {
        (0, _chai.expect)(buf.byteLength).to.equal(7);
        (0, _chai.expect)(bufferToText(buf)).to.equal('456789\n');}

      return f.getBytes(6, 90).then(function (buf) {
        (0, _chai.expect)(buf).to.not.be['null'];
        if (buf != null) {
          (0, _chai.expect)(buf.byteLength).to.equal(5);
          (0, _chai.expect)(bufferToText(buf)).to.equal('6789\n');}});});});





  it('should fetch entire files as strings', function () {
    var f = new _mainLocalStringFile2['default']('0123456789\n');
    return f.getAllString().then(function (txt) {
      (0, _chai.expect)(txt).to.equal('0123456789\n');});});});