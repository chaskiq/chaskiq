
import {
  translations,
  openMessenger
} from '../../support/utils'

describe('Translations Spec', function() {

  it('user lang en', function() {
    cy.appScenario('basic')
    translations()
    openMessenger(($body)=>{
      expect($body.html()).to.contain('Start a conversation')
      expect($body.html()).to.contain('hello friend')
      expect($body.html()).to.contain('we are here to help')
      cy.appEval("App.last.app_users.size").then((res)=>{
        expect(res).to.equal(1)
      })
      cy.appEval("App.last.app_users.last.lang").then((res)=>{
        expect(res).to.equal('en')
      })
    }, {params: {lang: 'en'}} )
  })

  it('user lang es', function() {
    cy.appScenario('basic')
    translations()
    openMessenger(($body)=>{
      
      expect($body.html()).to.contain('Inicia una conversación')
      /*expect($body.html()).to.contain('hola')
      expect($body.html()).to.contain('estamos aqui')
      expect($body.html()).to.contain('somos un equipo')*/
      cy.appEval("App.last.app_users.size").then((res)=>{
        expect(res).to.equal(1)
      })

      cy.appEval("App.last.app_users.last.lang").then((res)=>{
        expect(res).to.equal('es')
      })
      cy.appEval("App.last.app_users.last.name").then((res)=>{
        expect(res).to.equal('miguel')
      })

    }, {params: {lang: 'es'}} )
  })


  it('visitor lang en', function() {
    cy.appScenario('basic')
    translations()
    openMessenger(($body)=>{
      expect($body.html()).to.contain('Start a conversation')
      expect($body.html()).to.contain('hello friend')
      cy.appEval("App.last.app_users.size").then((res)=>{
        expect(res).to.equal(1)
      })
    }, {params: {lang: 'en'}, headers: {}}, true )
  })

  it('visitor lang es property', function() {
    cy.appScenario('basic')
    translations()
    openMessenger(($body)=>{
      
      expect($body.html()).to.contain('Inicia una conversación')
      expect($body.html()).to.contain('Hola')
      expect($body.html()).to.contain('somos un equipo')
      cy.appEval("App.last.app_users.size").then((res)=>{
        expect(res).to.equal(1)
      })

      cy.appEval("Visitor.last.lang").then((res)=>{
        expect(res).to.equal('es')
      })

    }, {params: {lang: 'es'}, headers:{}}, true )
  })


  it.skip('lang en', function() {
    cy.appScenario('start_conversation_from_agent')
    openMessenger(($body)=>{
      expect($body.html()).to.contain('Start a conversation')
      cy.appEval("App.last.app_users.size").then((res)=>{
        expect(res).to.equal(1)
      })
      cy.wrap($body).contains('a few seconds ago')
      cy.wrap($body).xpath("/html/body/div/div/div/div[2]/div/div[1]/div[2]/div")
      .click().then(()=>{
        expect($body.html()).to.contain('foobar')
        cy.wrap($body)
        .xpath("/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea")
        .type("oeoe \n")
        cy.wrap($body).contains('oeoe')
      })

    }, {lang: 'en'}, true )
  })

  it.skip('lang es', function() {
    cy.appScenario('start_conversation_from_agent')
    openMessenger(($body)=>{
      expect($body.html()).to.contain('Inicia una conversación')
      cy.appEval("App.last.app_users.size").then((res)=>{
        expect(res).to.equal(1)
      })
      cy.wrap($body).contains('a few seconds ago')
      cy.wrap($body).xpath("/html/body/div/div/div/div[2]/div/div[1]/div[2]/div")
      .click().then(()=>{
        expect($body.html()).to.contain('foobar')
        cy.wrap($body)
        .xpath("/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea")
        .type("oeoe \n")
        cy.wrap($body).contains('oeoe')
      })

    }, {lang: 'es'} )
  })

})