class AddTimescale < ActiveRecord::Migration[6.1]
  def change
    enable_extension('timescaledb') unless extensions.include? 'timescaledb'
  end
end
