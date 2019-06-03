/**
 * RemoteFile is a representation of a file on a remote server which can be
 * fetched in chunks, e.g. using a Range request.
 * 
 */
'use strict';var _slicedToArray = (function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i['return']) _i['return']();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError('Invalid attempt to destructure non-iterable instance');}};})();var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();var _get = function get(_x, _x2, _x3) {var _again = true;_function: while (_again) {var object = _x, property = _x2, receiver = _x3;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {var parent = Object.getPrototypeOf(object);if (parent === null) {return undefined;} else {_x = parent;_x2 = property;_x3 = receiver;_again = true;desc = parent = undefined;continue _function;}} else if ('value' in desc) {return desc.value;} else {var getter = desc.get;if (getter === undefined) {return undefined;}return getter.call(receiver);}}};function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass) {if (typeof superClass !== 'function' && superClass !== null) {throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var _q = require(

'q');var _q2 = _interopRequireDefault(_q);var _AbstractFile2 = require(
'./AbstractFile');var _AbstractFile3 = _interopRequireDefault(_AbstractFile2);





// TODO(danvk): priority: number;
var 


RemoteFile = (function (_AbstractFile) {_inherits(RemoteFile, _AbstractFile);



  // track this for debugging/testing

  function RemoteFile(url) {_classCallCheck(this, RemoteFile);
    _get(Object.getPrototypeOf(RemoteFile.prototype), 'constructor', this).call(this);
    this.url = url;
    this.fileLength = -1; // unknown
    this.chunks = [];
    this.numNetworkRequests = 0;}_createClass(RemoteFile, [{ key: 'getBytes', value: 


    function getBytes(start, length) {
      if (length < 0) {
        return _q2['default'].reject('Requested <0 bytes (' + length + ') from ' + this.url);}


      // If the remote file length is known, clamp the request to fit within it.
      var stop = start + length - 1;
      if (this.fileLength != -1) {
        stop = Math.min(this.fileLength - 1, stop);}


      // First check the cache.
      var buf = this.getFromCache(start, stop);
      if (buf) {
        return _q2['default'].when(buf);}


      // TODO: handle partial overlap of request w/ cache.

      // Need to fetch from the network.
      return this.getFromNetwork(start, stop);}


    // Read the entire file -- not recommended for large files!
  }, { key: 'getAll', value: function getAll() {var _this = this;
      // Check cache if file length is available.
      if (this.fileLength != -1) {
        var buf = this.getFromCache(0, this.fileLength - 1);
        if (buf) {
          return _q2['default'].when(buf);}}



      var xhr = new XMLHttpRequest();
      xhr.open('GET', this.url);
      xhr.responseType = 'arraybuffer';
      return this.promiseXHR(xhr).then(function (_ref) {var _ref2 = _slicedToArray(_ref, 1);var buffer = _ref2[0];
        _this.fileLength = buffer.byteLength;
        _this.chunks = [{ start: 0, stop: _this.fileLength - 1, buffer: buffer }];
        return buffer;});}



    // Reads the entire file as a string (not an ArrayBuffer).
    // This does not use the cache.
  }, { key: 'getAllString', value: function getAllString() {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', this.url);
      return this.promiseXHR(xhr).then(function (_ref3) {var _ref32 = _slicedToArray(_ref3, 1);var string = _ref32[0];
        return string;});}



    // Returns a promise for the number of bytes in the remote file.
  }, { key: 'getSize', value: function getSize() {
      if (this.fileLength != -1) {
        return _q2['default'].when(this.fileLength);}


      var xhr = new XMLHttpRequest();
      xhr.open('HEAD', this.url);

      return this.promiseXHR(xhr).then(function () {
        // event.total would be better, see facebook/flow#357
        var len = xhr.getResponseHeader('Content-Length');
        if (len !== null) {
          return Number(len);} else 
        {
          throw 'Remote resource has unknown length';}});} }, { key: 'getFromCache', value: 




    function getFromCache(start, stop) {
      for (var i = 0; i < this.chunks.length; i++) {
        var chunk = this.chunks[i];
        if (chunk.start <= start && chunk.stop >= stop) {
          return chunk.buffer.slice(start - chunk.start, stop - chunk.start + 1);}}


      return null;} }, { key: 'getFromNetwork', value: 


    function getFromNetwork(start, stop) {var _this2 = this;
      var length = stop - start + 1;
      if (length > 50000000) {
        throw 'Monster request: Won\'t fetch ' + length + ' bytes from ' + this.url;}


      var xhr = new XMLHttpRequest();
      xhr.open('GET', this.url);
      xhr.responseType = 'arraybuffer';
      xhr.setRequestHeader('Range', 'bytes=' + start + '-' + stop);

      return this.promiseXHR(xhr).then(function (_ref4) {var _ref42 = _slicedToArray(_ref4, 1);var buffer = _ref42[0];
        // The actual length of the response may be less than requested if it's
        // too short, e.g. if we request bytes 0-1000 of a 500-byte file.
        var newChunk = { start: start, stop: start + buffer.byteLength - 1, buffer: buffer };
        _this2.chunks.push(newChunk);

        // Record the full file length if it's available.
        var size = _this2._getLengthFromContentRange(xhr);
        if (size !== null && size !== undefined) {
          if (_this2.fileLength != -1 && _this2.fileLength != size) {
            console.warn('Size of remote file ' + _this2.url + ' changed from ' + (
            _this2.fileLength + ' to ' + size));} else 
          {
            _this2.fileLength = size;}}



        return buffer;});}



    // Wrapper to convert XHRs to Promises.
    // The promised values are the response (e.g. an ArrayBuffer) and the Event.
  }, { key: 'promiseXHR', value: function promiseXHR(xhr) {
      var url = this.url;
      var deferred = _q2['default'].defer();
      xhr.addEventListener('load', function (e) {
        if (this.status >= 400) {
          deferred.reject('Request for ' + url + ' failed with status: ' + this.status + ' ' + this.statusText);} else 
        {
          deferred.resolve([this.response, e]);}});


      xhr.addEventListener('error', function (e) {
        deferred.reject('Request for ' + url + ' failed with status: ' + this.status + ' ' + this.statusText);});

      this.numNetworkRequests++;
      xhr.send();
      return deferred.promise;}


    // Attempting to access Content-Range directly may raise security errors.
    // This ensures the access is safe before making it.
  }, { key: '_getLengthFromContentRange', value: function _getLengthFromContentRange(xhr) {
      if (!/Content-Range/i.exec(xhr.getAllResponseHeaders())) {
        return null;}


      var contentRange = xhr.getResponseHeader('Content-Range');
      var m = /\/(\d+)$/.exec(contentRange);
      if (m) {
        return Number(m[1]);}

      console.warn('Received improper Content-Range value for ' + (
      this.url + ': ' + contentRange));
      return null;} }, { key: 'clearCache', value: 


    function clearCache() {
      this.chunks = [];} }]);return RemoteFile;})(_AbstractFile3['default']);



module.exports = RemoteFile; // regions of file that have already been loaded.