module Chaskiq
  class ListImporter < ActiveImporter::Base
    imports Subscriber

    column 'email', :email
    column 'name', :name

    fetch_model do
      Chaskiq::Subscriber.where(email: row['email']).first_or_initialize
    end

    on :row_processing do
      [row.keys - columns.keys].flatten.each do |k|
        key = k.gsub(" ", "-").underscore
        next if key.empty?
        model.options[k.gsub(" ", "-").underscore ] = row[k] 
      end
    end

    on :import_started do
      @list = Chaskiq::List.find(params[:list_id])
      @row_count = 0
    end

    on :row_processed do
      if model.errors.blank? && model.subscriptions.where(list: @list).blank?
        model.subscriptions.create(list: @list) 
      end
      @row_count += 1
    end

    on :row_error do |err| 
      send_notification("Data imported successfully!")
    end

    on :import_finished do
      send_notification("Data imported successfully!")
    end

    on :import_failed do |exception|
      send_notification("Fatal error while importing data: #{exception.message}")
    end

  private

    def send_notification(message)
      puts message
    end

  end
end