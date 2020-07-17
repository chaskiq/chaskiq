# frozen_string_literal: true
require 'pp'
require 'oauth2'

module MessageApis
  class Slack

    include MessageApis::Helpers

    BASE_URL = 'https://slack.com'
    HEADERS = {"content-type" => "application/json"} #Suggested set? Any?

    attr_accessor :key, :secret, :access_token

    attr_accessor :keys,
                  :client,
                  :base_url #Default: 'https://api.twitter.com/'
  
    def initialize(config: {})
      @access_token = access_token
      @conn = Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }

      @package = nil

      @keys = {}
      @keys['channel'] = Rails.env.development? ? 'chaskiq_channel-local4' : 'chaskiq_channel'
      @keys['consumer_key'] = config["api_key"]
      @keys['consumer_secret'] = config["api_secret"]
      @keys['access_token'] =  config["access_token"]
      @keys['access_token_secret'] =  config["access_token_secret"]
      @keys['user_token'] = config["user_token"]
    end

    def self.process_global_hook(params)
      return params[:challenge] if params[:challenge]

      team_id = params["team_id"] || JSON.parse(params[:payload])["team"]["id"]

      app_package = AppPackage.find_by(name: params["provider"].capitalize)
      integration_pkg = app_package.app_package_integrations.find_by(
        external_id: team_id
      )
      response = integration_pkg.process_event(params)
    end

    def after_install
      # TODO here create the configured channel and join it
    end

    def get_api_access
      @base_url = BASE_URL

      {
        "access_token": @keys['access_token'],
        "access_token_secret": @keys['access_token_secret']
      }.with_indifferent_access
    end

    def authorize_bot!
      get_api_access
      @conn.authorization :Bearer, @keys["access_token"]
    end

    def authorize_user!
      get_api_access
      @conn.authorization :Bearer, @keys["access_token_secret"]
    end

    def oauth_client
      @oauth_client ||= OAuth2::Client.new(
        @keys['consumer_key'], 
        @keys['consumer_secret'], 
        site: 'https://slack.com',
        authorize_url: '/oauth/v2/authorize',
        token_url: '/api/oauth.v2.access'
      )
    end

    def user_client

    end

    def url(url)
      "#{BASE_URL}#{url}"
    end

    def post_message(message, blocks, options={})
      authorize_bot!

      data = {
        "channel": options[:channel] || @keys['channel'],
        "text": message,
        "blocks": blocks
      }

      data.merge!(options) if options.present?

      url = url('/api/chat.postMessage')

      response = @conn.post do |req|
        req.url url
        req.headers['Content-Type'] = 'application/json; charset=utf-8'
        req.body = data.to_json
      end

      puts response.body
      puts response.status

      response
    end

    def create_channel(name=nil, user_ids="")
      authorize_bot!

      data = {
        "name": name || @keys['channel'],
        "user_ids": user_ids
      }

      url = url('/api/conversations.create')

      response = @conn.post do |req|
        req.url url
        req.headers['Content-Type'] = 'application/json; charset=utf-8'
        req.body = data.to_json
      end

      #puts response.body
      JSON.parse(response.body)
    end

    def join_channel(id)
      data = {
        "channel": id
      }

      url = url('/api/conversations.join')
      #@conn.authorization :Bearer, key
      response = @conn.post do |req|
        req.url url
        req.headers['Content-Type'] = 'application/json; charset=utf-8'
        req.body = data.to_json
      end

      JSON.parse(response.body)
    end

    def join_user_to_package_channel(id)
      authorize_user!
      join_channel(id)
    end

    def trigger(event)
      
      subject = event.eventable
      action = event.action

      case action
      when "visitors.convert" then notify_new_lead(subject)
      when "conversation.user.first.comment" then notify_added(subject)
      #when "conversations.added" then notify_added(subject)
      else
      end
    end

    def notify_added(conversation)

      authorize_bot!

      message = conversation.messages.where.not(
        authorable_type: "Agent"
      ).last
      
      text_blocks = blocks_transform(message)

      participant = conversation.main_participant

      base = "#{ENV['HOST']}/apps/#{conversation.app.key}"
      conversation_url = "#{base}/conversations/#{conversation.key}"
      user_url = "#{base}/users/#{conversation.key}"
      links = "*<#{user_url}|#{format_user_name(conversation.main_participant)}>* <#{conversation_url}|view in chaskiq>"

      data = [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "Conversation initiated by #{links}"
          }
        },

        {
          "type": "section",
          "fields": [
            {
              "type": "mrkdwn",
              "text": "*Info:* #{participant.display_name} #{participant.email}"
            },
            {
              "type": "mrkdwn",
              "text": "*From:* #{participant.city}, #{participant.region} "
            },
            {
              "type": "mrkdwn",
              "text": "*When:* #{I18n.l(conversation.created_at, format: :short)}"
            },
            {
              "type": "mrkdwn",
              "text": "*Seen:* #{I18n.l(participant.last_visited_at, format: :short)}"
            },
            {
              "type": "mrkdwn",
              "text": "*Assignee:* #{ assignee_display(conversation.assignee) || 'Unassigned'}"
            },
            {
              "type": "mrkdwn",
              "text": "*Device:*\n#{participant.browser} #{participant.browser_version} / #{participant.os}"
            },

            {
              "type": "mrkdwn",
              "text": "*From:*\n<#{participant.referrer} | URL: #{participant.referrer}>"
            },

            
          ]
        },

        {
          "type": "divider"
        },

        {
          "type": "context",
          "elements": [
            {
              "type": "mrkdwn",
              "text": "Message"
            }
          ]
        }
      ]

      data << text_blocks unless text_blocks.empty?
      
      data << [
        {
          "type": "divider"
        },

        {
          "type": "context",
          "elements": [
            {
              "type": "mrkdwn",
              "text": "To reply just reply on a thread",
            }
          ]
        }
      ]

      puts data

      response_data = json_body(
        post_message(
          'New conversation from Chaskiq',
          data.flatten.as_json,
          {
            "channel": @keys['channel'],
            "text": 'New conversation from Chaskiq',
          }
        )
      )

      return unless response_data["ok"]

      conversation.conversation_channels.create({
        provider: 'slack',
        provider_channel_id: response_data["ts"]
      })
    
    end

    def assignee_display(assignee)
      return nil if assignee.blank?
      assignee&.display_name.blank? ? assignee&.email : assignee.display_name
    end

    def json_body(response)
      JSON.parse(response.body)
    end

    def notify_new_lead(user)
      post_message(
        "new lead!", 
        [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "a new Lead! #{user.name}"
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "Close",
                  "emoji": true
                },
                "value": "click_me_123"
              },
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "Reply in channel",
                  "emoji": true
                },
                "value": "click_me_123"
              }
            ]
          }
        ]
      )
    end

    # this call process event in async job
    def enqueue_process_event(params, package)
      return handle_challenge(params) if is_challenge?(params) 
      #process_event(params, package)
      HookMessageReceiverJob.perform_now(
        id: package.id, 
        params: params.permit!.to_h
      )
    end

    def process_event(params, package)

      @package = package

      handle_incoming_event(params) if params['event']
    end

    def handle_incoming_event(params)
      event = params["event"]
      puts "processing slack event type: #{event['type']}"
      case event['type']
      when 'message' then process_message(event)
      end
    end

    def process_message(event)

      # TODO: add a conversation_event_type for this type
      return if event['subtype'] === "channel_join"
      return if event['thread_ts'].blank?

      conversation = @package
      .app
      .conversations
      .joins(:conversation_channels)
      .where(
        "conversation_channels.provider =? AND 
        conversation_channels.provider_channel_id =?", 
        "slack", event['thread_ts']
      ).first


      serialized_blocks = serialize_content(event)
      
      text = event["text"]

      return if conversation.blank?

      return if conversation.conversation_part_channel_sources
                            .find_by(message_source_id: event["ts"]).present?

      # TODO: serialize message
      conversation.add_message(
        from: get_agent_from_event(event),
        message: {
          html_content: text,
          serialized_content: serialized_blocks
        },
        provider: 'slack',
        message_source_id: event["ts"],
        check_assignment_rules: true
      )

    end

    def get_agent_from_event(event)
      begin
        authorize_bot!
        url = url('/api/users.info')
        response = get_data(url, {user: event["user"]})
        user_email = JSON.parse(response.body)["user"]["profile"]["email"]
        agent = @package.app.agents.find_by(email: user_email )
        agent || @package.app.agents.first
      rescue 
        @package.app.agents.first
      end
    end

    def handle_challenge(params)
      params[:challenge]
    end

    def is_challenge?(params)
      params.keys.include?("challenge")
    end

    def oauth_authorize(app, package)
      oauth_client.auth_code.authorize_url(
        user_scope: 'chat:write,channels:history,channels:write,groups:write,mpim:write,im:write',
        scope: 'files:read,channels:history,channels:join,chat:write,channels:manage,chat:write.customize,users:read,users:read.email',
        redirect_uri: package.oauth_url
      )
    end

    def receive_oauth_code(params, package)
      code = params[:code]

      headers = {
        :accept => 'application/json',
        :content_type => 'application/json'
      }

      token = oauth_client.auth_code.get_token(
        code, 
        :redirect_uri => package.oauth_url, 
        :token_method => :post
      )

      token_hash = token.to_hash

      package.update(
        external_id: token_hash["team"]["id"],
        project_id: token_hash["app_id"],
        access_token: token_hash[:access_token],
        access_token_secret: token.to_hash["authed_user"]["access_token"]
      )

      # this will create the channel
      package.message_api_klass.after_authorize

      true
    end

    def after_authorize
      response = create_channel
      if !response["error"] and chann_id = response.dig("channel").dig("id")
        authorize_user!
        join_channel(chann_id)
      end
    end

    # triggered when a new chaskiq message is created
    # will triggered just after the ws notification
    def notify_message(conversation: , part:, channel:)

      # TODO ? redis cache here for provider / channel id / part
      return if part.conversation_part_channel_sources.find_by(provider: "slack").present?
      
      blocks = blocks_transform(part)

      messageable = part.messageable

      user_options = {
        username: "#{format_user_name(part.authorable)}",
        icon_url: part&.authorable&.avatar_url
      }

      #text = !blocks.blank? ? 
      #        blocks.join(" ") : 
      #        part.messageable.html_content rescue nil

      if part.messageable.is_a?(ConversationPartBlock) 
        return if !messageable.replied?
        data = messageable.data
        data_label = data['label']

        data_fmt = data.is_a?(Hash) ?
        data.map { |k,v| "#{k.capitalize}: #{v}" }.join("\n") : ''

        blocks = [{
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*replied*: #{data_label || data_fmt}",
          },
          "block_id": 'replied-1'
        }]

        user = conversation.main_participant

        user_options.merge!({
          username: format_user_name(user),
          icon_url: user&.avatar_url
        })
      end 


      if part.messageable.is_a?(ConversationPartEvent) 
        data = messageable.data
        data_label = data['label']

        data_fmt = data.is_a?(Hash) ?
        data.reject{|k,v| v.blank? or ["id"].include?(k) }
        .map { |k,v| 
          "*#{k.upcase}*: #{v}" 
        }.join(" ") : ''

        blocks = [{
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*event*: #{messageable.action} \n #{data_fmt}",
          },
          "block_id": 'replied-1'
        }]

        user = conversation.main_participant

        #user_options.merge!({
        #  username: format_user_name(user),
        #  icon_url: user&.avatar_url
        #})
      end 

      #blocks.prepend({
      #  "type": "section",
      #  "text": {
      #    "type": "mrkdwn",
      #    "text": "*#{part.authorable.name}* (#{part.authorable.model_name.human}) sent a message"
      #  }
      #})

      provider_channel_id = conversation.conversation_channels
      .find_by(provider: 'slack')&.provider_channel_id

      return if provider_channel_id.blank?
      
      response = post_message(
        "new message", 
        blocks.as_json,
        user_options.merge!({
          channel: @keys['channel'],
          thread_ts: provider_channel_id,
        })
      )

      response_data = json_body(response)

      return unless response_data["ok"]

      part.conversation_part_channel_sources.create(
        provider: 'slack', 
        message_source_id: response_data["ts"] 
      )
    end

    def format_user_name(user)
      display = [user.display_name, user.email].join(" · ")
      "#{display} · (#{user.model_name.human})"
    end

    def blocks_transform(part)

      blocks = JSON.parse(
        part.messageable.serialized_content
      )["blocks"].map{ |o| process_block(o) }.compact rescue []

      blocks
    end

    def process_block(block)
      res = case block["type"]
      when "unstyled"
        return nil if block['text'].blank?

        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": block['text']
          },
          "block_id": block["key"]
        }
      when "divider"
        {
			    "type": "divider"
		    }
      when "image"
        image_url = block['data']['url']
        image_url  = "#{ENV['HOST']}#{block['data']['url']}" unless block['data']['url'].include?("://")
        {
          "type": "image",
          "title": {
            "type": "plain_text",
            "text": "image1",
            "emoji": true
          },
          "image_url": image_url,
          "alt_text": "image1"
        }
      when 'file'
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*File sent*: <#{ENV['HOST']}#{block["data"]["url"]}|go to file>"
          },
          "block_id": block["key"]
        }
      when "header-one", "header-two", "header-three", "header-four"
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*#{block['text']}*"
          },
          "block_id": block["key"]
        } 
      else
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": block['text']
          },
          "block_id": block["key"]
        }
      end
    end

    def post_data(url, data)
      response = @conn.post do |req|
        req.url url
        req.headers['Content-Type'] = 'application/json; charset=utf-8'
        req.body = data.to_json
      end
      response
    end

    def get_data(url, data)
      response = @conn.get(url, data)
    end

    def sync_messages_without_channel(conversation)
      
      parts = conversation.messages.includes(:conversation_part_channel_sources)
      .where.not(conversation_part_channel_sources: {
        provider: 'slack'
      }).or(
        conversation.messages.includes(:conversation_part_channel_sources)
        .where(conversation_part_channel_sources: {
          conversation_part_id: nil
        })
      )

      channel = conversation.conversation_channels.find_by(
        provider: "slack"
      )


      parts.each do |part|
        notify_message(
          conversation: conversation , 
          part: part, 
          channel: channel.provider_channel_id
        )
      end
    end


    ### serialization to dante format

    def serialize_content(data)

      if data.keys.include?("files") 
        images = data["files"]
        o = attachment_block(data)
      else
        o = process_blocks(data)
      end

    end

    def process_blocks(data)
      images = data['blocks'].select{ |o| 
        o['type'] === 'image' 
      }.map do |block|
        media_block( 
          {
            url: block["image_url"],
            w: block["image_width"],
            h: block["image_height"],
            title: block["alt_text"],
            mimetype: 'image/'
          })
      end

      { blocks: [
          serialized_block(data['text']), 
          images
        ].flatten.compact
      }.to_json
    end

    def attachment_block(data)
      files = data["files"].map{|o|
    
        begin
          url = direct_upload(
            o['url_private_download'], 
            o["mimetype"]
          ) 
        rescue => e
          puts e.message
          puts e.backtrace
          return nil
        end

        {
          url: url,
          w: o["original_w"],
          h: o["original_h"],
          title: o["title"],
          mimetype: o["mimetype"]
        }
      }

      serialized_blocks = files.compact.map{|o| 
        media_block( o ) 
      }

      lines = data['text'].split("\n").delete_if(&:empty?) 
      text_blocks = lines.map{|o| serialized_block(o)}

      {
        "blocks": [ text_blocks, serialized_blocks ].flatten.compact,
        "entityMap":{}
      }.to_json
    end

    def media_block(data)
      params = data.slice(:url, :title, :w, :h)
      return photo_block(params) if data[:mimetype].include?("image/")
      return file_block(url: data[:url], text: data[:title]) 
    end

    def direct_upload(url, content_type=nil)
      authorize_bot!
      file = StringIO.new(get_data(url, {}).body)
      blob = ActiveStorage::Blob.create_after_upload!(
        io: file,
        filename: File.basename(url),
        content_type: content_type || "image/jpeg"
      )
      Rails.application.routes.url_helpers.rails_blob_path(blob)
    end

  end
end