import { c as _slicedToArray, g as graphql, L as Link, n as ARTICLE_COLLECTIONS } from '../../../../../../client-cac2f5b5.js';
import { R as React } from '../../../../../../index-ef03c8d2.js';
import translation from './translation.js';
import 'http';
import 'https';
import 'url';
import 'stream';
import 'assert';
import 'tty';
import 'util';
import 'os';
import 'zlib';

function Card(_ref) {
  var title = _ref.title,
      description = _ref.description,
      imageSrc = _ref.imageSrc,
      className = _ref.className;
  var classes = className ? className : 'rounded overflow-hidden shadow-lg bg-white h-full';
  return /*#__PURE__*/React.createElement("div", {
    className: classes
  }, imageSrc && /*#__PURE__*/React.createElement("img", {
    className: "w-full",
    src: imageSrc,
    alt: "Sunset in the mountains"
  }), /*#__PURE__*/React.createElement("div", {
    className: "px-6 py-4"
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-xl mb-2"
  }, title), description && /*#__PURE__*/React.createElement("p", {
    className: "text-gray-700 text-base"
  }, description)));
}

function Collections(_ref) {
  var lang = _ref.lang,
      subdomain = _ref.subdomain;

  var _React$useState = React.useState([]),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      collections = _React$useState2[0],
      setCollections = _React$useState2[1];

  var _React$useState3 = React.useState(false),
      _React$useState4 = _slicedToArray(_React$useState3, 2);
      _React$useState4[0];
      var setError = _React$useState4[1];

  React.useEffect(function () {
    getArticles();
  }, [lang]);

  function getArticles() {
    graphql(ARTICLE_COLLECTIONS, {
      domain: subdomain,
      lang: lang
    }, {
      success: function success(data) {
        setCollections(data.helpCenter.collections);

        if (!data.helpCenter.collections) {
          setError('not_found');
        }
      },
      error: function error() {}
    });
  }

  function truncateOnWord(str, num) {
    if (!str) return '';

    if (str.length > num) {
      return str.slice(0, num) + '...';
    } else {
      return str;
    }
  }

  return /*#__PURE__*/React.createElement("div", {
    className: "py-12 sm:px-6 md:px-64 bg-gray-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "md:grid md:grid-cols-3 md:gap-x-4 md:gap-y-10"
  }, collections.map(function (card) {
    return /*#__PURE__*/React.createElement("div", {
      className: "m-4",
      item: true,
      key: card.id
    }, /*#__PURE__*/React.createElement(Card, {
      title: /*#__PURE__*/React.createElement(Link, {
        className: 'hover:underline',
        color: 'primary',
        to: "".concat(lang, "/collections/").concat(card.slug)
      }, card.icon && /*#__PURE__*/React.createElement("div", {
        className: "flex items-center justify-center h-12 w-12 rounded-md bg-white bg-opacity-10"
      }, /*#__PURE__*/React.createElement("img", {
        src: card.icon
      })), /*#__PURE__*/React.createElement("p", {
        className: "mt-2 text-base"
      }, translation(card.title))),
      description: truncateOnWord(card.description, 120)
    }));
  })));
}

export default Collections;
