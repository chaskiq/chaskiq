class AddBotTypeToBotTask < ActiveRecord::Migration[6.1]
  def up
    BotTask.find_each do |b|
      b.update(bot_type: 'outbound') unless b.bot_type.present?
    end
  end

  def down; end
end
