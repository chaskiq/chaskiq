# frozen_string_literal: true

class ImportMailer < ApplicationMailer
    def notify(app:, agent:)
      @app          = app
      @agent        = agent
      from_email    = "notifications@#{@app.outgoing_email_domain}"
  
      subject = 'Your CSV import is complete'

      mail(from: "Chaskiq notifications <#{from_email}>",
           to: @agent.email,
           subject: subject) do |format|
        format.html { render 'import_mailer/notify' }
        # format.text # assuming you want a text fallback as well
      end
    end
  end