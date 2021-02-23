class UpdateBotTasks < ActiveRecord::Migration[6.1]

  class OldBotTasks < ApplicationRecord
    self.table_name = "bot_tasks"
    self.inheritance_column = nil
    has_many :metrics, ->{where(trackable_type: 'BotTask')} , foreign_key: 'trackable_id'
  end

  def up
    begin
      OldBotTasks.find_each do |task|
        bt = BotTask.new
        bt.app_id = task.app_id
        bt.name = task.title
        bt.segments = task.predicates
        bt.settings = task.settings
        bt.paths = task.paths
        bt.state = task.state
        bt.user_type = task.type

        bt.save

        task.metrics.find_each do |m|
          metric = bt.metrics.new 
          metric.assign_attributes(m.dup.attributes)
          metric.trackable_id = bt.id
          metric.trackable_type = 'Message'
          metric.created_at = m.created_at
          metric.updated_at = m.updated_at
          metric.save
        end

      rescue ActiveRecord::StatementInvalid
      end
    end
  end

  def down
    # BotTask.destroy_all
    puts "nothing to do"
  end
end
