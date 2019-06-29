=begin
  ui triggers

  actions:
    + message
    + open messenger
    + play sound

  trigger events:
    + on leave
    + on pages
    + on url parameters
    + on user data
    + after delay
=end


class Trigger


  def self.definition
    [ {
        after_delay: 4.seconds,
        rules: [
          {pages_pattern: "/tester(/:id)"},
        ],
        actions: [
          open_messenger: true,
          message: {
            package: :ask_for_email
          }
        ]
      }
    ] 
  end

end