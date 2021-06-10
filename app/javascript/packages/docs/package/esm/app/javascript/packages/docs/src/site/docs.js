import { _ as _taggedTemplateLiteral, a as _objectWithoutProperties, b as _extends, c as _slicedToArray, g as graphql, A as ARTICLE_SETTINGS, L as Link, R as Route, S as Switch } from '../../../../../../client-cac2f5b5.js';
import { R as React, r as react } from '../../../../../../index-ef03c8d2.js';
import { s as serializeStyles, n as newStyled, G as Global } from '../../../../../../index-d971362c.js';
import { C as CheckmarkIcon, L as LaunchIcon, a as LangGlobeIcon, A as Article } from '../../../../../../article-7161d4ff.js';
import CollectionsWithSections from './collectionSections.js';
import Collections from './collections.js';
import CustomizedInputBase from './searchBar.js';
import { Facebook, Twitter, LinkedIn } from './icons.js';
import 'http';
import 'https';
import 'url';
import 'stream';
import 'assert';
import 'tty';
import 'util';
import 'os';
import 'zlib';
import './translation.js';
import 'punycode';
import '@chaskiq/store';
import '../../../../../../List-b299533f.js';

// from https://usehooks.com/

function useOnClickOutside(ref, handler) {
  React.useEffect(function () {
    var listener = function listener(event) {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return function () {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, // Add ref and handler to effect dependencies
  // It's worth noting that because passed in handler is a new ...
  // ... function on every render that will cause this effect ...
  // ... callback/cleanup to run every render. It's not a big deal ...
  // ... but to optimize you can wrap handler in useCallback before ...
  // ... passing it into this hook.
  [ref, handler]);
}

function css() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return serializeStyles(args);
}

var _templateObject$1, _templateObject2;
// https://nystudio107.com/blog/using-tailwind-css-with-gatsby-react-emotion-styled-components
var BaseButton = newStyled.button(_templateObject$1 || (_templateObject$1 = _taggedTemplateLiteral(["\n  ", ";\n\n  ", "\n"])), function (props) {
  switch (props.variant) {
    case 'success':
      return {
        "outline": "2px solid transparent",
        "outlineOffset": "2px",
        "borderRadius": "0.375rem",
        "--tw-bg-opacity": "1",
        "backgroundColor": "rgba(52, 211, 153, var(--tw-bg-opacity))",
        "--tw-text-opacity": "1",
        "color": "rgba(255, 255, 255, var(--tw-text-opacity))",
        ":hover": {
          "--tw-bg-opacity": "1",
          "backgroundColor": "rgba(16, 185, 129, var(--tw-bg-opacity))"
        },
        ":focus": {
          "outline": "2px solid transparent",
          "outlineOffset": "2px",
          "--tw-border-opacity": "1",
          "borderColor": "rgba(4, 120, 87, var(--tw-border-opacity))",
          "--tw-shadow": "0 0 0 3px rgba(156, 163, 175, .5)",
          "boxShadow": "var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)"
        }
      };

    case 'flat':
      return {
        "display": "inline-flex",
        "alignItems": "center",
        "borderWidth": "1px",
        "borderColor": "transparent",
        "fontSize": "0.75rem",
        "lineHeight": "1rem",
        "fontWeight": "500",
        "borderRadius": "0.25rem",
        "--tw-text-opacity": "1",
        "color": "rgba(67, 56, 202, var(--tw-text-opacity))",
        "--tw-bg-opacity": "1",
        "backgroundColor": "rgba(224, 231, 255, var(--tw-bg-opacity))",
        ":hover": {
          "--tw-bg-opacity": "1",
          "backgroundColor": "rgba(199, 210, 254, var(--tw-bg-opacity))"
        },
        ":focus": {
          "outline": "2px solid transparent",
          "outlineOffset": "2px"
        }
      };

    case 'flat-dark':
      return {
        "display": "flex",
        "alignItems": "center",
        "borderWidth": "1px",
        "borderColor": "transparent",
        "borderRadius": "0.25rem",
        "--tw-text-opacity": "1",
        "color": "rgba(243, 244, 246, var(--tw-text-opacity))",
        "--tw-bg-opacity": "1",
        "backgroundColor": "rgba(17, 24, 39, var(--tw-bg-opacity))",
        ":hover": {
          "--tw-bg-opacity": "1",
          "backgroundColor": "rgba(31, 41, 55, var(--tw-bg-opacity))"
        },
        ":focus": {
          "outline": "2px solid transparent",
          "outlineOffset": "2px",
          "--tw-border-opacity": "1",
          "borderColor": "rgba(55, 65, 81, var(--tw-border-opacity))"
        },
        ":active": {
          "--tw-bg-opacity": "1",
          "backgroundColor": "rgba(31, 41, 55, var(--tw-bg-opacity))"
        }
      };

    case 'main':
      return {
        "outline": "2px solid transparent",
        "outlineOffset": "2px",
        "display": "inline-flex",
        "alignItems": "center",
        "borderWidth": "1px",
        "borderColor": "transparent",
        "borderRadius": "0.375rem",
        "--tw-text-opacity": "1",
        "color": "rgba(255, 255, 255, var(--tw-text-opacity))",
        "--tw-bg-opacity": "1",
        "backgroundColor": "rgba(79, 70, 229, var(--tw-bg-opacity))",
        ":hover": {
          "--tw-bg-opacity": "1",
          "backgroundColor": "rgba(99, 102, 241, var(--tw-bg-opacity))"
        },
        ":focus": {
          "outline": "2px solid transparent",
          "outlineOffset": "2px",
          "--tw-shadow": "0 0 0 3px rgba(156, 163, 175, .5)",
          "boxShadow": "var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)",
          "--tw-border-opacity": "1",
          "borderColor": "rgba(67, 56, 202, var(--tw-border-opacity))"
        },
        ":active": {
          "--tw-bg-opacity": "1",
          "backgroundColor": "rgba(67, 56, 202, var(--tw-bg-opacity))"
        }
      };

    case 'link':
      return {
        "display": "inline-flex",
        "--tw-text-opacity": "1",
        "color": "rgba(67, 56, 202, var(--tw-text-opacity))",
        ":hover": {
          "--tw-text-opacity": "1",
          "color": "rgba(49, 46, 129, var(--tw-text-opacity))"
        },
        "alignItems": "center"
      };

    case 'clean':
      return '';

    case 'outlined':
      return {
        "display": "inline-flex",
        "alignItems": "center",
        "justifyContent": "center",
        "paddingLeft": "1rem",
        "paddingRight": "1rem",
        "paddingTop": "0.5rem",
        "paddingBottom": "0.5rem",
        "borderWidth": "1px",
        "--tw-border-opacity": "1",
        "borderColor": "rgba(209, 213, 219, var(--tw-border-opacity))",
        "--tw-shadow": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "boxShadow": "var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)",
        "fontSize": "0.875rem",
        "lineHeight": "1.25rem",
        "fontWeight": "500",
        "borderRadius": "0.375rem",
        "--tw-text-opacity": "1",
        "color": "rgba(55, 65, 81, var(--tw-text-opacity))",
        ".dark &": {
          "--tw-bg-opacity": "1",
          "backgroundColor": "rgba(0, 0, 0, var(--tw-bg-opacity))",
          "--tw-text-opacity": "1",
          "color": "rgba(243, 244, 246, var(--tw-text-opacity))",
          ":hover": {
            "--tw-bg-opacity": "1",
            "backgroundColor": "rgba(17, 24, 39, var(--tw-bg-opacity))"
          }
        },
        "--tw-bg-opacity": "1",
        "backgroundColor": "rgba(255, 255, 255, var(--tw-bg-opacity))",
        ":hover": {
          "--tw-bg-opacity": "1",
          "backgroundColor": "rgba(249, 250, 251, var(--tw-bg-opacity))"
        },
        ":focus": {
          "outline": "2px solid transparent",
          "outlineOffset": "2px",
          "--tw-ring-offset-shadow": "var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)",
          "--tw-ring-shadow": "var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color)",
          "boxShadow": "var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000)",
          "--tw-ring-offset-width": "2px",
          "--tw-ring-opacity": "1",
          "--tw-ring-color": "rgba(236, 72, 153, var(--tw-ring-opacity))"
        }
      };

    case 'outlined-transparent':
      return {
        "display": "inline-flex",
        "alignItems": "center",
        "justifyContent": "center",
        "paddingLeft": "1rem",
        "paddingRight": "1rem",
        "paddingTop": "0.5rem",
        "paddingBottom": "0.5rem",
        "borderWidth": "1px",
        "--tw-border-opacity": "1",
        "borderColor": "rgba(17, 24, 39, var(--tw-border-opacity))",
        "--tw-shadow": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "boxShadow": "var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)",
        "fontSize": "0.875rem",
        "lineHeight": "1.25rem",
        "fontWeight": "500",
        "borderRadius": "0.375rem",
        "--tw-text-opacity": "1",
        "color": "rgba(243, 244, 246, var(--tw-text-opacity))",
        "backgroundColor": "transparent",
        ":hover": {
          "--tw-text-opacity": "1",
          "color": "rgba(31, 41, 55, var(--tw-text-opacity))"
        },
        ":focus": {
          "outline": "2px solid transparent",
          "outlineOffset": "2px",
          "--tw-ring-offset-shadow": "var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)",
          "--tw-ring-shadow": "var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color)",
          "boxShadow": "var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000)",
          "--tw-ring-offset-width": "2px",
          "--tw-ring-opacity": "1",
          "--tw-ring-color": "rgba(236, 72, 153, var(--tw-ring-opacity))"
        }
      };

    case 'icon':
      return {
        "outline": "2px solid transparent",
        "outlineOffset": "2px",
        "borderRadius": "9999px",
        "padding": "0.25rem",
        "backgroundColor": "transparent",
        ":hover": {
          "--tw-text-opacity": "1",
          "color": "rgba(156, 163, 175, var(--tw-text-opacity))"
        }
      };

    case 'danger':
      return {
        "outline": "2px solid transparent",
        "outlineOffset": "2px",
        "borderRadius": "0.25rem",
        "--tw-bg-opacity": "1",
        "backgroundColor": "rgba(248, 113, 113, var(--tw-bg-opacity))",
        "--tw-text-opacity": "1",
        "color": "rgba(255, 255, 255, var(--tw-text-opacity))",
        ":hover": {
          "--tw-bg-opacity": "1",
          "backgroundColor": "rgba(239, 68, 68, var(--tw-bg-opacity))"
        },
        ":focus": {
          "outline": "2px solid transparent",
          "outlineOffset": "2px",
          "--tw-border-opacity": "1",
          "borderColor": "rgba(185, 28, 28, var(--tw-border-opacity))",
          "--tw-shadow": "0 0 0 3px rgba(156, 163, 175, .5)",
          "boxShadow": "var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)"
        }
      };

    default:
      return {
        "display": "flex",
        "flexWrap": "wrap",
        "alignItems": "center",
        "borderRadius": "0.25rem",
        "borderWidth": "1px",
        "borderColor": "transparent",
        "--tw-text-opacity": "1",
        "color": "rgba(67, 56, 202, var(--tw-text-opacity))",
        ".dark &": {
          "--tw-bg-opacity": "1",
          "backgroundColor": "rgba(255, 255, 255, var(--tw-bg-opacity))",
          "--tw-text-opacity": "1",
          "color": "rgba(17, 24, 39, var(--tw-text-opacity))",
          ":hover": {
            "--tw-text-opacity": "1",
            "color": "rgba(75, 85, 99, var(--tw-text-opacity))",
            "--tw-bg-opacity": "1",
            "backgroundColor": "rgba(229, 231, 235, var(--tw-bg-opacity))"
          }
        },
        "--tw-bg-opacity": "1",
        "backgroundColor": "rgba(224, 231, 255, var(--tw-bg-opacity))",
        ":hover": {
          "--tw-bg-opacity": "1",
          "backgroundColor": "rgba(199, 210, 254, var(--tw-bg-opacity))"
        },
        ":focus": {
          "outline": "2px solid transparent",
          "outlineOffset": "2px",
          "--tw-border-opacity": "1",
          "borderColor": "rgba(165, 180, 252, var(--tw-border-opacity))"
        },
        ":active": {
          "--tw-bg-opacity": "1",
          "backgroundColor": "rgba(199, 210, 254, var(--tw-bg-opacity))"
        }
      };
  }
}, function (props) {
  switch (props.border) {
    case true:
      return {
        "borderWidth": "1px"
      };

    default:
      return '';
  }
});
var SizeButton = newStyled(BaseButton)(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n  ", ";\n"])), function (props) {
  switch (props.size) {
    case 'xs':
      return {
        "paddingLeft": "0.5rem",
        "paddingRight": "0.5rem",
        "paddingTop": "0.25rem",
        "paddingBottom": "0.25rem",
        "fontSize": "0.75rem",
        "lineHeight": "1rem",
        "fontWeight": "500"
      };

    case 'sm':
    case 'small':
      return {
        "paddingLeft": "0.625rem",
        "paddingRight": "0.625rem",
        "paddingTop": "0.375rem",
        "paddingBottom": "0.375rem",
        "fontSize": "0.75rem",
        "lineHeight": "1rem"
      };

    case 'md':
    case 'medium':
      return {
        "paddingLeft": "1rem",
        "paddingRight": "1rem",
        "paddingTop": "0.5rem",
        "paddingBottom": "0.5rem",
        "fontSize": "0.875rem",
        "lineHeight": "1.75rem",
        "fontWeight": "500",
        "textTransform": "uppercase"
      };

    case 'lg':
    case 'large':
      return {
        "paddingLeft": "2rem",
        "paddingRight": "2rem",
        "paddingTop": "1rem",
        "paddingBottom": "1rem",
        "fontSize": "1.25rem",
        "lineHeight": "1.75rem",
        "fontWeight": "300",
        "textTransform": "uppercase"
      };

    default:
      // const isIcon = props.variant === "icon" ? 'p-1' : 'px-2 py-1'
      if (props.variant === 'icon') {
        return {
          "padding": "0.25rem"
        };
      } else {
        return {
          "paddingLeft": "0.5rem",
          "paddingRight": "0.5rem",
          "paddingTop": "0.25rem",
          "paddingBottom": "0.25rem",
          "fontSize": "0.875rem",
          "lineHeight": "1.75rem",
          "fontWeight": "500"
        };
      }

  }
});
function Button(_ref) {
  var children = _ref.children,
      className = _ref.className,
      buttonProps = _objectWithoutProperties(_ref, ["children", "className"]);

  return /*#__PURE__*/React.createElement(SizeButton, _extends({
    className: "transition duration-150 ease-in-out ".concat(className || '') // className="px-2 py-1 rounded-lg bg-green-400 text-green-800 text-xl font-light uppercase shadow-md hover:shadow-lg"

  }, buttonProps), children);
}

function Dropdown(_ref) {
  var children = _ref.children,
      labelButton = _ref.labelButton,
      triggerButton = _ref.triggerButton,
      isOpen = _ref.isOpen,
      position = _ref.position,
      origin = _ref.origin,
      onOpen = _ref.onOpen;

  var _React$useState = React.useState(isOpen),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      open = _React$useState2[0],
      setOpen = _React$useState2[1];

  var ref = React.useRef();
  useOnClickOutside(ref, function () {
    return setOpen(false);
  });
  react.exports.useEffect(function () {
    setOpen(isOpen);
  }, [isOpen]);
  react.exports.useEffect(function () {
    onOpen && onOpen(open);
  }, [open]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: 'relative inline-block text-left'
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex"
  }, triggerButton ? triggerButton(function () {
    return setOpen(!open);
  }) : /*#__PURE__*/React.createElement("span", {
    className: "rounded-md shadow-sm dark:text-gray-100 dark:bg-gray-800"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outlined",
    onClick: function onClick() {
      return setOpen(!open);
    }
  }, labelButton, /*#__PURE__*/React.createElement("svg", {
    className: "-mr-1 ml-2 h-5 w-5",
    fill: "currentColor",
    viewBox: "0 0 20 20"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z",
    clipRule: "evenodd"
  }))))), open && /*#__PURE__*/React.createElement("div", {
    className: "z-50 origin-top-right absolute \n            ".concat(position || 'left', "-0\n            ").concat(origin || '', "\n             mt-2 w-56 rounded-md shadow-lg")
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-md bg-white dark:bg-gray-900 dark:text-gray-100 shadow-xs"
  }, children))));
}

function FilterMenu(_ref) {
  var filterHandler = _ref.filterHandler,
      value = _ref.value,
      triggerButton = _ref.triggerButton,
      options = _ref.options,
      position = _ref.position,
      origin = _ref.origin;

  var _React$useState = React.useState(false),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      open = _React$useState2[0],
      setOpen = _React$useState2[1];

  function selectOption(option) {
    filterHandler(option, handleClose);
  }

  function handleClose() {
    setOpen(false);
  }

  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Dropdown, {
    id: "long-menu",
    labelButton: value,
    triggerButton: triggerButton,
    position: position,
    origin: origin,
    isOpen: open
  }, options.map(function (option) {
    return /*#__PURE__*/React.createElement("div", {
      className: "py-1",
      key: "filter-menu-".concat(option.id)
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return selectOption(option);
      },
      className: "w-full group flex items-center\n              px-4 py-2 text-sm leading-5 text-gray-700\n              ".concat(value === option.name ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 ' : '', "\n              hover:bg-gray-100 hover:text-gray-900\n              focus:outline-none focus:bg-gray-100\n              focus:text-gray-900\n              dark:hover:bg-gray-700 dark:hover:text-gray-100\n              dark:focus:bg-gray-800\n              ")
    }, option.state === 'checked' && /*#__PURE__*/React.createElement("div", {
      className: "text-sm text-green-500"
    }, /*#__PURE__*/React.createElement(CheckmarkIcon, null)), option.icon && /*#__PURE__*/React.createElement("icon", null, option.icon), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col justify-between ml-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-bold self-start dark:text-gray-100"
    }, option.name || option.title), option.description && /*#__PURE__*/React.createElement("span", {
      className: "text-xs text-left dark:text-gray-300"
    }, option.description))));
  })));
}

var dante_font_family_sans = 'inherit'; // `'jaf-bernino-sans', 'Open Sans', "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Geneva, Verdana, sans_serif;`;

var dante_font_family_serif = 'inherit'; // `'freight-text-pro', 'Merriweather', Georgia, Cambria, "Times New Roman", Times, serif;`;

var dante_font_family_mono = 'inherit'; // `Menlo, Monaco, Consolas, "Courier New", "Courier", monospace;`;

var tooltip_size = '32px';
var dante_control_color = '#333333';
var dante_inversed_color = '#FFFFFF';
var dante_accent_color = '#5BD974';
var dante_text_color = '#4a4a4a';
var fontSize = '1rem';
var theme = {
  dante_font_family_serif: dante_font_family_serif,
  dante_font_family_sans: dante_font_family_sans,
  dante_font_family_mono: dante_font_family_mono,
  dante_font_family_base: dante_font_family_sans,
  dante_editor_font_size: fontSize,
  // Editor
  // dante_editor_font_size: '1rem',
  dante_editor_line_height: '1.9',
  dante_font_family_sans_serif: 'comic-sans',
  dante_visual_debugger: 'false',
  dante_text_color: dante_text_color,
  dante_inversed_color: dante_inversed_color,
  dante_accent_color: dante_accent_color,
  dante_control_color: dante_control_color,
  dante_popover_color: dante_inversed_color,
  // dante_font_size_base:  '24px',
  // line_height_base:     '1.428571429', // 20/14
  tooltip_color: '#999',
  tooltip_background_color: 'transparent',
  tooltip_border_color: '#999',
  tooltip_color_opacity: '0.44',
  tooltip_color_opacity_hover: '0.9',
  tooltip_background_opacity: '0',
  tooltip_border_width: '1px',
  tooltip_border_radius: '999em',
  tooltip_caret_size: '12px',
  menu_tone: '#444',
  //tooltip_size: '32px',
  tooltip_button_spacing: '9px',
  tooltip_menu_spacing: '22px',
  tooltip_items: 10,
  // Fix this and remove it
  tooltip_item_delay: 30,
  tooltip_size: tooltip_size,
  tooltip_line_height: tooltip_size,
  tooltip_default_transition: '100ms border-color, 100ms color',
  tooltip_forward_transition: 'transform 100ms',
  tooltip_backward_transition: 'transform 250ms',
  dante_code_background: '#000',
  dante_code_color: '#fff',
  // Menu
  // background: #2A2B32;
  dante_menu_height: '42px',
  dante_menu_background: dante_control_color,
  dante_menu_color: dante_inversed_color,
  dante_menu_border_radius: '4px',
  dante_menu_box_shadow: '1px 1px 3px 0px #9e9393',
  dante_menu_icon_size: '16px',
  dante_menu_icon_color: dante_inversed_color,
  dante_menu_icon_accent: dante_accent_color,
  dante_menu_divider_color: '#3D3E49',
  dante_menu_border_width: '0px',
  dante_menu_border_color: 'none',
  dante_menu_caret_size: '8px'
};

var _templateObject;
var subdomain = window.location.host.split('.')[1] ? window.location.host.split('.')[0] : false;

function Docs(props) {
  // const classes = useStyles();
  var _React$useState = React.useState({}),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      settings = _React$useState2[0],
      setSettings = _React$useState2[1];

  var _React$useState3 = React.useState(props.match.params.lang || 'en'),
      _React$useState4 = _slicedToArray(_React$useState3, 2),
      lang = _React$useState4[0],
      setLang = _React$useState4[1];

  var _React$useState5 = React.useState(false),
      _React$useState6 = _slicedToArray(_React$useState5, 2),
      error = _React$useState6[0];
      _React$useState6[1];

  var history = props.history;
  React.useEffect(function () {
    getSettings();
  }, [lang]);

  function getSettings() {
    graphql(ARTICLE_SETTINGS, {
      domain: subdomain,
      lang: props.match.params.lang
    }, {
      success: function success(data) {
        setSettings(data.helpCenter);
      },
      error: function error() {}
    });
  }

  function handleLangChange(option) {
    setLang(option.id);
    history.push("/".concat(option.id));
  }

  var newDanteTheme = Object.assign({}, theme, {
    mainColor: settings.color
  });
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Global, {
    styles: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n          a {\n            color: ", " !important;\n          }\n        "])), settings.color)
  }), /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("div", {
    className: "bg-black" // className={'classes.heroContent'}
    ,
    style: {
      backgroundImage: "url('".concat(settings.headerImageLarge, "')")
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg:px-40 px-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between py-2 md:mx-24 md:px-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Link, {
    to: "/".concat(lang)
  }, /*#__PURE__*/React.createElement("img", {
    src: settings.logo,
    className: 'h-10 md:h-16'
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: 'flex items-center space-between'
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outlined-transparent",
    className: 'mr-2',
    color: 'primary',
    onClick: function onClick(_e) {
      return window.location = settings.website;
    }
  }, /*#__PURE__*/React.createElement(LaunchIcon, null), ' Go to', " ", settings.siteTitle), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("hr", {
    className: 'classes.hr'
  })), settings.availableLanguages && /*#__PURE__*/React.createElement(FilterMenu, {
    icon: LangGlobeIcon,
    options: settings.availableLanguages.map(function (o) {
      return {
        name: o,
        id: o
      };
    }),
    value: lang,
    filterHandler: handleLangChange,
    buttonVariant: 'outlined-transparent',
    position: 'right' // triggerButton={this.toggleButton}

  })))), /*#__PURE__*/React.createElement(Route, {
    render: function render(props) {
      return /*#__PURE__*/React.createElement(CustomizedInputBase, _extends({
        lang: lang,
        settings: settings
      }, props, {
        subdomain: subdomain
      }));
    }
  }))), error ? /*#__PURE__*/React.createElement("p", null, "ERROR!") : null, /*#__PURE__*/React.createElement(Switch, null, /*#__PURE__*/React.createElement(Route, {
    exact: true,
    path: "".concat(props.match.url, "/articles/:id"),
    render: function render(props) {
      return /*#__PURE__*/React.createElement(Article, _extends({}, props, {
        lang: lang,
        subdomain: subdomain,
        theme: newDanteTheme
      }));
    }
  }), /*#__PURE__*/React.createElement(Route, {
    exact: true,
    path: "".concat(props.match.url, "/collections/:id"),
    render: function render(props) {
      return /*#__PURE__*/React.createElement(CollectionsWithSections, _extends({}, props, {
        lang: lang,
        subdomain: subdomain
      }));
    }
  }), /*#__PURE__*/React.createElement(Route, {
    exact: true,
    path: "".concat(props.match.url),
    render: function render(props) {
      return /*#__PURE__*/React.createElement(Collections, _extends({}, props, {
        lang: lang,
        subdomain: subdomain
      }));
    }
  }))), /*#__PURE__*/React.createElement("footer", {
    className: 'py-8'
  }, settings.siteTitle && /*#__PURE__*/React.createElement("p", {
    className: "mt-2 leading-6 text-gray-500 text-center"
  }, settings.siteTitle), settings.siteDescription && /*#__PURE__*/React.createElement("p", {
    className: "mt-2 text-sm text-gray-400 text-center"
  }, settings.siteDescription), /*#__PURE__*/React.createElement("div", {
    className: "py-8 flex flex-row justify-evenly items-baseline text-gray-500"
  }, settings.facebook && /*#__PURE__*/React.createElement("a", {
    href: "http://facebook.com/".concat(settings.facebook)
  }, /*#__PURE__*/React.createElement(Facebook, null)), settings.twitter && /*#__PURE__*/React.createElement("a", {
    href: "http://twitter.com/".concat(settings.twitter)
  }, /*#__PURE__*/React.createElement(Twitter, null)), settings.linkedin && /*#__PURE__*/React.createElement("a", {
    href: "http://instagram.com/".concat(settings.linkedin)
  }, /*#__PURE__*/React.createElement(LinkedIn, null))), /*#__PURE__*/React.createElement(MadeWithLove, null))));
}

function MadeWithLove() {
  return /*#__PURE__*/React.createElement("p", {
    className: "text-center text-xs leading-5 text-gray-400"
  }, 'powered by ', /*#__PURE__*/React.createElement("a", {
    href: "https://chaskiq.io/"
  }, "Chaskiq"));
}

export default Docs;
