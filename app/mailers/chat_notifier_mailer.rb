class ChatNotifierMailer < ApplicationMailer

  def notify(conversation_part)
    @conversation_part = conversation_part
    conversation = conversation_part.conversation
    app          = conversation.app
    admin_users  = app.admin_users # set assignee !

    message_author = conversation_part.app_user
    author_name    = message_author.name || message_author.email.split("@").first

    recipient      = admin_users.ids.include?(message_author.id) ? conversation.main_participant : admin_users.first 
    content_type  = "text/html"
    from_name     = "#{author_name}"
    ## TODO: configurability of email
    from_email    = "messages+#{app.id}+#{conversation.id}@hermessenger.com"
    email         = recipient.email
    subject       = "un test"
    reply_email   = from_email

    headers 'Message-Id' => from_email,
        'In-Reply-To' => from_email

    mail( from: "#{from_name}<#{from_email}>",
          to: email,
          subject: subject,
          content_type: content_type,
          return_path: reply_email )
  end
end
