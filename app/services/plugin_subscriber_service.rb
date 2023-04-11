require "faraday"
require "json"

class PluginSubscriberService
  def initialize(api_key: nil, base_id: nil, table_name: nil)
    @api_key = api_key || Chaskiq::Config.get("AIRTABLE_API_KEY")
    @base_id = base_id || Chaskiq::Config.get("AIRTABLE_BASE_ID")
    @table_name = table_name || Chaskiq::Config.get("AIRTABLE_TABLE_NAME")
    @connection = Faraday.new("https://api.airtable.com/v0/#{@base_id}/#{@table_name}") do |conn|
      conn.headers["Authorization"] = "Bearer #{@api_key}"
      conn.headers["Content-Type"] = "application/json"
      conn.request :url_encoded
      conn.response :logger
      conn.adapter Faraday.default_adapter
    end
  end

  def list_rows
    response = @connection.get
    JSON.parse(response.body)["records"]
  end

  def get_row(row_id)
    response = @connection.get(row_id)
    JSON.parse(response.body)
  end

  def create_row(fields)
    response = @connection.post do |req|
      req.body = JSON.generate({ fields: fields })
    end
    JSON.parse(response.body)
  end

  def delete_row(row_id)
    response = @connection.delete(row_id)
    JSON.parse(response.body)
  end

  def update_row(row_id, fields, partial: false)
    http_method = partial ? :patch : :put
    response = @connection.send(http_method, row_id) do |req|
      req.body = JSON.generate({ fields: fields })
    end
    JSON.parse(response.body)
  end

  def find_row_by_field(field_name, field_value)
    encoded_field_value = URI.encode_www_form_component(field_value)
    response = @connection.get("?filterByFormula=({#{field_name}}='#{encoded_field_value}')")
    records = JSON.parse(response.body)["records"]
    records.empty? ? nil : records.first
  end
end

# Here's an example of how to use the client:
#
# client = AirtableClient.new(api_key, base_id, table_name)
#
# List rows
# rows = client.list_rows
# puts "List rows:"
# puts rows
#
# Create row
# new_row = client.create_row({ "Name": "John Doe", "Email": "john.doe@example.com" })
# puts "Created row:"
# puts new_row
#
# Find row by field
# found_row = client.find_row_by_field("Email", "john.doe@example.com")
# puts "Found row by field:"
# puts found_row
#
# Update row
# updated_row = client.update_row(found_row['id'], { "Name": "John Doe Updated" }, true)
# puts "Updated row:"
# puts updated_row
#
# Delete row
# deleted_row = client.delete_row(updated_row['id'])
# puts "Deleted row:"
# puts deleted_row
# Replace 'your_api_key', 'your_base_id', and 'your_table_name' with the appropriate values for your Airtable account and base. Make sure to install the 'faraday' gem if you haven't already:
#
# Copy code
# gem install faraday
# Please note that this example assumes you have a table with "Name" and "Email" fields. You will need to adjust the field names and values based on your specific Airtable base schema.
#
#
#
#
#
