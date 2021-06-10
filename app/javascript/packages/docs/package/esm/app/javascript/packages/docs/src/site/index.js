import { R as React } from '../../../../../../index-ef03c8d2.js';
import { B as BrowserRouter, S as Switch, R as Route } from '../../../../../../client-cac2f5b5.js';
import Docs from './docs.js';
import 'http';
import 'https';
import 'url';
import 'stream';
import 'assert';
import 'tty';
import 'util';
import 'os';
import 'zlib';
import '../../../../../../index-d971362c.js';
import '../../../../../../article-7161d4ff.js';
import './translation.js';
import 'punycode';
import '@chaskiq/store';
import './collectionSections.js';
import '../../../../../../List-b299533f.js';
import './collections.js';
import './searchBar.js';
import './icons.js';

function MainLayout() {
  return /*#__PURE__*/React.createElement(BrowserRouter, null, /*#__PURE__*/React.createElement(Switch, null, /*#__PURE__*/React.createElement(Route, {
    path: '/:lang?(en|es)?',
    render: function render(props) {
      return /*#__PURE__*/React.createElement(Docs, props);
    }
  }), /*#__PURE__*/React.createElement(Route, {
    path: '/',
    render: function render(props) {
      return /*#__PURE__*/React.createElement(Docs, props);
    }
  }), /*#__PURE__*/React.createElement(Route, {
    render: function render(_props) {
      return /*#__PURE__*/React.createElement("p", null, "404 not found");
    }
  })));
}

export default MainLayout;
