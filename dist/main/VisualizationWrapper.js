'use strict';Object.defineProperty(exports, '__esModule', { value: true });var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();var _get = function get(_x, _x2, _x3) {var _again = true;_function: while (_again) {var object = _x, property = _x2, receiver = _x3;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {var parent = Object.getPrototypeOf(object);if (parent === null) {return undefined;} else {_x = parent;_x2 = property;_x3 = receiver;_again = true;desc = parent = undefined;continue _function;}} else if ('value' in desc) {return desc.value;} else {var getter = desc.get;if (getter === undefined) {return undefined;}return getter.call(receiver);}}};function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass) {if (typeof superClass !== 'function' && superClass !== null) {throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var _ShimDependencies = require(








'./ShimDependencies');var _vizD3utils = require(
'./viz/d3utils');var _vizD3utils2 = _interopRequireDefault(_vizD3utils);var _underscore = require(
'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _libMinid3 = require(
'../lib/minid3');var _libMinid32 = _interopRequireDefault(_libMinid3);var 

























VisualizationWrapper = (function (_React$Component) {_inherits(VisualizationWrapper, _React$Component);



  //listener that handles window.onresize event

  function VisualizationWrapper(props) {_classCallCheck(this, VisualizationWrapper);
    _get(Object.getPrototypeOf(VisualizationWrapper.prototype), 'constructor', this).call(this, props);
    this.hasDragBeenInitialized = false;
    this.state = { 
      updateSize: false, 
      width: 0, 
      height: 0 };}_createClass(VisualizationWrapper, [{ key: 'updateSize', value: 



    function updateSize() {
      var thisNode = _ShimDependencies.ReactDOM.findDOMNode(this);
      if (thisNode && thisNode instanceof Element) {// check for getContext
        var parentDiv = thisNode.parentNode;
        if (parentDiv && parentDiv instanceof HTMLElement) {// check for getContext
          this.setState({ 
            updateSize: false, 
            width: parentDiv.offsetWidth, 
            height: parentDiv.offsetHeight });}}} }, { key: 'componentDidMount', value: 





    function componentDidMount() {var _this = this;
      //local copy of the listener, so we can remove it
      //when pileup is destroyed
      this.onResizeListener = function () {return _this.updateSize();};
      window.addEventListener('resize', this.onResizeListener);
      this.updateSize();

      if (this.props.range && !this.hasDragBeenInitialized) this.addDragInterface();} }, { key: 'componentDidUpdate', value: 


    function componentDidUpdate() {
      if (this.props.range && !this.hasDragBeenInitialized) this.addDragInterface();} }, { key: 'componentWillUnmount', value: 


    function componentWillUnmount() {
      window.removeEventListener('resize', this.onResizeListener);} }, { key: 'getScale', value: 


    function getScale() {
      if (!this.props.range) return function (x) {return x;};
      return _vizD3utils2['default'].getTrackScale(this.props.range, this.state.width);} }, { key: 'addDragInterface', value: 


    function addDragInterface() {var _this2 = this;
      this.hasDragBeenInitialized = true;
      var div = _ShimDependencies.ReactDOM.findDOMNode(this);
      var originalRange, originalScale, dx = 0;
      var dragstarted = function dragstarted() {
        _libMinid32['default'].event.sourceEvent.stopPropagation();
        dx = 0;
        originalRange = _underscore2['default'].clone(_this2.props.range);
        originalScale = _this2.getScale();};

      var updateRange = function updateRange() {
        if (!originalScale) return; // can never happen, but Flow don't know.
        if (!originalRange) return; // can never happen, but Flow don't know.
        var newStart = originalScale.invert(-dx), 
        intStart = Math.round(newStart), 
        offsetPx = originalScale(newStart) - originalScale(intStart);

        var newRange = { 
          contig: originalRange.contig, 
          start: intStart, 
          stop: intStart + (originalRange.stop - originalRange.start), 
          offsetPx: offsetPx };

        _this2.props.onRangeChange(newRange);};

      var dragmove = function dragmove() {
        dx += _libMinid32['default'].event.dx; // these are integers, so no roundoff issues.
        updateRange();};

      function dragended() {
        updateRange();}


      var drag = _libMinid32['default'].behavior.drag().
      on('dragstart', dragstarted).
      on('drag', dragmove).
      on('dragend', dragended);

      _libMinid32['default'].select(div).call(drag).on('click', this.handleClick.bind(this));} }, { key: 'handleClick', value: 


    function handleClick() {
      if (_libMinid32['default'].event.defaultPrevented) {
        _libMinid32['default'].event.stopPropagation();}} }, { key: 'componentWillUpdate', value: 



    function componentWillUpdate(nextProps, nextState) {
      if (nextState.updateSize) {
        this.updateSize();}} }, { key: 'render', value: 



    function render() {
      var range = this.props.range;
      var component = this.props.visualization.component;
      if (!range) {
        if (component.displayName != null) 
        return _ShimDependencies.React.createElement(EmptyTrack, { className: component.displayName });else 

        return _ShimDependencies.React.createElement(EmptyTrack, { className: 'EmptyTrack' });}


      var options = _underscore2['default'].extend(_underscore2['default'].clone(this.props.visualization.options), this.props.options);

      var el = _ShimDependencies.React.createElement(component, { 
        range: range, 
        source: this.props.source, 
        referenceSource: this.props.referenceSource, 
        width: this.state.width, 
        height: this.state.height, 
        options: options });


      return _ShimDependencies.React.createElement('div', { className: 'drag-wrapper' }, el);} }]);return VisualizationWrapper;})(_ShimDependencies.React.Component);


VisualizationWrapper.displayName = 'VisualizationWrapper';var 



EmptyTrack = (function (_React$Component2) {_inherits(EmptyTrack, _React$Component2);function EmptyTrack() {_classCallCheck(this, EmptyTrack);_get(Object.getPrototypeOf(EmptyTrack.prototype), 'constructor', this).apply(this, arguments);}_createClass(EmptyTrack, [{ key: 'render', value: 
    function render() {
      var className = this.props.className + ' empty';
      return _ShimDependencies.React.createElement('div', { className: className });} }]);return EmptyTrack;})(_ShimDependencies.React.Component);



module.exports = VisualizationWrapper;