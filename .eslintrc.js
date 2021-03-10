module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'plugin:react/recommended',
    'standard'
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
  rules: {
    "no-unused-vars": "off",
    "unused-imports/no-unused-imports": 2,
    "unused-imports/no-unused-vars": 1,
    "react/prop-types": 0
  },

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
