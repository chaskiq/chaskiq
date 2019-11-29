


const defaultPredicates =  [
  {
    type: "match", 
    value: "and", 
    attribute: "match", 
    comparison: "and"
  }
]

describe('Tours Spec', function() {
  beforeEach(() => {
    cy.app('clean') // have a look at cypress/app_commands/clean.rb
    cy.appEval('ActiveJob::Base.queue_adapter = :test')
    cy.appEval('ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true')
  })

  it('display tour, finish event', function() {
    cy.appScenario('basic')
    
    cy.appEval("App.last").then((results) => {
      const appKey = results.key
      cy.app("tour_command", {
        app_key: appKey, 
        url: `/tester/${appKey}`,
        state: 'enabled'
      }).then((res)=>{
        console.log("RSRS", res)
        cy.visit(`/tester/${appKey}`).then(()=>{

          //TODO:

          /*cy.appEval("Tour.last.metrics.where(app_user: AppUser.last, action: \"open\")")
          .then((res)=>{
            expect(res.length).to.equal(1)
          })*/

          // expect(tour.metrics.where(app_user: AppUser.last, action: "open")).to be_any
          cy.contains("this is the tour")
          cy.contains("Next (1/2)").click()
          cy.contains("final tour step") 
          cy.contains("Last (2/2)").click()
          cy.contains("final tour step").should('not.exist');

          cy.visit(`/tester/${appKey}`).then(()=>{
            cy.contains("this is the tour").should('not.exist');
          })
        })
      })
    })
  })


  it('display tour, skip event', function() {
    cy.appScenario('basic')
    
    cy.appEval("App.last").then((results) => {
      const appKey = results.key
      cy.app("tour_command", {
        app_key: appKey, 
        url: `/tester/${appKey}`,
        state: 'enabled'
      }).then((res)=>{
        console.log("RSRS", res)
        cy.visit(`/tester/${appKey}`).then(()=>{

          //TODO:
          // expect(tour.metrics.where(app_user: AppUser.last, action: "open")).to be_any
          cy.contains("this is the tour")
          cy.contains("skip").click()
          cy.contains("final tour step").should('not.exist');
          cy.visit(`/tester/${appKey}`).then(()=>{
            cy.contains("this is the tour").should('not.exist');
          })
        })
      })
    })
  })

  it('display on configured url', function() {
    cy.appScenario('basic')
    
    cy.appEval("App.last").then((results) => {
      const appKey = results.key
      cy.app("tour_command", {
        app_key: appKey, 
        url: `/tester/${appKey}/another`,
        state: 'enabled',
      }).then((res)=>{
        console.log("RSRS", res)
        cy.visit(`/tester/${appKey}/another`).then(()=>{

          //TODO:
          // expect(tour.metrics.where(app_user: AppUser.last, action: "open")).to be_any
          cy.contains("this is the tour")
          
          cy.visit(`/tester/${appKey}`).then(()=>{
            cy.contains("this is the tour").should('not.exist');
          })
        })
      })
    })
  })

  it('display on configured url on pushState', function() {
    cy.appScenario('basic')
    
    cy.appEval("App.last").then((results) => {
      const appKey = results.key
      cy.app("tour_command", {
        app_key: appKey, 
        url: `/tester/${appKey}/another`,
        state: 'enabled',
      }).then((res)=>{
        cy.visit(`/tester/${appKey}/another2`).then(()=>{
          cy.contains("this is the tour").should('not.exist');
          cy.window().its('history').invoke('pushState', 'page2', 'Title', `/tester/${appKey}/another`)
          cy.contains("this is the tour").should('exist');
        })
      })
    })
  })


  it.skip('display on configured url on pushState & popState', function() {
    cy.appScenario('basic')
    
    cy.appEval("App.last").then((results) => {
      const appKey = results.key
      cy.app("tour_command", {
        app_key: appKey, 
        url: `/tester/${appKey}/another`,
        state: 'enabled',
      }).then((res)=>{
        cy.visit(`/tester/${appKey}/another2`).then(()=>{
          cy.contains("this is the tour").should('not.exist');
          cy.wait(2000)
          cy.window().its('history').invoke('pushState', 'page2', 'Title', `/tester/${appKey}/another`)
          cy.wait(2000)
          cy.contains("this is the tour").should('exist');
          cy.wait(2000)

          cy.window().then((win) => {
            win.history.back()
            cy.contains("this is the tour").should('not.exist');
          })

          //cy.window().its('history').invoke('back')
          
        })
      })
    })
  })

  it("will appear on email match", function(){

    cy.appScenario('basic')

    cy.appEval("App.last").then((results) => {
      const appKey = results.key
      cy.app("tour_command", {
        app_key: appKey, 
        url: `/tester/${appKey}/another`,
        state: 'enabled',
        segments: [
          {type: "match", value: "and", attribute: "match", comparison: "and"},
          {attribute: "email", comparison: "contains", type: "string", value: "test"}
        ]
      }).then((res)=>{
        console.log("RSRS", res)
        cy.visit(`/tester/${appKey}/another`).then(()=>{

          //TODO:
          // expect(tour.metrics.where(app_user: AppUser.last, action: "open")).to be_any
          cy.contains("this is the tour")
          
          cy.visit(`/tester/${appKey}`).then(()=>{
            cy.contains("this is the tour").should('not.exist');
          })
        })
      })
    })

  })

  it("will not appear on email dismatch", function(){

    cy.appScenario('basic')

    cy.appEval("App.last").then((results) => {
      const appKey = results.key
      cy.app("tour_command", {
        app_key: appKey, 
        url: `/tester/${appKey}/another`,
        state: 'enabled',
        predicates: [
          {type: "match", value: "and", attribute: "match", comparison: "and"},
          {attribute: "email", comparison: "contains", type: "string", value: "other-string-"}
        ]
      }).then((res)=>{
        cy.visit(`/tester/${appKey}/another`).then(()=>{

          //TODO:
          // expect(tour.metrics.where(app_user: AppUser.last, action: "open")).to be_any
          cy.contains("this is the tour").should('not.exist');
          
          cy.visit(`/tester/${appKey}`).then(()=>{
            cy.contains("this is the tour").should('not.exist');
          })
        })
      })
    })

  })

})