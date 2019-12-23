# frozen_string_literal: true

# host_port = "#{Capybara.current_session.server.host}:#{Capybara.current_session.server.port}"

app = App.find_by(key: command_options.fetch('app_key'))
default_predicates = [
  {
    type: 'match',
    value: 'and',
    attribute: 'match',
    comparison: 'and'
  }
]

tour_attributes = {
  'app' => app,
  'key' => nil,
  'from_name' => nil,
  'from_email' => nil,
  'reply_email' => nil,
  'html_content' => nil,
  'premailer' => nil,
  'serialized_content' => nil,
  'description' => 'oli',
  'sent' => nil,
  'name' => 'ooioij',
  'scheduled_at' => 2.day.ago,
  'scheduled_to' => 2.day.from_now,
  'timezone' => nil,
  'state' => command_options.fetch('state'),
  'subject' => 'oijoij',
  'segments' => command_options.fetch('predicates', default_predicates),
  'type' => 'Tour',
  'settings' => { 'url' => command_options.fetch('url').to_s,
                  'steps' => [
                    { 'target' => 'H1', 'serialized_content' => '{"blocks":[{"key":"f1qmb","text":"this is the tour","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}' },
                    { 'target' => 'H1', 'serialized_content' => '{"blocks":[{"key":"f1qmb","text":"final tour step","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}' }
                  ],
                  'hidden_constraints' => %w[skip finish] }
}

tour = app.tours.create(tour_attributes)
tour.enable! if command_options.fetch('state') === 'enabled'
tour
