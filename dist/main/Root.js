/**
 * Root of the React component tree.
 * 
 */
'use strict';var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();var _get = function get(_x, _x2, _x3) {var _again = true;_function: while (_again) {var object = _x, property = _x2, receiver = _x3;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {var parent = Object.getPrototypeOf(object);if (parent === null) {return undefined;} else {_x = parent;_x2 = property;_x3 = receiver;_again = true;desc = parent = undefined;continue _function;}} else if ('value' in desc) {return desc.value;} else {var getter = desc.get;if (getter === undefined) {return undefined;}return getter.call(receiver);}}};function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass) {if (typeof superClass !== 'function' && superClass !== null) {throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var _ShimDependencies = require(





'./ShimDependencies');var _Controls = require(
'./Controls');var _Controls2 = _interopRequireDefault(_Controls);var _Menu = require(
'./Menu');var _Menu2 = _interopRequireDefault(_Menu);var _VisualizationWrapper = require(
'./VisualizationWrapper');var _VisualizationWrapper2 = _interopRequireDefault(_VisualizationWrapper);var 















Root = (function (_React$Component) {_inherits(Root, _React$Component);


  //it's an array of reactelement that are created for tracks

  function Root(props) {_classCallCheck(this, Root);
    _get(Object.getPrototypeOf(Root.prototype), 'constructor', this).call(this, props);
    this.state = { 
      contigList: this.props.referenceSource.contigList(), 
      range: null, 
      updateSize: false, 
      settingsMenuKey: null };

    this.trackReactElements = [];}_createClass(Root, [{ key: 'componentDidMount', value: 


    function componentDidMount() {var _this = this;
      this.props.referenceSource.on('contigs', function () {
        _this.setState({ 
          contigList: _this.props.referenceSource.contigList() });});



      if (!this.state.range) {
        this.handleRangeChange(this.props.initialRange);}

      // in case the contigs came in between getInitialState() and here.
      this.setState({ contigList: this.props.referenceSource.contigList() });} }, { key: 'handleRangeChange', value: 


    function handleRangeChange(newRange) {var _this2 = this;
      // Do not propagate negative ranges
      if (newRange.start < 0) {
        newRange.start = 0;}

      this.props.referenceSource.normalizeRange(newRange).then(function (range) {
        _this2.setState({ range: range });

        // Inform all the sources of the range change (including referenceSource).
        _this2.props.tracks.forEach(function (track) {
          track.source.rangeChanged(range);});}).

      done();} }, { key: 'toggleSettingsMenu', value: 


    function toggleSettingsMenu(key, e) {
      if (this.state.settingsMenuKey == key) {
        this.setState({ settingsMenuKey: null });} else 
      {
        this.setState({ settingsMenuKey: key });}} }, { key: 'handleSelectOption', value: 



    function handleSelectOption(trackKey, optionKey) {
      this.setState({ settingsMenuKey: null });
      var viz = this.props.tracks[Number(trackKey)].visualization;
      var oldOpts = viz.options;
      // $FlowIgnore: TODO remove flow suppression
      var newOpts = viz.component.handleSelectOption(optionKey, oldOpts);
      viz.options = newOpts;
      if (newOpts != oldOpts) {
        this.forceUpdate();}} }, { key: 'makeDivForTrack', value: 



    function makeDivForTrack(key, track) {var _this3 = this;
      //this should be improved, but I have no idea how (when trying to
      //access this.trackReactElements with string key, flow complains)
      var intKey = parseInt(key);
      var trackEl = 
      _ShimDependencies.React.createElement(_VisualizationWrapper2['default'], { visualization: track.visualization, 
        range: this.state.range, 
        onRangeChange: this.handleRangeChange.bind(this), 
        source: track.source, 
        options: track.track.options, 
        referenceSource: this.props.referenceSource, 
        ref: function (c) {_this3.trackReactElements[intKey] = c;} });


      var trackName = track.track.name || '(track name)';

      var gearIcon = null, 
      settingsMenu = null;
      // $FlowIgnore: TODO remove flow suppression
      if (track.visualization.component.getOptionsMenu) {
        gearIcon = 
        _ShimDependencies.React.createElement('span', { ref: 'gear-' + key, 
          className: 'gear', 
          onClick: this.toggleSettingsMenu.bind(this, key) }, '⚙');}





      if (this.state.settingsMenuKey == key) {
        var gear = this.refs['gear-' + key], 
        gearX = gear.offsetLeft, 
        gearW = gear.offsetWidth, 
        gearY = gear.offsetTop;

        var menuStyle = { 
          position: 'absolute', 
          left: gearX + gearW + 'px', 
          top: gearY + 'px' };

        // $FlowIgnore: TODO remove flow suppression
        var items = track.visualization.component.getOptionsMenu(track.visualization.options);
        settingsMenu = 
        _ShimDependencies.React.createElement('div', { className: 'menu-container', style: menuStyle }, 
        _ShimDependencies.React.createElement(_Menu2['default'], { header: trackName, items: items, onSelect: this.handleSelectOption.bind(this, key) }));}




      var className = ['track', track.visualization.component.displayName || '', track.track.cssClass || ''].join(' ');

      return (
        _ShimDependencies.React.createElement('div', { key: key, className: className }, 
        _ShimDependencies.React.createElement('div', { className: 'track-label' }, 
        _ShimDependencies.React.createElement('span', null, trackName), 
        _ShimDependencies.React.createElement('br', null), 
        gearIcon, 
        settingsMenu), 

        _ShimDependencies.React.createElement('div', { className: 'track-content' }, 
        trackEl)));} }, { key: 'render', value: 





    function render() {var _this4 = this;
      // TODO: use a better key than index.
      var trackEls = this.props.tracks.map(function (t, i) {return _this4.makeDivForTrack('' + i, t);});
      return (
        _ShimDependencies.React.createElement('div', { className: 'pileup-root' }, 

        this.props.controlsOff ? 
        null : 

        _ShimDependencies.React.createElement('div', { className: 'track controls' }, 
        _ShimDependencies.React.createElement('div', { className: 'track-label' }, ' '), 


        _ShimDependencies.React.createElement('div', { className: 'track-content' }, 
        _ShimDependencies.React.createElement(_Controls2['default'], { contigList: this.state.contigList, 
          range: this.state.range, 
          onChange: this.handleRangeChange.bind(this) }))), 




        trackEls));} }, { key: 'componentDidUpdate', value: 




    function componentDidUpdate(prevProps, prevState) {
      if (this.state.updateSize) {
        for (var i = 0; i < this.props.tracks.length; i++) {
          this.trackReactElements[i].setState({ updateSize: this.state.updateSize });}

        this.state.updateSize = false;}} }]);return Root;})(_ShimDependencies.React.Component);




Root.displayName = 'Root';

module.exports = Root;