const defaultOptions = {
  enabled: false,
  users: true,
  user_segment: 'all',
  user_options: [],
  visitors: true,
  visitor_options: [],
  visitor_segment: 'all'
}

function createApp (data = {}) {
  const defaultData = {
    name: 'Good bye Mars',
    domain_url: 'http://localhost:5002',
    encryption_key: 'unodostrescuatro',
    active_messenger: 'true',
    state: 'enabled',
    greetings_es: 'Hola amigo',
    greetings_en: 'hello friend',
    intro_en: 'we are here to help',
    tagline_en: 'estamos aqui para ayudarte',
    intro_es: 'somos un equipo genial',
    tagline_es: 'we are an awesome team',
    reply_time: 'hours'
  }

  const newData = Object.assign(defaultData, {}, data)

  return cy.appFactories([['create', 'app', newData]])
}

function settingForUser (options = defaultOptions) {
  const {
    enabled, users,
    user_segment, user_options,
    visitors, visitor_options,
    visitor_segment
  } = options

  const settings = {
    enabled: enabled,
    users: { enabled: users, segment: user_segment, predicates: user_options },
    visitors: { enabled: visitors, segment: visitor_segment, predicates: visitor_options }
  }

  return cy.appEval(`App.last.update({inbound_settings: ${JSON.stringify(settings)}})`)
}

function messengerVisit (options, inboundSettings, cb) {
  const { visitor, nullFrame } = options
  cy.appEval('App.last').then((results) => {
    // cy.appEval("App.last.add_agent({email: \"test2@test.cl\", name: \"test agent\"})")
    const record = results

    settingForUser(inboundSettings)
      .then((results) => {
        cy.visit(`/tester/${record.key}${visitor ? '?sessionless=true' : ''}`).then(() => {
          if (nullFrame) { return cy.get('iframe:first').should('not.exist') }

          cy.get('iframe:first')
            .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              cb && cb($body, cy)
              // expect($body.find("#chaskiq-prime").length).to.equal(1)
            })
        })
      })
  })
}

describe('Chaskiq Messenger', function () {
  beforeEach(() => {
    cy.appEval('ActiveJob::Base.queue_adapter = :test')
    cy.appEval('ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true')
    cy.appScenario('basic')
  })

  it('renders messenger on anonimous user creating a app user', function () {
    createApp().then((results) => {
      // cy.appEval("App.last.add_user({email: \"test@test.cl\"})")
      cy.appEval('App.last.add_agent({email: "test2@test.cl", name: "test agent"})')
      const record = results[0]
      cy.visit(`/tester/${record.key}`).then(() => {
        // cy.wait(10000)
        // cy.get('#ChaskiqMessengerRoot').should('be.visible')
        cy.get('iframe:first')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            cy.wrap($body).find('#chaskiq-prime').click()
          })

        cy.get('iframe:first')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            expect($body.html()).to.contain('Start a conversation')

            cy.appEval('App.last.app_users.size').then((res) => {
              expect(res).to.equal(1)
            })
          })
      })
    })

    cy.contains('Chaskiq tester site')
  })

  describe('inbound settings for users', function () {
    // describe inbound settings
    it('displays messenger on user', () => {
      const user_options = [{ attribute: 'email', comparison: 'contains', type: 'string', value: 'test' }]
      const inboundSettings = {
        enabled: true,
        users: true,
        user_options: user_options,
        user_segment: 'some'
      }

      messengerVisit({ visitor: true, nullFrame: true }, inboundSettings, ($body, cy) => {
        expect($body.find('#chaskiq-prime').length).to.equal(1)
      })
    })

    it('no return for user', () => {
      const user_options = [{ attribute: 'email', comparison: 'not_contains', type: 'string', value: 'test' }]
      const inboundSettings = {
        enabled: true,
        users: true,
        user_options: user_options,
        user_segment: 'some'
      }

      messengerVisit({ visitor: true, nullFrame: true }, inboundSettings, ($body, cy) => {
      })
    })
  })

  describe('inbound settings for visitors', function () {
    it('displays messenger on visitor', () => {
      const visitor_options = [{ attribute: 'name', comparison: 'contains', type: 'string', value: 'isito' }]
      const inboundSettings = {
        enabled: true,
        visitors: true,
        visitor_options: visitor_options,
        visitor_segment: 'some'
      }
      messengerVisit({ visitor: true }, inboundSettings, ($body) => {
        expect($body.find('#chaskiq-prime').length).to.equal(1)
      })
    })

    it('no return for visitor', () => {
      const visitor_options = [{ attribute: 'email', comparison: 'not_contains', type: 'string', value: 'test' }]
      const inboundSettings = {
        enabled: true,
        visitors: true,
        visitor_options: visitor_options,
        visitor_segment: 'some'
      }

      messengerVisit({ visitor: true, nullFrame: true }, inboundSettings, ($body, cy) => {
        // expect($body.find("#chaskiq-prime").length).to.equal(1)
      })
    })
  })

  describe('blocked users', function () {
    it('will not render on blocked users', () => {
      const user_options = []
      const inboundSettings = {
        enabled: true,
        users: true,
        user_options: user_options,
        user_segment: 'some'
      }

      messengerVisit({
        visitor: false
      },
      inboundSettings, ($body, cy) => {
        cy.appEval('App.last.app_users.first.block!')

        messengerVisit({ visitor: false, nullFrame: true }, inboundSettings, ($body, cy) => {
          expect($body.find('#chaskiq-prime').length).to.equal(1)
        })
      })
    })
  })
})
