/**
 * Interface for alignments, shared between BAM and GA4GH backends.
 * 
 */






// "CIGAR" operations express how a sequence aligns to the reference: does it
// have insertions? deletions? For more background, see the SAM/BAM paper.
'use strict';Object.defineProperty(exports, '__esModule', { value: true });





// converts a string into a Strand element. Must be '+' or '-'. Any other
// strings will be converted to '.'.
function strToStrand(str) {
  return str && str == '+' ? '+' : str && str == '-' ? '-' : '.'; // either +, - or .
}



// converts a GA4GH Strand to a string of  ga4gh.Common.strand.POS_STRAND,
// NEG_STRAND, or STRAND_UNSPECIFIED to Strand type.
function ga4ghStrandToStrand(str) {
  return str && str == 'POS_STRAND' ? '+' : str && str == 'NEG_STRAND' ? '-' : '.'; // either +, - or .
}

// builds a cigarString string that is useful to users.
function makeCigarString(cigarOps) {
  return cigarOps.map(function (_ref) {var op = _ref.op;var length = _ref.length;return length + op;}).join('');}



























module.exports = { 
  strToStrand: strToStrand, 
  ga4ghStrandToStrand: ga4ghStrandToStrand, 
  makeCigarString: makeCigarString };