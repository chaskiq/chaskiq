
import {
  translations,
  openMessenger
} from '../../support/utils'

describe('Privacy Spec', function () {
  beforeEach(() => {
    cy.appScenario('basic')
    translations()
  })

  it('data protection all en', function () {
    cy.appEval(`App.last.update({
      privacy_consent_required: "all"
    })`)

    openMessenger(($body) => {
      expect($body.html()).to.contain('Data Protection')
      cy.appEval('App.last.app_users.last.lang').then((res) => {
        expect(res).to.equal('en')
      })
      cy.wrap($body).contains('Yes, Accept').click()
    }, { params: { lang: 'en' } })
  })

  it('data protection all es', function () {
    cy.appEval(`App.last.update({
      privacy_consent_required: "all"
    })`)

    openMessenger(($body) => {
      expect($body.html()).to.contain('Protección de datos')
      cy.appEval('App.last.app_users.size').then((res) => {
        expect(res).to.equal(1)
      })
      cy.appEval('App.last.app_users.last.lang').then((res) => {
        expect(res).to.equal('es')
      })

      cy.wrap($body).contains('Si, Confirmar').click()
    }, { params: { lang: 'es' } })
  })

  it('data protection none es', function () {
    cy.appEval(`App.last.update({
      privacy_consent_required: "none"
    })`)

    openMessenger(($body) => {
      expect($body.html()).to.not.contain('Protección de datos')
      cy.appEval('App.last.app_users.last.lang').then((res) => {
        expect(res).to.equal('es')
      })

      expect($body.html()).to.not.contain('Si, Confirmar')
    }, { params: { lang: 'es' } })
  })
})
