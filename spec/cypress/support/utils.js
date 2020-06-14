export function translations(){
  cy.appEval(`App.last.update({
    greetings_es: "Hola amigo", 
    greetings_en: "hello friend",

    intro_en: "we are here to help",
    tagline_en: "estamos aqui para ayudarte",

    intro_es: "somos un equipo genial",
    tagline_es: "we are an awesome team"
  })`)
}

export function openMessenger(cb, options, sessionless){

  cy.appEval("App.last").then((results) => {
    const appKey = results.key
    const params = options.params
    let urlParams = params 
    if(sessionless)
      urlParams = Object.assign(
        urlParams, {}, {sessionless: sessionless }
      )

    cy.visit(`/tester/${appKey}`, {qs: urlParams, headers: options.headers || {}})
    .then(()=>{
      cy.get('iframe:first')
      .then(function ($iframe) {
        const $body = $iframe.contents().find('body')
        cy.wrap($body).find("#chaskiq-prime").click()
      })

      cy.get('iframe:first')
      .then(function ($iframe) {
        const $body = $iframe.contents().find('body')
        cb($body, appKey )
      })
    });
  })
}

export function login(){
  cy.appScenario('basic')
  cy.visit('/')
  cy.contains("Sign in")
  
  cy.wait(1000)

  cy.get('input[name="email"]')
  .type('test@test.cl').should('have.value', 'test@test.cl')

  cy.get('input[name="password"]')
  .type('123456').should('have.value', '123456')

  cy.get('button[type="submit"]').click()

  cy.get("body").should('contain', 'Welcome to Chaskiq')
}

export function findButtonByName(name){
  return cy.get('button').contains(name)
}

export function findElementByName(element, name){
  return cy.get(element).contains(name)
}

export function findLinkByName(name){
  return cy.get('a').contains(name)
}