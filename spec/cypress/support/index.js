// CypressOnRails: dont remove these command


// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
// import './commands'
// import './on-rails'
import 'cypress-xpath'

Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('500')) {
    console.error('Caught an exception with 500 status code', err);
    return false;
  }
});

Cypress.Commands.add('appCommands', function (body) {
  Object.keys(body).forEach(key => body[key] === undefined ? delete body[key] : {});
  const log = Cypress.log({ name: "APP", message: body, autoEnd: false })
  return cy.request({
    method: 'POST',
    url: "/__e2e__/command",
    body: JSON.stringify(body),
    log: false,
    failOnStatusCode: false
  }).then((response) => {
    log.end();
    if (response.status !== 201) {
      expect(response.body.message).to.equal('')
      expect(response.status).to.be.equal(201)
    }
    return response.body
  });
});

Cypress.Commands.add('app', function (name, command_options) {
  return cy.appCommands({name: name, options: command_options}).then((body) => {
    return body[0]
  });
});

Cypress.Commands.add('appScenario', function (name, options = {}) {
  return cy.app('scenarios/' + name, options)
});

Cypress.Commands.add('appEval', function (code) {
  return cy.app('eval', code)
});

Cypress.Commands.add('appFactories', function (options) {
  return cy.app('factory_bot', options)
});

Cypress.Commands.add('appFixtures', function (options) {
  cy.app('activerecord_fixtures', options)
});
// CypressOnRails: end

// The next is optional
// beforeEach(() => {
//  cy.app('clean') // have a look at cypress/app_commands/clean.rb
// });

// comment this out if you do not want to attempt to log additional info on test fail
Cypress.on('fail', (err, runnable) => {
  // allow app to generate additional logging data
  Cypress.$.ajax({
    url: '/__e2e__/command',
    data: JSON.stringify({name: 'log_fail', options: {error_message: err.message, runnable_full_title: runnable.fullTitle() }}),
    async: false,
    method: 'POST'
  });

  throw err;
});



// The next is optional
beforeEach(() => {
  cy.app('clean') // have a look at cypress/app_commands/clean.rb
})

// comment this out if you do not want to attempt to log additional info on test fail
Cypress.on('fail', (err, runnable) => {
  // allow app to generate additional logging data
  /*Cypress.$.ajax({
    url: '/__e2e__/command',
    data: JSON.stringify({
      name: 'log_fail',
      options: {
        error_message: err.message,
        runnable_full_title: runnable.fullTitle()
      }
    }),
    async: false,
    method: 'POST'
  })*/

  console.error('Caught an exception with 500 status code', err);

  throw err
})


// UTILS js

export function translations () {
  cy.appEval(`App.last.update({
    greetings_es: "Hola amigo", 
    greetings_en: "hello friend",

    intro_en: "we are here to help",
    intro_es: "somos un equipo genial",

    tagline_es: "estamos aqui para ayudarte",
    tagline_en: "we are an awesome team"
  })`)
}

export function openMessenger (cb, options, sessionless) {
  cy.appEval('App.last').then((results) => {
    const appKey = results.key
    const params = options.params
    let urlParams = params
    if (sessionless) {
      urlParams = Object.assign(
        urlParams, {}, { sessionless: sessionless }
      )
    }

    cy.visit(`/tester/${appKey}`, { qs: urlParams, headers: options.headers || {} })
      .then(() => {
        cy.get('iframe:first')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            cy.wrap($body).find('#chaskiq-prime').click()
          })

        cy.get('iframe:first')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            cb($body, appKey)
          })
      })
  })
}

export function openNewMessenger (cb, options, sessionless) {
  cy.appEval('App.last').then((results) => {
    const appKey = results.key
    const params = options.params
    let urlParams = params
    if (sessionless) {
      urlParams = Object.assign(
        urlParams, {}, { sessionless: sessionless }
      )
    }

    cy.visit(`/tester/${appKey}`, { qs: urlParams, headers: options.headers || {} })
      .then(() => {
        cy.wait(500)
        cy.get('#chaskiq-prime').click().then(()=>{
          cy.get('iframe:first')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            cb($body, appKey)
          })
        })
      })
  })
}

export function login () {
  cy.appScenario('basic')
  cy.visit('/')
  cy.contains('Connect')

  cy.wait(1000)

  cy.get('input[type="email"]')
    .type('test@test.cl').should('have.value', 'test@test.cl')

  cy.get('input[type="password"]')
    .type('123456').should('have.value', '123456')

  cy.get('button[data-cy="connect"]').click()

  cy.get('body').should('contain', 'Welcome to')
}

export function findButtonByName (name) {
  return cy.get('button').contains(name)
}

export function findElementByName (element, name) {
  return cy.get(element).contains(name)
}

export function findLinkByName (name) {
  return cy.get('a').contains(name)
}

export const getIframeDocument = (iframe) => {
  return cy
    .get(iframe)
  // Cypress yields jQuery element, which has the real
  // DOM element under property "0".
  // From the real DOM iframe element we can get
  // the "document" element, it is stored in "contentDocument" property
  // Cypress "its" command can access deep properties using dot notation
  // https://on.cypress.io/its
    .its('0.contentDocument').should('exist')
}

export const getIframeBody = (iframe) => {
  // get the document
  return getIframeDocument(iframe)
  // automatically retries until body is loaded
    .its('body').should('not.be.undefined')
  // wraps "body" DOM element to allow
  // chaining more Cypress commands, like ".find(...)"
    .then(cy.wrap)
}




// Alternatively you can use CommonJS syntax:
// require('./commands')

const resizeObserverLoopErrRe = /^ResizeObserver loop limit exceeded/

/*
Cypress.on('uncaught:exception', (err) => {
  if (resizeObserverLoopErrRe.test(err.message)) {
    // returning false here prevents Cypress from
    // failing the test
    return false
  }
}) */

Cypress.on('uncaught:exception', (err, runnable) => {
  return false
})
