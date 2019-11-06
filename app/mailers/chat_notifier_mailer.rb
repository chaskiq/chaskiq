class ChatNotifierMailer < ApplicationMailer

  def notify(conversation_part)
    @conversation_part = conversation_part
    conversation = conversation_part.conversation
    app          = conversation.app
    #admin_users  = app.agents # set assignee !

    message_author = conversation_part.app_user
    author_name    = message_author.name || message_author.email.split("@").first

    #
    recipient      = message_author.id != conversation.main_participant.id ? 
    conversation.main_participant : conversation.assignee

    content_type  = "text/html"
    from_name     = "#{author_name} [#{app.name}]"
    
    return if recipient.blank?

    ## TODO: configurability of email
    crypt         = URLcrypt.encode("#{app.id}+#{conversation.id}")
    from_email    = "messages+#{crypt}@hermessenger.com"
    email         = recipient.email
    subject       = "new message from #{app.name}"
    reply_email   = from_email

    options = {'In-Reply-To' => from_email}

    # get previous 2 message ids
    reference_ids = conversation.messages
      .order("id desc")
      .where
      .not(email_message_id: nil)
      .limit(2)
      .map(&:email_message_id)
      .map{|o| "<#{o}>"}.join(" ")

    options.merge!( { "References" => reference_ids }) unless reference_ids.blank?
    headers options

    mail( from: "#{from_name}<#{from_email}>",
          to: email,
          subject: subject,
          content_type: content_type,
          return_path: reply_email )
  end
end
