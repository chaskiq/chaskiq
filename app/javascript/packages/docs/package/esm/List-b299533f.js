import { R as React } from './index-ef03c8d2.js';

function List(_ref) {
  var children = _ref.children,
      shadowless = _ref.shadowless;
  return /*#__PURE__*/React.createElement("div", {
    className: "\n      bg-white \n      ".concat(shadowless ? '' : 'shadow', " \n      overflow-hidden sm:rounded-md")
  }, /*#__PURE__*/React.createElement("ul", null, children));
}
function ListItem(_ref2) {
  var avatar = _ref2.avatar,
      action = _ref2.action,
      children = _ref2.children,
      onClick = _ref2.onClick,
      divider = _ref2.divider;
  var clicableClasses = onClick && 'cursor-pointer';
  return /*#__PURE__*/React.createElement("li", {
    className: "".concat(divider ? 'border-b dark:border-gray-800' : '')
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClick && onClick,
    className: "".concat(clicableClasses, " block\n        hover:bg-gray-100\n        dark:bg-black\n        dark:hover:bg-gray-900\n        dark:focus:bg-gray-800\n        focus:outline-none focus:bg-gray-200 transition duration-150\n        ease-in-out")
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center px-4 py-4 sm:px-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "min-w-0 flex-1 flex items-center"
  }, avatar && avatar, children), action && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("svg", {
    className: "h-5 w-5 text-gray-400",
    fill: "currentColor",
    viewBox: "0 0 20 20"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z",
    clipRule: "evenodd"
  }))))));
}
function ListItemText(_ref3) {
  var primary = _ref3.primary,
      secondary = _ref3.secondary,
      terciary = _ref3.terciary,
      cols = _ref3.cols;
  var colsMd = cols ? cols : 2;
  return /*#__PURE__*/React.createElement("div", {
    className: "min-w-0 flex-1 px-4 md:grid md:grid-cols-".concat(colsMd, " md:gap-4")
  }, /*#__PURE__*/React.createElement("div", null, primary && primary, secondary && secondary), /*#__PURE__*/React.createElement("div", {
    className: "hidden md:block"
  }, /*#__PURE__*/React.createElement("div", null, terciary && terciary)));
}

export { List as L, ListItem as a, ListItemText as b };
