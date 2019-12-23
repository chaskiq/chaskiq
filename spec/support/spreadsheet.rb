# frozen_string_literal: true

class Spreadsheet
  def initialize(data)
    data = { 'Default' => data } unless data.is_a?(Hash)
    @data = data
  end

  def sheets
    @sheets ||= @data.keys
  end

  def default_sheet
    @default_sheet ||= sheets.first
  end

  def default_sheet=(value)
    raise "Invalid sheet '#{value}'" unless sheets.include?(value)

    @default_sheet = value
  end

  def last_row
    @data[default_sheet].count
  end

  def row(index)
    @data[default_sheet][index - 1]
  end
end
