# frozen_string_literal: true

class AssigneeMailer < ApplicationMailer
  def notify(conversation)
    @conversation = conversation
    @assignee = conversation.assignee
    @app          = conversation.app
    from_email    = "notifications@#{@app.outgoing_email_domain}"

    subject = 'you has been assigned to a conversation on chaskiq'

    mail(from: "Chaskiq notifications <#{from_email}>",
         to: conversation.assignee.email,
         subject: subject) do |format|
      format.html { render 'assignee_mailer/notify' }
      # format.text # assuming you want a text fallback as well
    end
  end
end
