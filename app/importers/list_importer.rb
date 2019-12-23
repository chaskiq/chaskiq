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
    @row_count = 0
  end

  on :row_processed do
    if @app.add_user(email: row.delete('email'), properties: row)
      @row_count += 1
    end
  end

  on :row_error do |_err|
    send_notification('Data imported successfully!')
  end

  on :import_finished do
    send_notification('Data imported successfully!')
  end

  on :import_failed do |exception|
    send_notification("Fatal error while importing data: #{exception.message}")
  end

  private

  def send_notification(message)
    puts message
  end
end
