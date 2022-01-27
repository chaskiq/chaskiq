# frozen_string_literal: true

class ChatNotifierMailer < ApplicationMailer
  include Roadie::Rails::Mailer

  def notify(conversation_part)
    headers "X-SES-CONFIGURATION-SET" => Chaskiq::Config.get("SNS_CONFIGURATION_SET")
    headers "X-CHASKIQ-PART-ID" => conversation_part.id

    @conversation_part = conversation_part
    conversation = conversation_part.conversation
    app          = conversation.app
    @app_key = app.key
    @conversation_key = conversation.key
    @app_name = app.name
    @app_logo = app.logo_url

    # admin_users  = app.agents # set assignee !

    message_author = conversation_part.app_user
    @author_name = message_author.display_name || message_author.email.split("@").first
    @author_email = message_author.email
    recipient = if message_author.is_a?(AppUser) && message_author.id == conversation.main_participant.id
                  conversation.assignee
                else
                  conversation.main_participant
                end

    return if recipient.blank?
    return if recipient.is_a?(AppUser) && recipient.unsubscribed?

    @user_id = recipient.id

    content_type  = "text/html"
    from_name     = "#{@author_name} [#{app.name}]"

    raise "no outgoing_email_domain on app" if app.outgoing_email_domain.blank?

    ## TODO: configurability of email
    crypt         = URLcrypt.encode("#{app.id}+#{conversation.id}")
    from_email    = "messages+#{crypt}@#{app.outgoing_email_domain}"
    email         = recipient.email
    subject       = "new message from #{app.name}"
    reply_email   = from_email

    return if email.blank?

    options = { "In-Reply-To" => from_email }

    # get previous 2 message ids
    reference_ids = conversation.messages
                                .order("id desc")
                                .where
                                .not(email_message_id: nil)
                                .limit(2)
                                .map(&:email_message_id)
                                .map { |o| "<#{o}>" }.join(" ")

    options.merge!("References" => reference_ids) if reference_ids.present?
    headers options

    template = recipient.is_a?(Agent) ? "agent_notify" : "notify"

    return if recipient.is_a?(Agent) && (recipient.bot? && !recipient.enable_deliveries)

    from_name_parametrized = from_name.parameterize(separator: " ").capitalize.titleize

    # pick serialized-content or html_content
    @content = begin
      image_rewrite(
        serialized_to_html(@conversation_part.message.serialized_content) ||
        @conversation_part.message.html_content
      )
    rescue StandardError
      nil
    end

    return if @content.nil?

    roadie_mail(from: "#{from_name_parametrized}<#{from_email}>",
                to: email,
                subject: subject,
                content_type: content_type,
                return_path: reply_email) do |format|
      format.html { render "chat_notifier_mailer/#{template}" }
      # format.text # assuming you want a text fallback as well
    end
  end

  # rewrites local uploads to absolute urls
  def image_rewrite(html)
    html.gsub("/rails/active_storage/", "#{Chaskiq::Config.get('HOST')}/rails/active_storage/")
  end

  def serialized_to_html(serialized_content)
    content = JSON.parse(serialized_content)&.with_indifferent_access
    DraftConvert.perform(content)
  rescue StandardError => e
    Rails.logger.error(e)
    Bugsnag.notify(e)
    nil
  end
end
