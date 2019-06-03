/**
 * Controls for zooming to particular ranges of the genome.
 * 
 */
'use strict';var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();var _get = function get(_x, _x2, _x3) {var _again = true;_function: while (_again) {var object = _x, property = _x2, receiver = _x3;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {var parent = Object.getPrototypeOf(object);if (parent === null) {return undefined;} else {_x = parent;_x2 = property;_x3 = receiver;_again = true;desc = parent = undefined;continue _function;}} else if ('value' in desc) {return desc.value;} else {var getter = desc.get;if (getter === undefined) {return undefined;}return getter.call(receiver);}}};function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass) {if (typeof superClass !== 'function' && superClass !== null) {throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var _react = require(



'react');var _react2 = _interopRequireDefault(_react);var _pileup = require(

'./pileup');var _pileup2 = _interopRequireDefault(_pileup);






// type State = {
//   uuid: string;
// };

var deepEquals = function deepEquals(obj1, obj2) {return (
    JSON.stringify(obj1) === JSON.stringify(obj2));};

var CLASS_PREFIX = 'pileup-react-';var 

ReactInterface = (function (_React$Component) {_inherits(ReactInterface, _React$Component);



  function ReactInterface(props) {var _this = this;_classCallCheck(this, ReactInterface);
    _get(Object.getPrototypeOf(ReactInterface.prototype), 'constructor', this).call(this, props);
    this.state = { 
      pileup: null, 

      range: null, 
      tracks: null };


    this.setContainerRef = function (e) {
      _this.container = e;};


    this.pileupCreate = this.pileupCreate.bind(this);

    window.x = this;}_createClass(ReactInterface, [{ key: 'pileupCreate', value: 


    function pileupCreate() {var _props = 
      this.props;var range = _props.range;var tracks = _props.tracks;
      return _pileup2['default'].create(this.container, { 
        range: range, 
        tracks: sources });} }, { key: 'componentDidMount', value: 



    function componentDidMount() {var _props2 = 
      this.props;var range = _props2.range;var tracks = _props2.tracks;
      this.setState({ 
        pileup: this.pileupCreate(), 
        range: range, 
        tracks: tracks });} }, { key: 'componentDidUpdate', value: 



    function componentDidUpdate(prevProps) {var _props3 = 
      this.props;var range = _props3.range;var tracks = _props3.tracks;var 
      pileup = this.state.pileup;

      if (!deepEquals(tracks, prevProps.tracks)) {
        pileup.destroy();
        this.setState({ 
          pileup: this.pileupCreate() });} else 


      if (!deepEquals(range, prevProps.range)) {
        pileup.setRange(range);}


      this.setState({ 
        range: range, 
        tracks: tracks });} }, { key: 'componentWillUnmount', value: 



    function componentWillUnmount() {
      this.state.pileup.destroy();} }, { key: 'render', value: 


    function render() {
      // Note: input values are set in componentDidUpdate.
      return (
        _react2['default'].createElement('div', { 
          className: CLASS_PREFIX + 'container', 
          ref: this.setContainerRef }));} }]);return ReactInterface;})(_react2['default'].Component);





module.exports = ReactInterface;