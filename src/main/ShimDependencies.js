/**
 * Shim Dependencies
 * @flow
 */
'use strict';

export const React = (window && window.React) || (global && global.React) || require('react');
export const ReactDOM = (window && window.ReactDOM) || (global && global.ReactDOM) || require('react-dom');
