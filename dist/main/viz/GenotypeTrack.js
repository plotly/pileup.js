/**
 * Visualization of genotypes
 * 
 */
'use strict';var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();var _get = function get(_x, _x2, _x3) {var _again = true;_function: while (_again) {var object = _x, property = _x2, receiver = _x3;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {var parent = Object.getPrototypeOf(object);if (parent === null) {return undefined;} else {_x = parent;_x2 = property;_x3 = receiver;_again = true;desc = parent = undefined;continue _function;}} else if ('value' in desc) {return desc.value;} else {var getter = desc.get;if (getter === undefined) {return undefined;}return getter.call(receiver);}}};function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass) {if (typeof superClass !== 'function' && superClass !== null) {throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var _react = require(







'react');var _react2 = _interopRequireDefault(_react);var _underscore = require(
'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _d3utils = require(


'./d3utils');var _d3utils2 = _interopRequireDefault(_d3utils);var _shallowEquals = require(
'shallow-equals');var _shallowEquals2 = _interopRequireDefault(_shallowEquals);var _ContigInterval = require(
'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var _canvasUtils = require(
'./canvas-utils');var _canvasUtils2 = _interopRequireDefault(_canvasUtils);var _TiledCanvas2 = require(
'./TiledCanvas');var _TiledCanvas3 = _interopRequireDefault(_TiledCanvas2);var _dataCanvas = require(
'data-canvas');var _dataCanvas2 = _interopRequireDefault(_dataCanvas);var _style = require(
'../style');var _style2 = _interopRequireDefault(_style);var _utils = require(
'../utils');var _utils2 = _interopRequireDefault(_utils);


var MONSTER_REQUEST = 10000;
var LABEL_WIDTH = 100;var 

GenotypeTiledCanvas = (function (_TiledCanvas) {_inherits(GenotypeTiledCanvas, _TiledCanvas);




  function GenotypeTiledCanvas(source, callSetNames, options) {_classCallCheck(this, GenotypeTiledCanvas);
    _get(Object.getPrototypeOf(GenotypeTiledCanvas.prototype), 'constructor', this).call(this);
    this.source = source;
    this.options = options;
    this.callSetNames = callSetNames;}






















  // Draw genotypes
  _createClass(GenotypeTiledCanvas, [{ key: 'update', value: function update(newOptions) {this.options = newOptions;} }, { key: 'heightForRef', value: function heightForRef(ref) {return yForRow(this.callSetNames.length);} }, { key: 'render', value: function render(ctx, scale, range, originalRange) {var relaxedRange = new _ContigInterval2['default'](range.contig, range.start() - 1, range.stop() + 1); // relaxed range is just for this tile
      var vGenotypes = this.source.getGenotypesInRange(relaxedRange);renderGenotypes(ctx, scale, relaxedRange, vGenotypes, this.callSetNames);} }]);return GenotypeTiledCanvas;})(_TiledCanvas3['default']);function renderGenotypes(ctx, scale, 
range, 
vcs, 
callSetNames) {
  // draw genotypes
  vcs.forEach(function (vc) {
    var variant = vc.variant;
    ctx.pushObject(variant);

    var x = Math.round(scale(variant.position));
    var width = Math.max(1, Math.round(scale(variant.position + 1) - scale(variant.position)));
    vc.calls.forEach(function (call) {
      var y = yForRow(callSetNames.indexOf(call.callSetName));
      ctx.fillStyle = call.genotype.reduce(function (a, b) {return a + b;}, 0) == 1 ? _style2['default'].GENOTYPE_FILL_HET : _style2['default'].GENOTYPE_FILL_HOM;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.fillRect(x - 0.2, y, width, _style2['default'].GENOTYPE_HEIGHT);
      ctx.strokeRect(x - 0.2, y, width, _style2['default'].GENOTYPE_HEIGHT);});

    ctx.popObject();});}



function yForRow(row) {
  return row * (_style2['default'].GENOTYPE_HEIGHT + _style2['default'].GENOTYPE_SPACING);}var 


GenotypeTrack = (function (_React$Component) {_inherits(GenotypeTrack, _React$Component);





  function GenotypeTrack(props) {var _this = this;_classCallCheck(this, GenotypeTrack);
    _get(Object.getPrototypeOf(GenotypeTrack.prototype), 'constructor', this).call(this, props);
    this.callSetNames = [];
    this.state = { 
      networkStatus: null };

    props.source.getCallNames().then(function (samples) {
      _this.callSetNames = samples;
      _this.tiles.callSetNames = samples;
      _this.tiles.invalidateAll();
      _this.updateVisualization();});}_createClass(GenotypeTrack, [{ key: 'render', value: 



    function render() {
      // These styles allow vertical scrolling to see the full pileup.
      // Adding a vertical scrollbar shrinks the visible area, but we have to act
      // as though it doesn't, since adjusting the scale would put it out of sync
      // with other tracks.
      var containerStyles = { 
        'height': '100%' };


      var labelStyles = { 
        'float': 'left', 
        'overflow': 'hidden', 
        'width:': LABEL_WIDTH + 'px' };


      var canvasStyles = { 
        'overflow': 'hidden' };


      var statusEl = null, 
      networkStatus = this.state.networkStatus;
      if (networkStatus) {
        statusEl = 
        _react2['default'].createElement('div', { ref: 'status', className: 'network-status-small' }, 
        _react2['default'].createElement('div', { className: 'network-status-message-small' }, 'Loading Genotypes…'));}





      var rangeLength = this.props.range.stop - this.props.range.start;
      // If range is too large, do not render 'canvas'
      if (rangeLength >= MONSTER_REQUEST) {
        return (
          _react2['default'].createElement('div', null, 
          _react2['default'].createElement('div', { className: 'center' }, 'Zoom in to see genotypes'), 


          _react2['default'].createElement('canvas', { onClick: this.handleClick.bind(this) })));} else 


      {
        return (
          _react2['default'].createElement('div', null, 
          statusEl, 
          _react2['default'].createElement('div', { ref: 'container', style: containerStyles }, 
          _react2['default'].createElement('div', { className: 'genotypeLabels', style: labelStyles }, _react2['default'].createElement('canvas', { ref: 'labelCanvas' })), 
          _react2['default'].createElement('div', { className: 'genotypeRows', style: canvasStyles }, _react2['default'].createElement('canvas', { ref: 'canvas', onClick: this.handleClick.bind(this) })))));}} }, { key: 'componentDidMount', value: 






    function componentDidMount() {var _this2 = this;
      this.tiles = new GenotypeTiledCanvas(this.props.source, 
      this.callSetNames, this.props.options);

      // Visualize new data as it comes in from the network.
      this.props.source.on('newdata', function (range) {
        _this2.tiles.invalidateRange(range);
        _this2.updateVisualization();});

      this.props.source.on('networkprogress', function (e) {
        _this2.setState({ networkStatus: e });});

      this.props.source.on('networkdone', function (e) {
        _this2.setState({ networkStatus: null });});


      this.updateVisualization();} }, { key: 'getScale', value: 


    function getScale() {
      return _d3utils2['default'].getTrackScale(this.props.range, this.props.width - LABEL_WIDTH);} }, { key: 'componentDidUpdate', value: 


    function componentDidUpdate(prevProps, prevState) {
      if (!(0, _shallowEquals2['default'])(prevProps, this.props) || 
      !(0, _shallowEquals2['default'])(prevState, this.state)) {
        this.tiles.update(this.props.options);
        this.tiles.invalidateAll();
        this.updateVisualization();}}



    // draws genotype lines to visually separate genotype rows
  }, { key: 'drawLines', value: function drawLines(ctx) {var _this3 = this;
      var width = this.props.width;

      // draw background for each row
      if (this.callSetNames !== null) {
        ctx.font = "9px Arial";
        this.callSetNames.forEach(function (sampleId) {
          ctx.pushObject(sampleId);
          var y = yForRow(_this3.callSetNames.indexOf(sampleId));
          ctx.fillStyle = _style2['default'].BACKGROUND_FILL;
          ctx.fillRect(0, y, width, _style2['default'].GENOTYPE_HEIGHT);
          ctx.popObject();});}}




    // draws sample names on side bar. This needs to be only rendered once.
  }, { key: 'drawLabels', value: function drawLabels() {var _this4 = this;
      // if already drawn, return
      var labelCanvas = this.refs.labelCanvas, 
      width = this.props.width;

      // Hold off until height & width are known.
      if (width === 0 || typeof labelCanvas == 'undefined') return;

      var height = yForRow(this.callSetNames.length);


      // only render once on load.
      if (labelCanvas.clientHeight != height) {
        var labelCtx = _dataCanvas2['default'].getDataContext(_canvasUtils2['default'].getContext(labelCanvas));
        _d3utils2['default'].sizeCanvas(labelCanvas, LABEL_WIDTH, height);

        // draw label for each row
        if (this.callSetNames !== null) {
          labelCtx.font = "9px Arial";
          this.callSetNames.forEach(function (sampleId) {
            labelCtx.pushObject(sampleId);
            var y = yForRow(_this4.callSetNames.indexOf(sampleId));
            labelCtx.fillStyle = "black";
            labelCtx.fillText(sampleId, 0, y + _style2['default'].GENOTYPE_HEIGHT);
            labelCtx.popObject();});}}} }, { key: 'updateVisualization', value: 





    function updateVisualization() {
      var canvas = this.refs.canvas, 
      width = this.props.width;

      // Hold off until height & width are known.
      if (width === 0 || typeof canvas == 'undefined') return;

      var height = yForRow(this.callSetNames.length);
      _d3utils2['default'].sizeCanvas(canvas, width - LABEL_WIDTH, height);

      var ctx = _dataCanvas2['default'].getDataContext(_canvasUtils2['default'].getContext(canvas));
      this.drawLabels();
      this.renderScene(ctx);} }, { key: 'renderScene', value: 


    function renderScene(ctx) {
      var range = this.props.range, 
      interval = new _ContigInterval2['default'](range.contig, range.start, range.stop), 
      scale = this.getScale();

      ctx.reset();
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // render lines after rectangle has been cleared
      this.drawLines(ctx);

      this.tiles.renderToScreen(ctx, interval, scale);
      ctx.restore();} }, { key: 'handleClick', value: 


    function handleClick(reactEvent) {
      var ev = reactEvent.nativeEvent, 
      x = ev.offsetX;

      var genomeRange = this.props.range, 
      // allow some buffering so click isn't so sensitive
      range = new _ContigInterval2['default'](genomeRange.contig, genomeRange.start - 1, genomeRange.stop + 1), 
      scale = this.getScale(), 
      // leave padding of 2px to reduce click specificity
      clickStart = Math.floor(scale.invert(x)) - 2, 
      clickEnd = clickStart + 2, 
      // If click-tracking gets slow, this range could be narrowed to one
      // closer to the click coordinate, rather than the whole visible range.
      vGenotypes = this.props.source.getGenotypesInRange(range);

      var genotype = _underscore2['default'].find(vGenotypes, function (f) {return _utils2['default'].tupleRangeOverlaps([[f.variant.position], [f.variant.position + 1]], [[clickStart], [clickEnd]]);});
      var alert = window.alert || console.log;
      if (genotype) {
        var variantString = 'variant: ' + JSON.stringify(genotype.variant);
        var callSetNames = genotype.calls.map(function (r) {return r.callSetName;});
        var samples = 'samples with variant: ' + JSON.stringify(callSetNames);
        alert(variantString + '\n' + samples);}} }]);return GenotypeTrack;})(_react2['default'].Component);




GenotypeTrack.displayName = 'genotypes';

module.exports = GenotypeTrack;