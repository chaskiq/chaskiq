


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
    cy.appEval('ActiveJob::Base.queue_adapter = :test')
    cy.appEval('ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true')
    cy.appEval('Redis.current.del("app_user:1:trigger_locked")')
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

        
        cy.visit(`/tester/${appKey}`).then(()=>{

          //TODO:

          //cy.appEval("Tour.last.metrics.where(app_user: AppUser.last, action: \"open\")")
          //.then((res)=>{
          //  expect(res.length).to.equal(1)
          //})

          // expect(tour.metrics.where(app_user: AppUser.last, action: "open")).to be_any
          cy.contains("this is the tour")
          cy.get('button[data-tour-elem="right-arrow"]').click()
          cy.contains("final tour step") 

          cy.get('button[data-tour-elem="right-arrow"]').click()
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
        cy.visit(`/tester/${appKey}`).then(()=>{

          //TODO:
          // expect(tour.metrics.where(app_user: AppUser.last, action: "open")).to be_any
          cy.contains("this is the tour")
          cy.get('button[aria-label="Close"]').click()
          //cy.contains("skip").click()
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
        predicates: [
          {type: "match", value: "and", attribute: "match", comparison: "and"},
          {attribute: "email", comparison: "contains", type: "string", value: "test"}
        ]
      }).then((res)=>{
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

  
  it("will appear on email & property match num_devices eq 1", function(){

    cy.appScenario('basic')

    cy.appEval("App.last").then((results) => {
      const appKey = results.key
      cy.app("tour_command", {
        app_key: appKey, 
        url: `/tester/${appKey}/another`,
        state: 'enabled',
        predicates: [
          {type: "match", value: "and", attribute: "match", comparison: "and"},
          {attribute: "email", comparison: "contains", type: "string", value: "test"},
          {attribute: "num_devices", comparison: "eq", type: "integer", value: 1}
        ]
      }).then((res)=>{
        cy.visit(`/tester/${appKey}/another`, {qs: {num_devices: 1}}).then(()=>{
          cy.contains("this is the tour")
        })
      })
    })
  })

  it("will appear on email & property match num_devices lt 2", function(){

    cy.appScenario('basic')

    cy.appEval("App.last").then((results) => {
      const appKey = results.key
      cy.app("tour_command", {
        app_key: appKey, 
        url: `/tester/${appKey}/another`,
        state: 'enabled',
        predicates: [
          {type: "match", value: "and", attribute: "match", comparison: "and"},
          {attribute: "email", comparison: "contains", type: "string", value: "test"},
          {attribute: "num_devices", comparison: "lt", type: "integer", value: 2}
        ]
      }).then((res)=>{
        cy.visit(`/tester/${appKey}/another`, {qs: {num_devices: 1}}).then(()=>{
          cy.contains("this is the tour")
        })
      })
    })
  })

  it("will not appear on email & property match num_devices gt 2", function(){

    cy.appScenario('basic')

    cy.appEval("App.last").then((results) => {
      const appKey = results.key
      cy.app("tour_command", {
        app_key: appKey, 
        url: `/tester/${appKey}/another`,
        state: 'enabled',
        predicates: [
          {type: "match", value: "and", attribute: "match", comparison: "and"},
          {attribute: "email", comparison: "contains", type: "string", value: "test"},
          {attribute: "num_devices", comparison: "gt", type: "integer", value: 2}
        ]
      }).then((res)=>{
        cy.visit(`/tester/${appKey}/another`, {qs: {num_devices: 1}}).then(()=>{
          cy.contains("this is the tour").should('not.exist');
        })
      })
    })
  })

  it("will not appear on email & property match num_devices gt wrong string type", function(){

    cy.appScenario('basic')

    cy.appEval("App.last").then((results) => {
      const appKey = results.key
      cy.app("tour_command", {
        app_key: appKey, 
        url: `/tester/${appKey}/another`,
        state: 'enabled',
        predicates: [
          {type: "match", value: "and", attribute: "match", comparison: "and"},
          {attribute: "email", comparison: "contains", type: "string", value: "test"},
          {attribute: "num_devices", comparison: "gt", type: "integer", value: 0}
        ]
      }).then((res)=>{
        cy.visit(`/tester/${appKey}/another`, {qs: {num_devices: "!j"}}).then(()=>{
          cy.contains("this is the tour").should('not.exist');
        })
      })
    })
  })

  it("will appear on email & property match date gt 1 week 1", function(){

    cy.appScenario('basic')

    cy.appEval("App.last").then((results) => {
      const appKey = results.key
      cy.app("tour_command", {
        app_key: appKey, 
        url: `/tester/${appKey}/another`,
        state: 'enabled',
        predicates: [
          {type: "match", value: "and", attribute: "match", comparison: "and"},
          {attribute: "email", comparison: "contains", type: "string", value: "test"},
          {attribute: "last_sign_in", comparison: "gt", type: "date", value: '1 week ago'}
        ]
      }).then((res)=>{
        cy.visit(`/tester/${appKey}/another`, {qs: {num_devices: 1}}).then(()=>{
          cy.contains("this is the tour")
        })
      })
    })
  })

  it("will not appear on email & property match date gt 1 day ago", function(){

    cy.appScenario('basic')

    cy.appEval("App.last").then((results) => {
      const appKey = results.key
      cy.app("tour_command", {
        app_key: appKey, 
        url: `/tester/${appKey}/another`,
        state: 'enabled',
        predicates: [
          {type: "match", value: "and", attribute: "match", comparison: "and"},
          {attribute: "email", comparison: "contains", type: "string", value: "test"},
          {attribute: "last_sign_in", comparison: "gt", type: "date", value: '1 day ago'}
        ]
      }).then((res)=>{
        cy.visit(`/tester/${appKey}/another`, {qs: {num_devices: 1}}).then(()=>{
          cy.contains("this is the tour").should("not.exist")
        })
      })
    })
  })

  it("will appear on email & property match date gt 1 week ago & num devices", function(){

    cy.appScenario('basic')

    cy.appEval("App.last").then((results) => {
      const appKey = results.key
      cy.app("tour_command", {
        app_key: appKey, 
        url: `/tester/${appKey}/another`,
        state: 'enabled',
        predicates: [
          {type: "match", value: "and", attribute: "match", comparison: "and"},
          {attribute: "email", comparison: "contains", type: "string", value: "test"},
          {attribute: "last_sign_in", comparison: "gt", type: "date", value: '1 week ago'},
          {attribute: "num_devices", comparison: "gt", type: "integer", value: 0}
        ]
      }).then((res)=>{
        cy.visit(`/tester/${appKey}/another`, {qs: {num_devices: 1}}).then(()=>{
          cy.contains("this is the tour")
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