# frozen_string_literal: true

module InboundAddress
  extend ActiveSupport::Concern

  def inbound_email_address
    part = URLcrypt.encode(key.to_s)
    domain = outgoing_email_domain
    "inbound+app-#{part}@#{domain}"
  end

  class_methods do
    # used in email inbox
    def decode_inbound_address(address)
      return decode_app_inbound_address(address) if address.starts_with?('inbound+app')
      return decode_agent_inbound_address(address) if address.starts_with?('inbound+')

      []
    end

    def decode_app_inbound_address(email)
      # "inbound+app-#{part}@#{domain}"
      if (matches = email.match(/inbound\+app-(\S+)@\S+/)) && matches&.captures&.any?
        app = App.find_by(
          key: URLcrypt.decode(matches.captures.first)
        )
        [app]
      end
    end

    def decode_agent_inbound_address(address)
      parts = address.split('+')
      app = App.find_by(key: parts[1])
      return unless app.present?

      agent_id = parts[2].split('@').first
      agent = app.agents.find(URLcrypt.decode(agent_id))
      [app, agent]
    end
  end
end
