import { defineConfig } from 'cypress'

export default defineConfig({
  animationDistanceThreshold: 5,
  blockHosts: null,
  chromeWebSecurity: true,
  defaultCommandTimeout: 15000,
  env: {},
  execTimeout: 16000,
  failOnStatusCode: false,
  fileServerFolder: '',
  fixturesFolder: './spec/cypress/fixtures',
  hosts: null,
  modifyObstructiveCode: true,
  numTestsKeptInMemory: 50,
  pageLoadTimeout: 16000,
  port: null,
  projectId: 'j4kaht',
  reporter: 'spec',
  reporterOptions: null,
  requestTimeout: 20000,
  responseTimeout: 30000,
  screenshotsFolder: './spec/cypress/screenshots',
  taskTimeout: 15000,
  trashAssetsBeforeRuns: true,
  userAgent: null,
  video: true,
  videoCompression: 32,
  videoUploadOnPasses: true,
  videosFolder: './spec/cypress/videos',
  viewportHeight: 660,
  viewportWidth: 1000,
  waitForAnimations: true,
  watchForFileChanges: true,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./spec/cypress/plugins')(on, config)
    },
    specPattern: './spec/cypress/integration//**/*.*',
    baseUrl: 'http://localhost:5002',
    excludeSpecPattern: '*.hot-update.js',
    supportFile: './spec/cypress/support',
  },
})