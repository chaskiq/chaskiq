# frozen_string_literal: true

require 'rails_helper'
require 'roo'
# require "#{Rails.root.join('app/importers').join('list_importer.rb')}"

describe 'ListImporter' do
  let(:spreadsheet_data) do
    arr = []
    arr << ['email', ' name ', 'last name', 'Department', 'Manager']
    (1..2).each do |_o|
      arr << [Faker::Internet.email,
              Faker::Name.name,
              Faker::Name.name,
              Faker::Company.bs,
              Faker::Nation.nationality]
    end
    arr
  end

  let(:spreadsheet_data_with_errors) do
    [
      ['List of Lists'],
      ['Name', 'Birth Date', 'Department', 'Manager'],
      ['John Doe', '2013-10-25', 'IT'],
      %w[Invalid 2013-10-24 Management],
      %w[Invalid 2013-10-24 Accounting],
      ['Jane Doe', '2013-10-26', 'Sales']
    ]
  end

  let(:importer) { ListImporter.new('/dummy/file') }

  let(:app) do
    App.create(name: 'foo', domain_url: 'http://ggg.cc')
  end

  before do
    allow(Roo::Spreadsheet).to receive(:open).at_least(:once).and_return Spreadsheet.new(spreadsheet_data)
    ListImporter.instance_variable_set(:@fetch_model_block, nil)
    ListImporter.instance_variable_set(:@sheet_index, nil)
    ListImporter.transactional(false)
  end

  it 'imports all data from the spreadsheet into the model' do
    expect { ListImporter.import('/dummy/file', params: { app_id: app.id }) }.to change(AppUser, :count).by(2)
    # expect { ListImporter.import('/dummy/file') }.to change(List, :count).by(2)
  end
end
