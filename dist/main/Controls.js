/**
 * Controls for zooming to particular ranges of the genome.
 * 
 */
'use strict';var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();var _get = function get(_x, _x2, _x3) {var _again = true;_function: while (_again) {var object = _x, property = _x2, receiver = _x3;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {var parent = Object.getPrototypeOf(object);if (parent === null) {return undefined;} else {_x = parent;_x2 = property;_x3 = receiver;_again = true;desc = parent = undefined;continue _function;}} else if ('value' in desc) {return desc.value;} else {var getter = desc.get;if (getter === undefined) {return undefined;}return getter.call(receiver);}}};function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass) {if (typeof superClass !== 'function' && superClass !== null) {throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var _ShimDependencies = require(



'./ShimDependencies');var _underscore = require(
'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _utils = require(

'./utils');var _utils2 = _interopRequireDefault(_utils);var _Interval = require(
'./Interval');var _Interval2 = _interopRequireDefault(_Interval);var 














Controls = (function (_React$Component) {_inherits(Controls, _React$Component);



  function Controls(props) {_classCallCheck(this, Controls);
    _get(Object.getPrototypeOf(Controls.prototype), 'constructor', this).call(this, props);
    this.state = { defaultHalfInterval: 2 };}_createClass(Controls, [{ key: 'makeRange', value: 


    function makeRange() {
      return { 
        contig: this.refs.contig.value, 
        start: Number(this.refs.start.value), 
        stop: Number(this.refs.stop.value) };} }, { key: 'completeRange', value: 



    function completeRange(range) {var _this = this;
      range = range || {};
      if (range.start && range.stop === undefined) {
        // Construct a range centered around a value. This matches IGV.
        range.stop = range.start + 20;
        range.start -= 20;}


      if (range.contig) {var 



        altContig;(function () {// There are major performance issues with having a 'chr' mismatch in the
          // global location object.
          var contig = range.contig;altContig = _underscore2['default'].find(_this.props.contigList, function (ref) {return _utils2['default'].isChrMatch(contig, ref);});if (altContig) range.contig = altContig;})();}

      return _underscore2['default'].extend(_underscore2['default'].clone(this.props.range), range);} }, { key: 'handleContigChange', value: 


    function handleContigChange(e) {
      this.props.onChange(this.completeRange({ contig: this.refs.contig.value }));} }, { key: 'handleFormSubmit', value: 


    function handleFormSubmit(e) {
      e.preventDefault();
      var range = this.completeRange(_utils2['default'].parseRange(this.refs.position.value));
      this.props.onChange(range);
      this.updateSlider(new _Interval2['default'](range.start, range.stop));} }, { key: 'handleSliderOnInput', value: 


    function handleSliderOnInput() {
      // value is a string, want valueAsNumber
      // slider has negative values to reverse its direction so we need to negate
      this.zoomAbs(-this.refs.slider.valueAsNumber);}


    // Sets the values of the input elements to match `props.range`.
  }, { key: 'updateRangeUI', value: function updateRangeUI() {
      var r = this.props.range;
      if (!r) return;

      this.refs.position.value = _utils2['default'].formatInterval(new _Interval2['default'](r.start, r.stop));

      if (this.props.contigList) {
        var contigIdx = this.props.contigList.indexOf(r.contig);
        this.refs.contig.selectedIndex = contigIdx;}} }, { key: 'zoomIn', value: 



    function zoomIn(e) {
      e.preventDefault();
      this.zoomByFactor(0.5);} }, { key: 'zoomOut', value: 


    function zoomOut(e) {
      e.preventDefault();
      this.zoomByFactor(2.0);}


    // Updates the range using absScaleRange and a given zoom level
    // Abs or absolute because it doesn't rely on scaling the current range
  }, { key: 'zoomAbs', value: function zoomAbs(level) {
      var r = this.props.range;
      if (!r) return;

      var iv = _utils2['default'].absScaleRange(new _Interval2['default'](r.start, r.stop), level, this.state.defaultHalfInterval);
      this.props.onChange({ 
        contig: r.contig, 
        start: iv.start, 
        stop: iv.stop });} }, { key: 'zoomByFactor', value: 



    function zoomByFactor(factor) {
      var r = this.props.range;
      if (!r) return;

      var iv = _utils2['default'].scaleRange(new _Interval2['default'](r.start, r.stop), factor);
      this.props.onChange({ 
        contig: r.contig, 
        start: iv.start, 
        stop: iv.stop });

      this.updateSlider(iv);}


    // To be used if the range changes through a control besides the slider
    // Slider value is changed to roughly reflect the new range
  }, { key: 'updateSlider', value: function updateSlider(newInterval) {
      var newSpan = newInterval.stop - newInterval.start;
      this.refs.slider.valueAsNumber = Math.ceil(-Math.log2(newSpan) + 1);} }, { key: 'render', value: 


    function render() {
      var contigOptions = this.props.contigList ? 
      this.props.contigList.map(function (contig, i) {return _ShimDependencies.React.createElement('option', { key: i }, contig);}) : 
      null;

      // Note: input values are set in componentDidUpdate.
      return (
        _ShimDependencies.React.createElement('form', { className: 'controls', onSubmit: this.handleFormSubmit.bind(this) }, 
        _ShimDependencies.React.createElement('select', { ref: 'contig', onChange: this.handleContigChange.bind(this) }, 
        contigOptions), 
        ' ', 
        _ShimDependencies.React.createElement('input', { ref: 'position', type: 'text' }), ' ', 
        _ShimDependencies.React.createElement('button', { className: 'btn-submit', onClick: this.handleFormSubmit.bind(this) }, 'Go'), ' ', 
        _ShimDependencies.React.createElement('div', { className: 'zoom-controls' }, 
        _ShimDependencies.React.createElement('button', { className: 'btn-zoom-out', onClick: this.zoomOut.bind(this) }), ' ', 
        _ShimDependencies.React.createElement('button', { className: 'btn-zoom-in', onClick: this.zoomIn.bind(this) }), 
        _ShimDependencies.React.createElement('input', { className: 'zoom-slider', ref: 'slider', type: 'range', min: '-15', max: '0', onInput: this.handleSliderOnInput.bind(this), 'class': 'slider' }))));} }, { key: 'componentDidUpdate', value: 





    function componentDidUpdate(prevProps) {
      if (!_underscore2['default'].isEqual(prevProps.range, this.props.range)) {
        this.updateRangeUI();}} }, { key: 'componentDidMount', value: 



    function componentDidMount() {
      this.updateRangeUI();} }]);return Controls;})(_ShimDependencies.React.Component);



module.exports = Controls; // the base number to be used for absolute zoom
// new ranges become 2*defaultHalfInterval**zoomLevel + 1
// half interval is simply the span cut in half and excluding the center