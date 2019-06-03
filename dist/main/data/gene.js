/**
 * Class for parsing genes.
 * 
 */
'use strict';var _slicedToArray = (function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i['return']) _i['return']();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError('Invalid attempt to destructure non-iterable instance');}};})();var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}var _ContigInterval = require(

'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var _Interval = require(
'../Interval');var _Interval2 = _interopRequireDefault(_Interval);var _Alignment = require(


'../Alignment');var _underscore = require(

'underscore');var _underscore2 = _interopRequireDefault(_underscore);var 

Gene = (function () {







  // human-readable name, e.g. "TP53"

  function Gene(gene) {_classCallCheck(this, Gene);
    this.position = gene.position;
    this.id = gene.id;
    this.score = gene.score;
    this.strand = gene.strand;
    this.codingRegion = gene.codingRegion;
    this.exons = gene.exons;
    this.geneId = gene.geneId;
    this.name = gene.name;}_createClass(Gene, [{ key: 'getKey', value: 


    function getKey() {
      return this.id;} }, { key: 'getInterval', value: 


    function getInterval() {
      return this.position;} }, { key: 'intersects', value: 



















































    function intersects(range) {
      return range.intersects(this.position);} }], [{ key: 'fromGA4GH', value: function fromGA4GH(ga4ghGene) {var position = new _ContigInterval2['default'](ga4ghGene.referenceName, parseInt(ga4ghGene.start), parseInt(ga4ghGene.end));var strand = (0, _Alignment.ga4ghStrandToStrand)(ga4ghGene.strand); // make a unique id for this Gene
      var id = ga4ghGene.id && ga4ghGene.id != "" ? ga4ghGene.id : ga4ghGene.geneSymbol && ga4ghGene.geneSymbol != "" ? ga4ghGene.geneSymbol : ga4ghGene.name;var blockStarts = ga4ghGene.attributes.attr.blockStarts;var blockSizes = ga4ghGene.attributes.attr.blockSizes; // process exons, if available
      var exons = [];if (blockStarts && blockSizes) {if (blockStarts.values && blockSizes.values) {var exonStarts = _underscore2['default'].map(blockStarts.values[0].stringValue.split(','), function (f) {return parseInt(f);});var exonLengths = _underscore2['default'].map(blockSizes.values[0].stringValue.split(','), function (f) {return parseInt(f);});exons = _underscore2['default'].zip(exonStarts, exonLengths).map(function (_ref) {var _ref2 = _slicedToArray(_ref, 2);var start = _ref2[0];var length = _ref2[1];return new _Interval2['default'](position.start() + start, position.start() + start + length);});}}var thickStart = ga4ghGene.attributes.attr.thickStart;var thickEnd = ga4ghGene.attributes.attr.thickEnd;var codingRegion = null;if (thickStart.values && thickEnd.values) {codingRegion = new _Interval2['default'](parseInt(thickStart.values[0].stringValue), parseInt(thickEnd.values[0].stringValue));} else {codingRegion = new _Interval2['default'](position.start(), position.end());}return new Gene({ position: position, id: id, score: 1000, strand: strand, codingRegion: codingRegion, exons: exons, geneId: ga4ghGene.geneSymbol, name: ga4ghGene.name });} }]);return Gene;})();

module.exports = Gene; // transcript ID, e.g. "ENST00000269305"
// locus of coding start
// ensembl gene ID