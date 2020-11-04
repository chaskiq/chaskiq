# frozen_string_literal: true

require 'roo'

class ListImporter < ActiveImporter::Base
  imports AppUser

  column 'email', :email

  fetch_model do
    # model = @app.app_users.joins(:user).where(["users.email =?", email ]).first_or_initialize
    # AppUser.where(email: row['email']).first_or_initialize
  end

  on :row_processing do
    # [row.keys - columns.keys].flatten.each do |k|
    #  key = k.gsub(" ", "-").underscore
    #  next if key.empty?
    #  model.properties[k.gsub(" ", "-").underscore ] = row[k]
    # end
  end

  on :import_started do
    @app = App.find(params[:app_id])
    @agent = @app.agents.find(params[:agent_id])
    @contact_type = params[:type]
    @row_count = 0
    @tag = "import #{I18n.l(Time.zone.now, format: :short)}"
  end

  on :row_processed do
    meth = @contact_type == "leads" ? 'add_lead' : 'add_user'

    data = row.transform_keys{ |key| key.to_s.parameterize.underscore.to_sym }

    if user = @app.send( meth.to_sym,
        disable_callbacks: true,
        email: row.delete('email'),
        properties: data)

      # add an import tag to contact
      user.tag_list.add(@tag)
      user.save
      
      @row_count += 1 
    end
  end

  on :row_error do |_err|
    send_notification('Data imported successfully!')
  end

  on :import_finished do
    send_notification('Data imported successfully!')

    ImportMailer.notify(
      app: @app,
      agent: @agent
    ).deliver_now
  end

  on :import_failed do |exception|
    send_notification("Fatal error while importing data: #{exception.message}")
  end

  private

  def send_notification(message)
    puts message
  end
end
