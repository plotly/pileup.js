/**
 * Class for parsing variants.
 * 
 */
'use strict';var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}var _ContigInterval = require(

'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var 

Variant = (function () {














  function Variant(variant) {_classCallCheck(this, Variant);
    this.contig = variant.contig;
    this.position = parseInt(variant.position);
    this.ref = variant.ref;
    this.alt = variant.alt;
    this.id = variant.id;
    this.majorFrequency = variant.majorFrequency;
    this.minorFrequency = variant.minorFrequency;
    this.vcfLine = variant.vcfLine;}






















  // GA4GH Genotype Call
  _createClass(Variant, [{ key: 'intersects', // TODO
    value: function intersects(range) {return range.intersects(new _ContigInterval2['default'](this.contig, this.position, this.position + 1));} }], [{ key: 'fromGA4GH', value: function fromGA4GH(ga4ghVariant) {return new Variant({ contig: ga4ghVariant.referenceName, position: parseInt(ga4ghVariant.start), id: ga4ghVariant.id, ref: ga4ghVariant.referenceBases, alt: ga4ghVariant.alternateBases, majorFrequency: 0, minorFrequency: 0, // TODO extract these
        vcfLine: "" });} }]);return Variant;})();var Call = 



function Call(callSetName, genotype, 
callSetId, phaseset) {_classCallCheck(this, Call);
  this.callSetName = callSetName;
  this.genotype = genotype;
  this.callSetId = callSetId;
  this.phaseset = phaseset;}



// holds variant and genotype sample ids
;var VariantContext = (function () {



  function VariantContext(variant, calls) {_classCallCheck(this, VariantContext);
    this.variant = variant;
    this.calls = calls;}_createClass(VariantContext, [{ key: 'intersects', value: 


    function intersects(range) {
      var thisRange = new _ContigInterval2['default'](this.variant.contig, this.variant.position, this.variant.position + 1);
      return range.intersects(thisRange);} }]);return VariantContext;})();



module.exports = { 
  Call: Call, 
  Variant: Variant, 
  VariantContext: VariantContext }; //this is the biggest allele frequency for single vcf entry
//single vcf entry might contain more than one variant like the example below
//20 1110696 rs6040355 A G,T 67 PASS NS=2;DP=10;AF=0.333,0.667;AA=T;DB
//this is the smallest allel frequency for single vcf entry