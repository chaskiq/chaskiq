class UpdateBotTasks < ActiveRecord::Migration[6.1]

  class OldBotTasks < ApplicationRecord
    self.table_name = "bot_tasks"
    self.inheritance_column = nil
    has_many :metrics, ->{where(trackable_type: 'BotTask')} , foreign_key: 'trackable_id'
  end

  def up
    OldBotTasks.find_each do |task|
      bt = BotTask.new
      bt.app_id = task.app_id
      bt.name = task.title
      bt.segments = task.predicates
      bt.settings = task.settings
      bt.paths = task.paths
      bt.state = task.state
      bt.user_type = task.type

      if bt.save
        task.metrics.update_all(
          trackable_id: bt.id,
          trackable_type: 'Message'
        )
      end
    end
  end

  def down
    # BotTask.destroy_all
    puts "nothing to do"
  end
end
