# frozen_string_literal: true

module MessageApis::Zoom
  class Api < MessageApis::BasePackage
    # https://marketplace.zoom.us/
    BASE_URL = 'https://api.zoom.us/v2'

    attr_accessor :secret

    def initialize(config:)
      @secret = secret

      @api_token = config['access_token']

      @conn = Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }

      @conn.headers = {
        'X-TOKEN' => @api_token,
        'Content-Type' => 'application/json',
        'Authorization' => "Bearer #{@api_token}"
      }
    end

    def url(url)
      "#{BASE_URL}#{url}"
    end

    def create_fase(message, klass)
      value = message.blocks.dig('values', 'email')
      response = @conn.post(
        "https://api.zoom.us/v2/users/#{value}/meetings",
        {
          duration: 20,
          password: DummyName::Name.new,
          settings: {
            audio: true,
            host_video: true,
            join_before_host: false,
            enforce_login: false,
            mute_upon_entry: false,
            participant_video: true
          },
          timezone: 'string',
          topic: message.conversation_part.key,
          type: 1
        }.to_json
      )

      json = JSON.parse(response.body)
      {
        kind: 'initialize',
        definitions: definitions_for_fase(json),
        values: { email: value }
      }
    end

    def trigger(event); end

    def process_event(params, package)
      @package = package
      event = params['event']
      payload = params['payload']

      # https://marketplace.zoom.us/docs/api-reference/webhook-reference/meeting-events/meeting-ending
      case event
      when 'meeting.started' then handle_started_meeting(payload)
      when 'meeting.ended' then handle_ended_meeting(payload)
      end
    end

    def find_message(payload)
      # TODO: validate app match from message
      message = @package.app.conversation_parts.find_by(
        key: payload['object']['topic']
      )
      data = message.messageable.data || {}

      [message, data]
    end

    def handle_started_meeting(payload)
      handle_message(payload, 'started')
    end

    def handle_ended_meeting(payload)
      handle_message(payload, 'ended')
    end

    def handle_message(payload, kind)
      message, data = find_message(payload)
      m = message.messageable
      schema = m.blocks['schema'].dup
      last_block = schema.pop
      new_schema = schema << last_block.merge(text: "meeting_#{kind}")
      m.blocks['schema'] = new_schema
      m.save_replied(
        data.merge(status: "meeting_#{kind}")
      )
    end

    def register_webhook(app_package, integration); end

    # for display in replied message
    def self.display_data(data)
      return if data.blank?

      if data['message'].present?
        return {
          formatted_text: data['message']
        }
      end

      {
        opener: data['join_url'],
        status: data['status'],
        password: data['password'],
        meeting_id: data['id'],
        formatted_text: "<span>
          <a href=#{data['join_url']} target='blank'> Zoom meeting: #{data['id']}</a>
          <br/> password: #{data['password']}
          <br/> status: #{data['status']}
          </span>
        "
      }
    end

    def definitions_for_fase(json)
      [
        {
          type: 'text',
          style: 'header',
          text: 'Your zoom meeting is ready',
          align: 'left'
        },
        {
          type: 'text',
          text: "pass: #{json['password']}",
          align: 'left'
        },
        {
          id: 'join-url',
          type: 'button',
          align: 'left',
          label: 'Join',
          width: 'full',
          action: { type: 'url', url: json['join_url'] }
        },
        {
          type: 'text',
          text: "Status: #{json['status']}",
          align: 'left'
        }
      ]
    end

    def definitions_for_configure_hook
      zoom_input = {
        type: 'input',
        id: 'zoom_user',
        placeholder: 'enter your zoom user email',
        label: 'Zoom user'
      }

      action = {
        id: 'set-url',
        name: 'set_url',
        label: 'Set up',
        type: 'button',
        action: {
          type: 'submit'
        }
      }

      [
        zoom_input,
        action
      ]
    end
  end
end
