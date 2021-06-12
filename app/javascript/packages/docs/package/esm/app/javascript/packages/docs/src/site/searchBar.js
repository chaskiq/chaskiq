import { c as _slicedToArray, L as Link, g as graphql, o as SEARCH_ARTICLES } from '../../../../../../client-cac2f5b5.js';
import { R as React } from '../../../../../../index-ef03c8d2.js';
import { L as List, a as ListItem, b as ListItemText } from '../../../../../../List-b299533f.js';
import 'http';
import 'https';
import 'url';
import 'stream';
import 'assert';
import 'tty';
import 'util';
import 'os';
import 'zlib';

function CustomizedInputBase(_ref) {
  var lang = _ref.lang;
      _ref._history;
      var subdomain = _ref.subdomain,
      settings = _ref.settings;

  var _React$useState = React.useState([]),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      results = _React$useState2[0],
      setResults = _React$useState2[1];

  var _React$useState3 = React.useState(null),
      _React$useState4 = _slicedToArray(_React$useState3, 2),
      anchorEl = _React$useState4[0],
      setAnchorEl = _React$useState4[1];

  function search(term) {
    graphql(SEARCH_ARTICLES, {
      domain: subdomain,
      term: term,
      lang: lang,
      page: 1
    }, {
      success: function success(data) {
        setResults(data.helpCenter.search.collection);
      },
      error: function error() {}
    });
  }

  function handleReturn(e) {
    e.persist(); // console.log(e.key)

    if (e.key === 'Enter') {
      // e.preventDefault()
      search(e.target.value);
      setAnchorEl(anchorEl ? null : e.target);
    }
  }

  return /*#__PURE__*/React.createElement("div", {
    className: "flex justify-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full lg:w-4/5 mt-4 mb-8"
  }, /*#__PURE__*/React.createElement("p", {
    className: 'py-3 text-left text-2xl lg:text-3xl leading-9 font-light text-gray-100 md:mx-24-'
  }, settings.siteDescription), /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("svg", {
    className: "absolute top-0 ml-4 mt-2 lg:mt-2 lg:ml-3 w-8 h-6 text-gray-600",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "21",
    y1: "21",
    x2: "16.65",
    y2: "16.65"
  })), /*#__PURE__*/React.createElement("input", {
    className: "text-1xl lg:text-1xl placeholder-gray-600 text-gray-800 pb-2 pt-2 pl-20 pr-2 rounded  w-full border-b-4 focus:outline-none focus:border-blue-800",
    type: "text",
    placeholder: "Search in articles",
    onKeyPress: handleReturn
  }), results && /*#__PURE__*/React.createElement("div", {
    className: "absolute w-full"
  }, /*#__PURE__*/React.createElement(List, null, results.map(function (o) {
    return /*#__PURE__*/React.createElement(ListItem, {
      key: "search-result-".concat(o.slug)
    }, /*#__PURE__*/React.createElement(ListItemText, {
      primary: /*#__PURE__*/React.createElement(Link, {
        onClick: function onClick() {
          return setResults([]);
        },
        to: "/".concat(lang, "/articles/").concat(o.slug)
      }, o.title) // secondary={'sks'}

    }));
  }))))));
}

export default CustomizedInputBase;
