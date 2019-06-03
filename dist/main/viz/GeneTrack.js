/**
 * Visualization of genes, including exons and coding regions.
 * 
 */
'use strict';var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();var _get = function get(_x, _x2, _x3) {var _again = true;_function: while (_again) {var object = _x, property = _x2, receiver = _x3;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {var parent = Object.getPrototypeOf(object);if (parent === null) {return undefined;} else {_x = parent;_x2 = property;_x3 = receiver;_again = true;desc = parent = undefined;continue _function;}} else if ('value' in desc) {return desc.value;} else {var getter = desc.get;if (getter === undefined) {return undefined;}return getter.call(receiver);}}};function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass) {if (typeof superClass !== 'function' && superClass !== null) {throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var _dataGene = require(


'../data/gene');var _dataGene2 = _interopRequireDefault(_dataGene);var _dataGenericFeature = require(





'../data/genericFeature');var _dataGenericFeature2 = _interopRequireDefault(_dataGenericFeature);var _GenericFeatureCache = require(
'./GenericFeatureCache');var _react = require(

'react');var _react2 = _interopRequireDefault(_react);var _reactDom = require(
'react-dom');var _reactDom2 = _interopRequireDefault(_reactDom);var _underscore = require(
'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _shallowEquals = require(
'shallow-equals');var _shallowEquals2 = _interopRequireDefault(_shallowEquals);var _dataBedtools = require(

'../data/bedtools');var _dataBedtools2 = _interopRequireDefault(_dataBedtools);var _Interval = require(
'../Interval');var _Interval2 = _interopRequireDefault(_Interval);var _d3utils = require(
'./d3utils');var _d3utils2 = _interopRequireDefault(_d3utils);var _scale = require(
'../scale');var _scale2 = _interopRequireDefault(_scale);var _ContigInterval = require(
'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var _canvasUtils = require(
'./canvas-utils');var _canvasUtils2 = _interopRequireDefault(_canvasUtils);var _utils = require(
'../utils');var _utils2 = _interopRequireDefault(_utils);var _dataCanvas = require(
'data-canvas');var _dataCanvas2 = _interopRequireDefault(_dataCanvas);var _style = require(
'../style');var _style2 = _interopRequireDefault(_style);


// Draw an arrow in the middle of the visible portion of range.
function drawArrow(ctx, 
clampedScale, 
range, 
tipY, 
strand) {
  var x1 = clampedScale(1 + range.start), 
  x2 = clampedScale(1 + range.stop);

  // it's off-screen or there's not enough room to draw it legibly.
  if (x2 - x1 <= 2 * _style2['default'].GENE_ARROW_SIZE) return;

  var cx = (x1 + x2) / 2;
  ctx.beginPath();
  if (strand == '-') {
    ctx.moveTo(cx + _style2['default'].GENE_ARROW_SIZE, tipY - _style2['default'].GENE_ARROW_SIZE);
    ctx.lineTo(cx, tipY);
    ctx.lineTo(cx + _style2['default'].GENE_ARROW_SIZE, tipY + _style2['default'].GENE_ARROW_SIZE);} else 
  {
    ctx.moveTo(cx - _style2['default'].GENE_ARROW_SIZE, tipY - _style2['default'].GENE_ARROW_SIZE);
    ctx.lineTo(cx, tipY);
    ctx.lineTo(cx - _style2['default'].GENE_ARROW_SIZE, tipY + _style2['default'].GENE_ARROW_SIZE);}

  ctx.stroke();}


function drawGeneName(ctx, 
clampedScale, 
geneLineY, 
gene, 
textIntervals) {
  var p = gene.position, 
  centerX = 0.5 * (clampedScale(1 + p.start()) + clampedScale(1 + p.stop()));
  // do not use gene name if it is null or empty
  var name = !_underscore2['default'].isEmpty(_utils2['default'].stringToLiteral(gene.name)) ? gene.name : gene.id;
  var textWidth = ctx.measureText(name).width;
  var textInterval = new _Interval2['default'](centerX - 0.5 * textWidth, 
  centerX + 0.5 * textWidth);
  if (!_underscore2['default'].any(textIntervals, function (iv) {return textInterval.intersects(iv);})) {
    textIntervals.push(textInterval);
    var baselineY = geneLineY + _style2['default'].GENE_FONT_SIZE + _style2['default'].GENE_TEXT_PADDING;
    ctx.fillText(name, centerX, baselineY);}}var 



GeneTrack = (function (_React$Component) {_inherits(GeneTrack, _React$Component);




  function GeneTrack(props) {_classCallCheck(this, GeneTrack);
    _get(Object.getPrototypeOf(GeneTrack.prototype), 'constructor', this).call(this, props);
    this.state = { 
      networkStatus: null };}_createClass(GeneTrack, [{ key: 'render', value: 



    function render() {
      return _react2['default'].createElement('canvas', null);} }, { key: 'componentDidMount', value: 


    function componentDidMount() {var _this = this;
      this.cache = new _GenericFeatureCache.GenericFeatureCache(this.props.referenceSource);
      // Visualize new reference data as it comes in from the network.
      this.props.source.on('newdata', function (range) {
        // add genes to generic cache
        var genes = _this.props.source.getFeaturesInRange(range);
        genes.forEach(function (f) {return _this.cache.addFeature(new _dataGenericFeature2['default'](f.id, f.position, f));});
        _this.updateVisualization();});

      this.props.referenceSource.on('newdata', function (range) {
        _this.updateVisualization();});

      this.props.source.on('networkprogress', function (e) {
        _this.setState({ networkStatus: e });});

      this.props.source.on('networkdone', function (e) {
        _this.setState({ networkStatus: null });});


      this.updateVisualization();} }, { key: 'getScale', value: 


    function getScale() {
      return _d3utils2['default'].getTrackScale(this.props.range, this.props.width);} }, { key: 'componentDidUpdate', value: 


    function componentDidUpdate(prevProps, prevState) {
      if (!(0, _shallowEquals2['default'])(this.props, prevProps) || 
      !(0, _shallowEquals2['default'])(this.state, prevState)) {
        this.updateVisualization();}} }, { key: 'updateVisualization', value: 



    function updateVisualization() {
      var canvas = _reactDom2['default'].findDOMNode(this);var _props = 
      this.props;var width = _props.width;var height = _props.height;
      var genomeRange = this.props.range;

      var range = new _ContigInterval2['default'](genomeRange.contig, genomeRange.start, genomeRange.stop);

      // Hold off until height & width are known.
      if (width === 0) return;

      var sc = this.getScale(), 
      // We can't clamp scale directly because of offsetPx.
      clampedScale = _scale2['default'].linear().
      domain([sc.invert(0), sc.invert(width)]).
      range([0, width]).
      clamp(true);



      if (canvas && canvas instanceof Element) {// check for getContext
        if (canvas instanceof HTMLCanvasElement) {// check for sizeCanvas
          _d3utils2['default'].sizeCanvas(canvas, width, height);}

        var ctx = _dataCanvas2['default'].getDataContext(_canvasUtils2['default'].getContext(canvas));

        ctx.reset();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        var geneLineY = Math.round(height / 4);
        var textIntervals = []; // x-intervals with rendered gene names, to avoid over-drawing.
        ctx.font = _style2['default'].GENE_FONT_SIZE + 'px ' + _style2['default'].GENE_FONT;
        ctx.textAlign = 'center';
        var vFeatures = _underscore2['default'].flatten(_underscore2['default'].map(this.cache.getGroupsOverlapping(range), 
        function (g) {return g.items;}));

        vFeatures.forEach(function (vFeature) {
          var gene = vFeature.gFeature;
          if (!gene.position.intersects(range)) return;
          ctx.pushObject(gene);
          ctx.lineWidth = 1;
          ctx.strokeStyle = _style2['default'].GENE_COLOR;
          ctx.fillStyle = _style2['default'].GENE_COLOR;

          _canvasUtils2['default'].drawLine(ctx, clampedScale(1 + gene.position.start()), geneLineY + 0.5, 
          clampedScale(1 + gene.position.stop()), geneLineY + 0.5);

          // TODO: only compute all these intervals when data becomes available.
          var exons = _dataBedtools2['default'].splitCodingExons(gene.exons, gene.codingRegion);
          exons.forEach(function (exon) {
            ctx.fillRect(sc(1 + exon.start), 
            geneLineY - 3 * (exon.isCoding ? 2 : 1), 
            sc(exon.stop + 2) - sc(1 + exon.start), 
            6 * (exon.isCoding ? 2 : 1));});


          var introns = gene.position.interval.complementIntervals(gene.exons);
          introns.forEach(function (range) {
            drawArrow(ctx, clampedScale, range, geneLineY + 0.5, gene.strand);});

          ctx.strokeStyle = _style2['default'].GENE_COMPLEMENT_COLOR;
          ctx.lineWidth = 2;
          gene.exons.forEach(function (range) {
            drawArrow(ctx, clampedScale, range, geneLineY + 0.5, gene.strand);});


          drawGeneName(ctx, clampedScale, geneLineY, gene, textIntervals);

          ctx.popObject();});}

      // end typecheck for canvasß
    } }]);return GeneTrack;})(_react2['default'].Component);


GeneTrack.displayName = 'genes';

module.exports = GeneTrack;