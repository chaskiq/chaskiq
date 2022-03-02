# frozen_string_literal: true

require "pp"
require "oauth2"

module MessageApis::Slack
  class Api
    include MessageApis::Helpers

    BASE_URL = "https://slack.com"
    HEADERS = { "content-type" => "application/json" }.freeze # Suggested set? Any?

    attr_accessor :key, :secret, :access_token, :keys, :client, :base_url

    def initialize(config: {})
      @access_token = access_token
      @conn = Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }

      @package = nil
      set_keys(config)
    end

    def set_keys(config)
      @keys = {}
      @keys["channel"] = Rails.env.development? ? "chaskiq_channel-local4" : "chaskiq_channel"
      @keys["consumer_key"] = config["api_key"]
      @keys["consumer_secret"] = config["api_secret"]
      @keys["access_token"] =  config["access_token"]
      @keys["access_token_secret"] = config["access_token_secret"]
      @keys["user_token"] = config["user_token"]
      @keys["channel_id"] = config["channel_id"]
      @keys["slack_channel_id"] = config["slack_channel_id"] || config["channel_id"]
      @keys["slack_channel_id_leads"] = config["slack_channel_id_leads"] || @keys["slack_channel_id"]
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
      # TODO: here create the configured channel and join it
    end

    def after_authorize
      chan1 = @package.settings["slack_channel_name"]
      chan2 = @package.settings["slack_channel_name_leads"]

      # will create 2 channels here for dual mode
      {
        slack_channel_id: chan1,
        slack_channel_id_leads: chan2
      }.each do |k, v|
        next if v.empty?

        channel_id = handle_channel_creation(v)
        if channel_id
          new_settings = @package.settings.merge({ k => channel_id })
          @package.update(settings: new_settings)
        end
      end
    end

    def get_api_access
      @base_url = BASE_URL

      {
        access_token: @keys["access_token"],
        access_token_secret: @keys["access_token_secret"]
      }.with_indifferent_access
    end

    def authorize_bot!
      get_api_access
      @conn.request :authorization, :Bearer, @keys["access_token"]
    end

    def authorize_user!
      get_api_access
      @conn.request :authorization, :Bearer, @keys["access_token_secret"]
    end

    def oauth_client
      @oauth_client ||= OAuth2::Client.new(
        @keys["consumer_key"],
        @keys["consumer_secret"],
        site: "https://slack.com",
        authorize_url: "/oauth/v2/authorize",
        token_url: "/api/oauth.v2.access"
      )
    end

    def user_client; end

    def url(url)
      "#{BASE_URL}#{url}"
    end

    def post_message(message, blocks, options = {})
      path = "/api/chat.postMessage"
      api_post(path, message, blocks, options)
    end

    def update_message(message, blocks, options = {})
      path = "/api/chat.update"
      api_post(path, message, blocks, options)
    end

    def api_post(path, message, blocks, options = {})
      authorize_bot!

      data = {
        channel: options[:channel] || @keys["channel"],
        text: message,
        blocks: blocks
      }

      data.merge!(options) if options.present?

      @conn.post do |req|
        req.url url(path)
        req.headers["Content-Type"] = "application/json; charset=utf-8"
        req.body = data.to_json
      end

      # Rails.logger.info response.body
      # Rails.logger.info response.status
    end

    def handle_channel_creation(name = nil, user_ids = "")
      response = create_channel(name, user_ids)
      if !response["error"] && (chann_id = response.dig("channel", "id"))
        authorize_user!
        join_channel(chann_id)
        chann_id
      elsif response["error"].present? && response["error"] == "name_taken"
        response = find_channel(name)
        if response.present?
          join_channel(response["id"])
          response["id"]
        end
      end
    end

    def create_channel(name = nil, user_ids = "")
      authorize_bot!

      data = {
        name: name || @keys["channel"],
        user_ids: user_ids
      }

      url = url("/api/conversations.create")

      response = @conn.post do |req|
        req.url url
        req.headers["Content-Type"] = "application/json; charset=utf-8"
        req.body = data.to_json
      end

      # Rails.logger.info response.body
      JSON.parse(response.body)
    end

    def find_channel(name)
      authorize_bot!
      url = url("/api/conversations.list")
      response = @conn.get(url, { name: name })
      data = JSON.parse(response.body)
      data["channels"].find { |o| o["name"] == name } if data["ok"] && data["channels"].any?
    end

    def join_channel(id)
      data = {
        channel: id
      }

      url = url("/api/conversations.join")
      # @conn.request :authorization, :Bearer, key
      response = @conn.post do |req|
        req.url url
        req.headers["Content-Type"] = "application/json; charset=utf-8"
        req.body = data.to_json
      end

      JSON.parse(response.body)
    end

    def resolve_channel_id(user)
      if user.type == "AppUser"
        @keys["slack_channel_id"]
      else
        @keys["slack_channel_id_leads"]
      end
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
      when "conversations.assigned", "conversations.prioritized", "conversations.started",
        "conversations.added", "conversations.closed", "conversations.reopened"
        update_thread_head(subject)
        # when "conversations.added" then notify_added(subject)
      end
    end

    def notify_added(conversation)
      authorize_bot!

      data = thread_head(conversation)

      response_data = json_body(
        post_message(
          "New conversation from Chaskiq",
          data.flatten.compact.as_json,
          {
            channel: resolve_channel_id(conversation.main_participant), # @keys["channel"],
            text: "New conversation from Chaskiq"
          }
        )
      )

      return unless response_data["ok"]

      conversation.conversation_channels.create({
                                                  provider: "slack",
                                                  provider_channel_id: response_data["ts"]
                                                })
    end

    def update_thread_head(conversation, slack_id = nil)
      authorize_bot!

      data = thread_head(conversation)

      ts_id = slack_id || conversation.conversation_channels.where(
        provider: "slack"
      ).last&.provider_channel_id

      return if ts_id.blank?

      response_data = json_body(
        update_message(
          "New conversation from Chaskiq",
          data.flatten.compact.as_json,
          {
            channel: resolve_channel_id(conversation.main_participant), # @keys["channel_id"],
            text: "New conversation from Chaskiq",
            ts: ts_id
          }
        )
      )
    end

    def thread_head(conversation)
      text_blocks = conversation.messages.map do |part|
        part.messageable_type == "ConversationPartBlock" ? replied_block(part) : blocks_transform(part)
      end

      participant = conversation.main_participant

      base = "#{Chaskiq::Config.get('HOST')}/apps/#{conversation.app.key}"
      conversation_url = "#{base}/conversations/#{conversation.key}"
      user_url = "#{base}/users/#{conversation.key}"
      links = "*<#{user_url}|#{format_user_name(conversation.main_participant)}>* <#{conversation_url}|view in chaskiq>"

      data = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Conversation initiated by #{links}"
          }
        },

        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: "*Info:* #{participant.display_name} #{participant.email}"
            },
            {
              type: "mrkdwn",
              text: "*From:* #{participant.city}, #{participant.region} "
            },
            {
              type: "mrkdwn",
              text: "*When:* #{I18n.l(conversation.created_at, format: :short)}"
            },
            {
              type: "mrkdwn",
              text: "*Seen:* #{participant.last_visited_at ? I18n.l(participant.last_visited_at, format: :short) : 'unknown'}"
            },
            {
              type: "mrkdwn",
              text: "*Assignee:* #{assignee_display(conversation.assignee) || 'Unassigned'}"
            },
            {
              type: "mrkdwn",
              text: "*Device:*\n#{participant.browser} #{participant.browser_version} / #{participant.os}"
            },

            {
              type: "mrkdwn",
              text: "*From:*\n<#{participant.referrer} | URL: #{participant.referrer}>"
            }

          ]
        },

        conversation_status_blocks(conversation),

        {
          type: "divider"
        },

        {
          type: "section",
          block_id: "section678",
          text: {
            type: "mrkdwn",
            text: "Pick an agent and assign them to the conversation"
          },
          accessory: {
            action_id: "pick-agent",
            type: "external_select",
            placeholder: {
              type: "plain_text",
              text: "Select an item"
            },
            min_query_length: 3
          }
        },

        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "Message"
            }
          ]
        }
      ]

      data << text_blocks unless text_blocks.empty?

      data << [
        {
          type: "divider"
        },

        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "To reply just reply on a thread"
            }
          ]
        }
      ]

      data.flatten!
    end

    def conversation_status_blocks(conversation)
      state_action = if conversation.opened?
                       action_button(value: "close", text: "Close", style: nil)
                     else
                       action_button(value: "open", text: "Open", style: nil)
                     end

      priority_action = if conversation.priority
                          action_button(value: "unprioritize", text: "UnPrioritize", style: "danger")
                        else
                          action_button(value: "prioritize", text: "Prioritize", style: "primary")
                        end

      avatar_action = conversation&.assignee&.avatar_url

      avatar_action_block = if avatar_action
                              {
                                type: "image",
                                image_url: avatar_action,
                                alt_text: assignee_display(conversation.assignee)
                              }
                            end

      [
        {
          type: "actions",
          elements: [
            state_action,
            priority_action
          ]
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "Priority: #{conversation.priority ? 'YES' : 'NO'}"
            },

            {
              type: "mrkdwn",
              text: "State: #{conversation.state}"
            },

            {
              type: "image",
              image_url: "https://api.slack.com/img/blocks/bkb_template_images/task-icon.png",
              alt_text: "Task Icon"
            },
            {
              type: "mrkdwn",
              text: "Task"
            },
            avatar_action_block,
            {
              type: "mrkdwn",
              text: (assignee_display(conversation.assignee) || "Unassigned").to_s #  "<fakelink.toUser.com|Michael Scott>"
            }
          ].compact
        }
      ]
    end

    def action_button(value:, text:, style: nil)
      {
        type: "button",
        text: {
          type: "plain_text",
          emoji: true,
          text: text
        },
        value: value
      }.merge(confirm_block).tap do |hash|
        hash[:style] = style if style
      end
    end

    def confirm_block
      {
        confirm: {
          title: {
            type: "plain_text",
            text: "Are you sure?"
          },
          text: {
            type: "mrkdwn",
            text: "This action will change the state of the conversation"
          },
          confirm: {
            type: "plain_text",
            text: "Do it"
          },
          deny: {
            type: "plain_text",
            text: "Stop, I've changed my mind!"
          }
        }
      }
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
            type: "section",
            text: {
              type: "mrkdwn",
              text: "a new Lead! #{user.name}"
            }
          },
          {
            type: "divider"
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Close",
                  emoji: true
                },
                value: "click_me_123"
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Reply in channel",
                  emoji: true
                },
                value: "click_me_123"
              }
            ]
          }
        ]
      )
    end

    # this call process event in async job
    def enqueue_process_event(params, package)
      @package = package

      return handle_challenge(params) if challenge?(params)

      if params["payload"]
        data = JSON.parse(params[:payload])
        case data["type"]
        when "block_suggestion"
          case data["action_id"]
          when "pick-agent"
            return users_options(data["value"])
          end

          # when "block_actions"
          #  handle_external_select_action(data)
        end
      end

      # process_event(params, package)
      HookMessageReceiverJob.perform_later(
        id: package.id,
        params: params.permit!.to_h
      )
    end

    def process_event(params, package)
      @package = package
      handle_incoming_action(params) if params["payload"]
      handle_incoming_event(params) if params["event"]
    end

    def users_options(value)
      agents = @package.app.agents.ransack(email_cont: value).result.limit(5)
      {
        options: agents.map do |u|
          {
            text: {
              type: "plain_text",
              text: "#{u.name} #{u.email}"
            },
            value: u.id.to_s
          }
        end
      }
    end

    # handles actions from slack buttons
    def handle_incoming_action(data)
      data = JSON.parse(data["payload"])

      if data["type"] == "block_actions"
        action = data["actions"]&.first
        return if action.blank?

        slack_ts = data["message"]["ts"]
        conversation = find_conversation_by_slack_ts(slack_ts)

        case action["value"]
        when "open"
          conversation.reopen! unless conversation.opened?
        when "close"
          conversation.close! unless conversation.closed?
        when "prioritize", "unprioritize"
          conversation.toggle_priority
        else
          case action["type"]
          when "external_select"
            handle_external_select_action(action, conversation)
          end
        end
        # this is not neccessary since the events will end executing a trigger ending delivering to slack
        # update_thread_head(conversation.reload, slack_ts)
      end
    end

    def handle_external_select_action(action, conversation)
      case action["action_id"]
      when "pick-agent"
        value = action["selected_option"]["value"]
        agent = @package.app.agents.find(value)
        conversation.assign_user(agent)
      end
    end

    def handle_incoming_event(params)
      event = params["event"]
      Rails.logger.info "processing slack event type: #{event['type']}"
      case event["type"]
      when "message" then process_message(event)
      end
    end

    def find_conversation_by_slack_ts(id)
      @package.app.conversations
              .joins(:conversation_channels)
              .where(
                "conversation_channels.provider =? AND
        conversation_channels.provider_channel_id =?",
                "slack", id
              ).first
    end

    def process_message(event)
      # TODO: add a conversation_event_type for this type
      return if event["subtype"] === "channel_join"
      return if event["thread_ts"].blank?
      return if event["text"] === "New conversation from Chaskiq"

      conversation = find_conversation_by_slack_ts(event["thread_ts"])

      return if conversation.blank?

      return if conversation.conversation_part_channel_sources
                            .find_by(message_source_id: event["ts"]).present?

      serialized_blocks = serialize_content(event)

      text = replace_emojis(event["text"])

      # TODO: serialize message
      conversation.add_message(
        from: get_agent_from_event(event),
        message: {
          html_content: text,
          serialized_content: serialized_blocks
        },
        provider: "slack",
        message_source_id: event["ts"],
        check_assignment_rules: true
      )
    end

    def get_agent_from_event(event)
      authorize_bot!
      url = url("/api/users.info")
      response = get_data(url, { user: event["user"] })
      user_email = JSON.parse(response.body)["user"]["profile"]["email"]
      agent = @package.app.agents.find_by(email: user_email)
      agent || @package.app.agents.first
    rescue StandardError
      @package.app.agents.first
    end

    def get_slack_user_by_email(email)
      authorize_bot!
      url = url("/api/users.lookupByEmail")
      response = get_data(url, { email: email })
      user = JSON.parse(response.body)["user"]
    rescue StandardError
      nil
    end

    def handle_challenge(params)
      params[:challenge]
    end

    def challenge?(params)
      params.keys.include?("challenge")
    end

    def oauth_authorize(app, package)
      oauth_client.auth_code.authorize_url(
        user_scope: "chat:write,channels:history,channels:write,groups:write,channels:read,groups:read,mpim:read,im:read",
        scope: "files:read,channels:history,channels:join,chat:write,channels:read,channels:manage,chat:write.customize,users:read,users:read.email",
        redirect_uri: package.oauth_url
      )
    end

    def receive_oauth_code(params, package)
      code = params[:code]

      headers = {
        accept: "application/json",
        content_type: "application/json"
      }

      token = oauth_client.auth_code.get_token(
        code,
        redirect_uri: package.oauth_url,
        token_method: :post
      )

      token_hash = token.to_hash

      package.update(
        external_id: token_hash["team"]["id"],
        project_id: token_hash["app_id"],
        access_token: token_hash[:access_token],
        access_token_secret: token.to_hash["authed_user"]["access_token"]
      )

      set_keys(
        package.settings.merge!(package.app_package.credentials)
      )

      # this will create the channel or return existing id
      # channel_id =
      # package.message_api_klass.after_authorize
      @package = package
      after_authorize

      # if channel_id
      #  new_settings = package.settings.merge({ "channel_id" => channel_id })
      #  package.update(settings: new_settings)
      #  # else
      #  # TODO: raise error here?
      # end

      true
    end

    # triggered when a new chaskiq message is created
    # will triggered just after the ws notification
    def notify_message(conversation:, part:, channel:)
      # TODO: ? redis cache here for provider / channel id / part
      return if part.conversation_part_channel_sources.find_by(provider: "slack").present?

      blocks = blocks_transform(part)

      messageable = part.messageable

      user_options = {
        username: format_user_name(part.authorable).to_s,
        icon_url: part&.authorable&.avatar_url
      }

      # text = !blocks.blank? ?
      #        blocks.join(" ") :
      #        part.messageable.html_content rescue nil

      if part.messageable.is_a?(ConversationPartBlock)
        return unless messageable.replied?

        data = messageable.data
        data_label = data["label"]

        data_fmt = if data.is_a?(Hash)
                     data.map { |k, v| "#{k.capitalize}: #{v}" }.join("\n")
                   else
                     ""
                   end

        blocks = [{
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*replied*: #{data_label || data_fmt}"
          }
          # block_id: 'replied-1'
        }]

        user = conversation.main_participant

        user_options.merge!({
                              username: format_user_name(user),
                              icon_url: user&.avatar_url
                            })
      end

      if part.messageable.is_a?(ConversationPartEvent)
        data = messageable.data
        data_label = data["label"]

        data_fmt = if data.is_a?(Hash)
                     data.reject { |k, v| v.blank? or ["id"].include?(k) }
                         .map do |k, v|
                       "*#{k.upcase}*: #{v}"
                     end.join(" ")
                   else
                     ""
                   end

        # get slack user
        if part&.message&.action == "assigned" && data["email"].present?
          slack_user = get_slack_user_by_email(data["email"])
          data_fmt << "\n <@#{slack_user['id']}>" if slack_user.present?
        end

        blocks = [{
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*event*: #{messageable.action} \n #{data_fmt}"
          }
          # block_id: 'replied-1'
        }]

        user = conversation.main_participant

        # user_options.merge!({
        #  username: format_user_name(user),
        #  icon_url: user&.avatar_url
        # })
      end

      # blocks.prepend({
      #  "type": "section",
      #  "text": {
      #    "type": "mrkdwn",
      #    "text": "*#{part.authorable.name}* (#{part.authorable.model_name.human}) sent a message"
      #  }
      # })

      provider_channel_id = conversation.conversation_channels
                                        .find_by(provider: "slack")&.provider_channel_id

      return if provider_channel_id.blank?

      response = post_message(
        "new message",
        blocks.as_json,
        user_options.merge!({
                              channel: resolve_channel_id(conversation.main_participant), # @keys["channel"],
                              thread_ts: provider_channel_id
                            })
      )

      response_data = json_body(response)

      return unless response_data["ok"]

      part.conversation_part_channel_sources.create(
        provider: "slack",
        message_source_id: response_data["ts"]
      )
    end

    def format_user_name(user)
      display = [user.display_name, user.email].join(" \u00B7 ")
      "#{display} · (#{user.model_name.human})"
    end

    def blocks_transform(part)
      JSON.parse(
        part.messageable.serialized_content
      )["blocks"].map { |o| process_block(o) }.compact
    rescue StandardError
      []
    end

    def replied_block(part)
      data = part.messageable.data
      return nil if data.blank?

      data_label = data["label"]
      data_fmt = if data.is_a?(Hash)
                   data.map { |k, v| "#{k.capitalize}: #{v}" }.join("\n")
                 else
                   ""
                 end
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*replied*: #{data_label || data_fmt}"
        }
        # block_id: 'replied-1'
      }
    end

    def process_block(block)
      res = case block["type"]
            when "unstyled"
              return nil if block["text"].blank?

              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: block["text"]
                }
                # block_id: block['key']
              }
            when "divider"
              {
                type: "divider"
              }
            when "image"
              image_url = block["data"]["url"]
              image_url = "#{Chaskiq::Config.get('HOST')}#{block['data']['url']}" unless block["data"]["url"].include?("://")
              {
                type: "image",
                title: {
                  type: "plain_text",
                  text: "image1",
                  emoji: true
                },
                image_url: image_url,
                alt_text: "image1"
              }
            when "file"
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: "*File sent*: <#{Chaskiq::Config.get('HOST')}#{block['data']['url']}|go to file>"
                }
                # block_id: block['key']
              }
            when "header-one", "header-two", "header-three", "header-four"
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: "*#{block['text']}*"
                }
                # block_id: block['key']
              }
            else
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: block["text"]
                }
                # block_id: block['key']
              }
            end
    end

    def post_data(url, data)
      @conn.post do |req|
        req.url url
        req.headers["Content-Type"] = "application/json; charset=utf-8"
        req.body = data.to_json
      end
    end

    def get_data(url, data)
      response = @conn.get(url, data)
    end

    def sync_messages_without_channel(conversation)
      parts = conversation.messages.includes(:conversation_part_channel_sources)
                          .where.not(conversation_part_channel_sources: {
                                       provider: "slack"
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
          conversation: conversation,
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
      images = data["blocks"]&.select do |o|
        o["type"] === "image"
      end || []

      images = images.map do |block|
        media_block(
          {
            url: block["image_url"],
            w: block["image_width"],
            h: block["image_height"],
            text: block["alt_text"],
            mimetype: "image/"
          }
        )
      end

      { blocks: [
        serialized_block(replace_emojis(data["text"])),
        images
      ].flatten.compact }.to_json
    end

    def attachment_block(data)
      err = nil
      files = data["files"].map do |o|
        begin
          file = handle_direct_upload(
            o["url_private_download"],
            o["mimetype"]
          )
        rescue StandardError => e
          Rails.logger.info e.message
          Rails.logger.info e.backtrace
          err = true
        end

        return nil if err

        {
          url: file[:url],
          w: file[:width],
          h: file[:height],
          text: o["title"],
          mimetype: o["mimetype"]
        }
      end

      serialized_blocks = files.compact.map do |o|
        media_block(o)
      end

      lines = data["text"].split("\n").delete_if(&:empty?)
      text_blocks = lines.map { |o| serialized_block(o) }

      {
        blocks: [text_blocks, serialized_blocks].flatten.compact,
        entityMap: {}
      }.to_json
    end

    def media_block(data)
      params = data.slice(:url, :text, :w, :h)
      return photo_block(**params) if data[:mimetype].include?("image/")

      file_block(url: data[:url], text: data[:text])
    end

    def handle_direct_upload(url, content_type = nil)
      authorize_bot!
      file = StringIO.new(get_data(url, {}).body)

      direct_upload(
        file: file,
        filename: File.basename(url),
        content_type: content_type || "image/jpeg"
      )
    end

    def replace_emojis(text)
      text.gsub(/(:[+-]*\w+:)/) do |m|
        short_name = m.gsub(":", "")
        EmojiData.from_short_name(short_name)&.render || m
      end
    end
  end
end
