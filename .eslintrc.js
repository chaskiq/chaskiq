module.exports = {
  env: {
    browser: true,
    es6: true
  },
  parser: "babel-eslint",
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: [
    'react',
    'unused-imports',
  ],
  "globals": {
      "I18n": "readonly",
      "Paddle": "readonly",
      "mapboxgl": "readonly"
  },
  "rules": {
    "react/jsx-no-duplicate-props": "off",
    "react/jsx-no-duplicate": "off",
    "react/display-name": "off",
    "no-fallthrough": "off",
    "no-case-declarations": "off",
    "brace-style": [2, "1tbs", { "allowSingleLine": true }],
		"no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
		"unused-imports/no-unused-imports": "error",
		"unused-imports/no-unused-vars": [
			"warn",
			{ "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }
		],
    "react/prop-types": 0
	}

  /*"overrides": [
    {
      "files": ['./app/javascript/*.js'],
      "excludedFiles": "./app/javascript/src/graphql/*.js",
      "rules": {
        "quotes": ["error", "single"]
      }
    }
  ]*/
}
