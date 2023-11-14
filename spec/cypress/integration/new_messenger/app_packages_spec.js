import {
  translations,
  getIframeBody
} from '../../support'

function addHomeApp (namespace, definitions) {
  cy.appEval(`App.last.update(
    ${namespace}: ${definitions}
  )`)
}

function addAppPackage (app_package) {
  /* app = find_app(app_key)
  app_package = AppPackage.find_by(name: app_package)
  integration = app.app_package_integrations.new(params.permit!)
  integration.app_package = app_package
  integration.save */

  cy.appEval(`
    # require 'app_packages_catalog'
    # AppPackagesCatalog.update_all(dev_packages: true)
    Plugin.restore_plugins_from_fs

  `)

  cy.appEval(`
    app = App.first
    app_package = AppPackage.find_by(name: "${app_package}")
    integration = app.app_package_integrations.new()
    integration.app_package = app_package
    integration.save
  `)
}

function addAppPackageToHome (namespace, app_package, params) {
  cy.appEval(`
    app = App.first
    integration = app.app_package_integrations.first
    integration

    App.last.update(
      ${namespace}: [integration.as_json.merge(${params})]
    )
  `)
}

describe('Visitor home apps', function () {
  beforeEach(() => {
    cy.appEval('ActiveJob::Base.queue_adapter = :test')
    cy.appEval('ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true')
  })

  it('user session home app', function () {
    cy.appScenario('basic')

    addHomeApp('user_home_apps', `[
      {"definitions"=>[
        {"type"=>"separator"},
        {"type"=>"text", "style"=>"header", "text"=>"hola!"},
        {"type"=>"separator"},
        {"type"=>"list", "disabled"=>false,
        "items"=>[
          {
            "type"=>"item",
            "id"=>"list-item-1",
            "title"=>"Welcome to Chaskiq mr user",
            "subtitle"=>"Chaskiq is a 100 open source conversational platform for sales & support",
            "image"=>"http://app.chaskiq.test:3000/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBYzg9IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--bd639808dc87cfad87bef06c9838a40a562cd3e5/foo-1599423116.jpg",
            "action"=>{ "type"=>"url", "url"=>"https://chaskiq.io" }
          }
        ]
      }],
        "id"=>"3", "name"=>"ContentShowcase"}
      ]`)

    translations()

    cy.appEval('App.last').then((results) => {
      const appKey = results.key

      cy.visit(`/tester/${appKey}`)
        .then(() => {
          /*cy.get('iframe:first')
            .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              cy.wrap($body).find('#chaskiq-prime').click()
            })*/

          cy.get('#chaskiq-prime').click().then(() => {
            cy.get('iframe:first')
              .then(function ($iframe) {
                const $body = $iframe.contents().find('body')
                expect($body.html()).to.contain('Welcome to Chaskiq mr user')
              })
          })
        })
    })
  })

  it('sessionless home app', function () {
    cy.appScenario('basic')

    addHomeApp('visitor_home_apps', `[
      {"definitions"=>[
        {"type"=>"separator"},
        {"type"=>"text", "style"=>"header", "text"=>"hola!"},
        {"type"=>"separator"},
        {"type"=>"list", "disabled"=>false,
        "items"=>[
          {
            "type"=>"item",
            "id"=>"list-item-1",
            "title"=>"Welcome to Chaskiq mr anonimous",
            "subtitle"=>"Chaskiq is a 100 open source conversational platform for sales & support",
            "image"=>"http://app.chaskiq.test:3000/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBYzg9IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--bd639808dc87cfad87bef06c9838a40a562cd3e5/foo-1599423116.jpg",
            "action"=>{ "type"=>"url", "url"=>"https://chaskiq.io" }
          }
        ]
      }],
        "id"=>"3", "name"=>"ContentShowcase"}
      ]`)

    translations()

    cy.appEval('App.last').then((results) => {
      const appKey = results.key

      cy.visit(`/tester/${appKey}?sessionless=true`)
        .then(() => {
          cy.get('#chaskiq-prime').click().then(() => {
            cy.get('iframe:first')
              .then(function ($iframe) {
                const $body = $iframe.contents().find('body')
                expect($body.html()).to.contain('Welcome to Chaskiq mr anonimous')
              })
          })
        })
    })
  })

  it('add package, test click', function () {
    cy.appScenario('basic')

    addAppPackage('UiCatalog')
    addAppPackageToHome('visitor_home_apps', 'UiCatalog', `{
      name: "UiCatalog",
      definitions: [
        {
          name: 'bubu',
          label: 'Click this action',
          type: 'button',
          action: {
            type: "submit"
          }
        }
      ]
    }`)

    translations()

    cy.appEval('App.last').then((results) => {
      const appKey = results.key

      cy.visit(`/tester/${appKey}?sessionless=true`)
        .then(() => {
          cy.wait(3000)
          cy.get("#chaskiq-prime").click().then(() => {
            cy.get('iframe:first')
              .then(function ($iframe) {
                let $body = $iframe.contents().find('body')
                cy.wait(2000)
                cy.wrap($body).contains('Click this action').click({force: true})
                cy.wrap($body).contains('yes!!!!!')
              })
          })
        })
    })
  })

  it('add package, test content', function () {
    cy.appScenario('basic')
    addAppPackage('UiCatalog')
    addAppPackageToHome('visitor_home_apps', 'UiCatalog', `{
      name: "UiCatalog",
      definitions: [
        {
          id: 'oli',
          name: 'bubu',
          label: 'Click this action',
          type: 'button',
          action: {
            type: "content",
            content_url: "/internal/ui_catalog"
          }
        }
      ]
    }`)

    translations()

    cy.appEval('App.last').then((results) => {
      const appKey = results.key

      cy.visit(`/tester/${appKey}?sessionless=true`)
        .then(() => {
          cy.wait(2000)
          cy.get('#chaskiq-prime').click().then(() => {
            cy.get('iframe:first')
              .then(function ($iframe) {
                let $body = $iframe.contents().find('body')
                cy.wait(3000)
                cy.wrap($body).contains('Click this action').click() //({force: true})
                cy.wrap($body).contains('dynamic').click() //{force: true})
                cy.wrap($body).contains('yes!!!!!')
              })
          })
        })
    })
  })

  it('add package, frame 1', function () {
    cy.appScenario('basic')

    addAppPackage('UiCatalog')
    addAppPackageToHome('visitor_home_apps', 'UiCatalog', `{
      name: "UiCatalog",
      definitions: [
        {
          id: 'da',
          name: 'bubu',
          label: 'Click this action',
          type: 'button',
          action: {
            type: "content",
            content_url: "/internal/ui_catalog"
          }
        },
        {
          type: "list",
          disabled: false,
          items: [
            {
              "type": "item",
              "id": "slug",
              "title": 'a title',
              "subtitle": 'subtitle',
              action: {
                type: "frame",
                url: "/package_iframe_internal/UiCatalog"
              }
            }
          ]
        }
      ]
    }`)

    translations()

    cy.appEval('App.last').then((results) => {
      const appKey = results.key

      cy.visit(`/tester/${appKey}?sessionless=true`)
      cy.wait(2000)
      cy.get('#chaskiq-prime').click().then(() => {
        getIframeBody('iframe:first').xpath(
          '/html/body/div/div/div/div[2]/div[1]/div[1]/div/div[2]/div/div/form/fieldset/div[2]/div'
        ).click()

        cy.wait(2000)
        getIframeBody('iframe:first')
          .find('#package-frame')
          .its('0.contentDocument').should('exist')
          .its('body').should('not.be.undefined')
          .then(($iframe) => {
            cy.wrap($iframe).contains('my friend')
          })
      })
    })
  })

  it('add package, frame', function () {
    cy.appScenario('basic')

    addAppPackage('UiCatalog')
    addAppPackageToHome('user_home_apps', 'UiCatalog', `{
      name: "UiCatalog",
      definitions: [
        {
          id: 'da',
          name: 'bubu',
          label: 'Click this action',
          type: 'button',
          action: {
            type: "content",
            content_url: "/internal/ui_catalog"
          }
        },
        {
          type: "list",
          disabled: false,
          items: [
            {
              "type": "item",
              "id": "slug",
              "title": 'a title',
              "subtitle": 'subtitle',
              action: {
                type: "frame",
                url: "/package_iframe_internal/UiCatalog"
              }
            }
          ]
        }
      ]
    }`)

    translations()

    cy.appEval('App.last').then((results) => {
      const appKey = results.key

      cy.visit(`/tester/${appKey}`)
      cy.wait(2000)
      cy.get('#chaskiq-prime').click().then(() => {
        
        getIframeBody('iframe:first').xpath(
          '/html/body/div/div/div/div[2]/div[1]/div[1]/div/div[2]/div/div/form/fieldset/div[2]/div'
        ).click()

        cy.wait(1000)
        getIframeBody('iframe:first')
          .find('#package-frame')
          .its('0.contentDocument').should('exist')
          .its('body').should('not.be.undefined')
          .then(($iframe) => {
            cy.wrap($iframe).contains('my friend')
          })
      })
    })
  })
})


