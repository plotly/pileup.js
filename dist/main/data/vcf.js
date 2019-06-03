/**
 * Fetcher/parser for VCF files.
 * This makes very little effort to parse out details from VCF entries. It just
 * extracts CONTIG, POSITION, REF and ALT.
 *
 * 
 */
'use strict';








// This is a minimally-parsed line for facilitating binary search.
var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}var _underscore = require('underscore');var _underscore2 = _interopRequireDefault(_underscore);var _ContigInterval = require('../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var _variant = require("./variant");





function extractSamples(header) {

  var line = _underscore2['default'].filter(header, function (h) {return h.startsWith("#CHROM");})[0].split('\t');

  // drop first 8 titles. See vcf header specification 1.3: https://samtools.github.io/hts-specs/VCFv4.2.pdf
  var samples = line.splice(9);

  return samples;}



function extractLocusLine(vcfLine) {
  var tab1 = vcfLine.indexOf('\t'), 
  tab2 = vcfLine.indexOf('\t', tab1 + 1);

  return { 
    contig: vcfLine.slice(0, tab1), 
    position: Number(vcfLine.slice(tab1 + 1, tab2)), 
    line: vcfLine };}




function extractVariantContext(samples, vcfLine) {
  var parts = vcfLine.split('\t');
  var maxFrequency = null;
  var minFrequency = null;
  var calls = [];

  if (parts.length >= 7) {
    var params = parts[7].split(';'); // process INFO field
    for (var i = 0; i < params.length; i++) {
      var param = params[i];
      if (param.startsWith("AF=")) {
        maxFrequency = 0.0;
        minFrequency = 1.0;
        var frequenciesStrings = param.substr(3).split(",");
        for (var j = 0; j < frequenciesStrings.length; j++) {
          var currentFrequency = parseFloat(frequenciesStrings[j]);
          maxFrequency = Math.max(maxFrequency, currentFrequency);
          minFrequency = Math.min(minFrequency, currentFrequency);}}}




    // process genotype information for each sample
    if (parts.length > 9) {
      var sample_i = 0; // keeps track of which sample we are processing
      for (i = 9; i < parts.length; i++) {
        var genotype = parts[i].split(':')[0].split("/").map(function (i) {return parseInt(i);});
        // TODO is it ever not 2?
        if (genotype.length == 2) {
          if (parseInt(genotype[0]) == 1 || parseInt(genotype[1]) == 1) {
            // TODO do you have to overwrite with concat?
            var call = new _variant.Call(samples[sample_i], genotype, 
            samples[sample_i], "True"); // currently not doing anything with phasing
            calls = calls.concat(call);}}


        sample_i++;}}}



  var contig = parts[0];
  var position = Number(parts[1]);

  return new _variant.VariantContext(new _variant.Variant({ 
    contig: contig, 
    position: position, 
    id: parts[2], 
    ref: parts[3], 
    alt: parts[4], 
    majorFrequency: maxFrequency, 
    minorFrequency: minFrequency, 
    vcfLine: vcfLine }), 
  calls);}



function compareLocusLine(a, b) {
  // Sort lexicographically by contig, then numerically by position.
  if (a.contig < b.contig) {
    return -1;} else 
  if (a.contig > b.contig) {
    return +1;} else 
  {
    return a.position - b.position;}}




// (based on underscore source)
function lowestIndex(haystack, needle, compare) {
  var low = 0, 
  high = haystack.length;
  while (low < high) {
    var mid = Math.floor((low + high) / 2), 
    c = compare(haystack[mid], needle);
    if (c < 0) {
      low = mid + 1;} else 
    {
      high = mid;}}


  return low;}var 



ImmediateVcfFile = (function () {




  function ImmediateVcfFile(samples, lines) {_classCallCheck(this, ImmediateVcfFile);
    this.samples = samples;
    this.lines = lines;
    this.contigMap = this.extractContigs();}_createClass(ImmediateVcfFile, [{ key: 'extractContigs', value: 


    function extractContigs() {
      var contigs = [], 
      lastContig = '';
      for (var i = 0; i < this.lines.length; i++) {
        var line = this.lines[i];
        if (line.contig != lastContig) {
          contigs.push(line.contig);}}



      var contigMap = {};
      contigs.forEach(function (contig) {
        if (contig.slice(0, 3) == 'chr') {
          contigMap[contig.slice(4)] = contig;} else 
        {
          contigMap['chr' + contig] = contig;}

        contigMap[contig] = contig;});

      return contigMap;} }, { key: 'getFeaturesInRange', value: 


    function getFeaturesInRange(range) {var _this = this;
      var lines = this.lines;
      var contig = this.contigMap[range.contig];
      if (!contig) {
        return [];}


      var startLocus = { 
        contig: contig, 
        position: range.start(), 
        line: '' }, 

      endLocus = { 
        contig: contig, 
        position: range.stop(), 
        line: '' };

      var startIndex = lowestIndex(lines, startLocus, compareLocusLine);

      var result = [];

      for (var i = startIndex; i < lines.length; i++) {
        if (compareLocusLine(lines[i], endLocus) > 0) {
          break;}

        result.push(lines[i]);}


      return result.map(function (line) {return extractVariantContext(_this.samples, line.line);});} }]);return ImmediateVcfFile;})();var 




VcfFile = (function () {



  function VcfFile(remoteFile) {_classCallCheck(this, VcfFile);
    this.remoteFile = remoteFile;

    this.immediate = this.remoteFile.getAllString().then(function (txt) {
      // Running this on a 12MB string takes ~80ms on my 2014 Macbook Pro
      var txtLines = txt.split('\n');
      var lines = txtLines.
      filter(function (line) {return line.length && line[0] != '#';}).
      map(extractLocusLine);

      var header = txtLines.filter(function (line) {return line.length && line[0] == '#';});

      var samples = extractSamples(header);

      return [samples, lines];}).
    then(function (results) {
      var samples = results[0];
      var lines = results[1];
      // Sorting this structure from the 12MB VCF file takes ~60ms
      lines.sort(compareLocusLine);
      return new ImmediateVcfFile(samples, lines);});

    this.immediate.done();}_createClass(VcfFile, [{ key: 'getCallNames', value: 


    function getCallNames() {
      return this.immediate.then(function (immediate) {
        return immediate.samples;});} }, { key: 'getFeaturesInRange', value: 



    function getFeaturesInRange(range) {
      return this.immediate.then(function (immediate) {
        return immediate.getFeaturesInRange(range);});} }]);return VcfFile;})();




module.exports = { 
  VcfFile: VcfFile }; // canonical map