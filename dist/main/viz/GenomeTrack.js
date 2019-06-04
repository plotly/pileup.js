/**
 * A track which displays a reference genome.
 * 
 */
'use strict';var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();var _get = function get(_x, _x2, _x3) {var _again = true;_function: while (_again) {var object = _x, property = _x2, receiver = _x3;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {var parent = Object.getPrototypeOf(object);if (parent === null) {return undefined;} else {_x = parent;_x2 = property;_x3 = receiver;_again = true;desc = parent = undefined;continue _function;}} else if ('value' in desc) {return desc.value;} else {var getter = desc.get;if (getter === undefined) {return undefined;}return getter.call(receiver);}}};function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass) {if (typeof superClass !== 'function' && superClass !== null) {throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var _ShimDependencies = require(






'../ShimDependencies');var _shallowEquals = require(
'shallow-equals');var _shallowEquals2 = _interopRequireDefault(_shallowEquals);var _canvasUtils = require(


'./canvas-utils');var _canvasUtils2 = _interopRequireDefault(_canvasUtils);var _ContigInterval = require(
'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var _dataCanvas = require(
'data-canvas');var _dataCanvas2 = _interopRequireDefault(_dataCanvas);var _d3utils = require(
'./d3utils');var _d3utils2 = _interopRequireDefault(_d3utils);var _DisplayMode = require(
'./DisplayMode');var _DisplayMode2 = _interopRequireDefault(_DisplayMode);var _TiledCanvas2 = require(
'./TiledCanvas');var _TiledCanvas3 = _interopRequireDefault(_TiledCanvas2);var _style = require(
'../style');var _style2 = _interopRequireDefault(_style);


function renderGenome(ctx, 
scale, 
height, 
range, 
basePairs) {
  var pxPerLetter = scale(1) - scale(0);
  var mode = _DisplayMode2['default'].getDisplayMode(pxPerLetter);
  var showText = _DisplayMode2['default'].isText(mode);

  // get adjusted canvas height for drawing letters and rects
  var adjustedHeight = height / window.devicePixelRatio;

  if (mode != _DisplayMode2['default'].HIDDEN) {
    ctx.textAlign = 'center';
    ctx.font = _style2['default'].TEXT_STYLE(mode, adjustedHeight);

    var previousBase = null;
    var start = range.start(), 
    stop = range.stop();
    for (var pos = start; pos <= stop; pos++) {
      var letter = basePairs[pos - start];
      if (letter == '.') continue; // not yet known

      ctx.save();
      ctx.pushObject({ pos: pos, letter: letter });
      ctx.fillStyle = _style2['default'].BASE_COLORS[letter];
      if (showText) {
        // We only push objects in the text case as it involves creating a
        // new object & can become a performance issue.
        // 0.5 = centered
        ctx.fillText(letter, scale(1 + 0.5 + pos), adjustedHeight);} else 
      {
        if (pxPerLetter >= _style2['default'].COVERAGE_MIN_BAR_WIDTH_FOR_GAP) {
          // We want a white space between blocks at this size, so we can see
          // the difference between bases.
          ctx.fillRect(scale(1 + pos) + 0.5, 0, pxPerLetter - 1.5, adjustedHeight);} else 
        if (previousBase === letter) {
          // Otherwise, we want runs of colors to be completely solid ...
          ctx.fillRect(scale(1 + pos) - 1.5, 0, pxPerLetter + 1.5, adjustedHeight);} else 
        {
          // ... and minimize the amount of smudging and whitespace between
          // bases.
          ctx.fillRect(scale(1 + pos) - 0.5, 0, pxPerLetter + 1.5, adjustedHeight);}}



      ctx.popObject();
      ctx.restore();
      previousBase = letter;}}}var 





GenomeTiledCanvas = (function (_TiledCanvas) {_inherits(GenomeTiledCanvas, _TiledCanvas);



  function GenomeTiledCanvas(source, height) {_classCallCheck(this, GenomeTiledCanvas);
    _get(Object.getPrototypeOf(GenomeTiledCanvas.prototype), 'constructor', this).call(this);
    this.source = source;
    // workaround for an issue in PhantomJS where height always comes out to zero.
    this.height = Math.max(1, height);}_createClass(GenomeTiledCanvas, [{ key: 'render', value: 


    function render(ctx, 
    scale, 
    range) {
      // The +/-1 ensures that partially-visible bases on the edge are rendered.
      var genomeRange = { 
        contig: range.contig, 
        start: Math.max(0, range.start() - 1), 
        stop: range.stop() + 1 };

      var basePairs = this.source.getRangeAsString(genomeRange);
      renderGenome(ctx, scale, this.height, _ContigInterval2['default'].fromGenomeRange(genomeRange), basePairs);} }, { key: 'heightForRef', value: 


    function heightForRef(ref) {
      return this.height;} }, { key: 'updateHeight', value: 


    function updateHeight(height) {
      this.height = height;} }]);return GenomeTiledCanvas;})(_TiledCanvas3['default']);var 



GenomeTrack = (function (_React$Component) {_inherits(GenomeTrack, _React$Component);function GenomeTrack() {_classCallCheck(this, GenomeTrack);_get(Object.getPrototypeOf(GenomeTrack.prototype), 'constructor', this).apply(this, arguments);}_createClass(GenomeTrack, [{ key: 'render', value: 




    function render() {
      return _ShimDependencies.React.createElement('canvas', null);} }, { key: 'componentDidMount', value: 


    function componentDidMount() {var _this = this;
      this.tiles = new GenomeTiledCanvas(this.props.source, this.props.height);

      // Visualize new reference data as it comes in from the network.
      this.props.source.on('newdata', function (range) {
        _this.tiles.invalidateRange(range);
        _this.updateVisualization();});


      this.updateVisualization();} }, { key: 'getScale', value: 


    function getScale() {
      return _d3utils2['default'].getTrackScale(this.props.range, this.props.width);} }, { key: 'componentDidUpdate', value: 


    function componentDidUpdate(prevProps, prevState) {
      if (!(0, _shallowEquals2['default'])(prevProps, this.props) || 
      !(0, _shallowEquals2['default'])(prevState, this.state)) {
        if (this.props.height != prevProps.height) {
          this.tiles.updateHeight(this.props.height);
          this.tiles.invalidateAll();}

        this.updateVisualization();}} }, { key: 'updateVisualization', value: 



    function updateVisualization() {
      var canvas = _ShimDependencies.ReactDOM.findDOMNode(this);var _props = 
      this.props;var width = _props.width;var height = _props.height;var range = _props.range;

      // Hold off until height & width are known.
      if (width === 0) return;

      if (canvas && canvas instanceof Element) {// check for getContext
        if (canvas instanceof HTMLCanvasElement) {// check for sizeCanvas
          _d3utils2['default'].sizeCanvas(canvas, width, height);}

        var ctx = _dataCanvas2['default'].getDataContext(_canvasUtils2['default'].getContext(canvas));

        ctx.reset();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.tiles.renderToScreen(ctx, _ContigInterval2['default'].fromGenomeRange(range), this.getScale());}
      // end typecheck for canvas
    } }]);return GenomeTrack;})(_ShimDependencies.React.Component);


GenomeTrack.displayName = 'reference';

module.exports = GenomeTrack; // no state, used to make flow happy