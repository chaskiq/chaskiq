require "app_packages_catalog"

namespace :packages do
  task update: :environment do
    AppPackagesCatalog.update_all
  end

  task attach: :environment do
    App.find_each { |a| a.attach_default_packages }
  end
end

namespace :owner_apps do
  task make_owner: :environment do
    # roles owners
    App.all.each  do |o|
      o.owner = Agent.find_by(email: ENV["ADMIN_EMAIL"])
      o.save
    end
  end
end

namespace :upgrade_tasks do
  # migration from bot_task model to bot_tasks < message
  task predicates: :environment do
    Message.all.each do |c|
      next if c.segments.nil?

      segments = c.segments.compact.map do |o|
        if o["attribute"] == "type"
          o.merge!({
                     "comparison" => "in",
                     "value" => o["value"].is_a?(Array) ? o["value"] : [o["value"]].flatten
                   })
        else
          o
        end
      end.compact

      c.update(segments: segments)
    end

    Segment.all.each do |c|
      next if c.predicates.nil?

      segments = c.predicates.compact.map do |o|
        if o["attribute"] == "type"
          o.merge!({
                     "comparison" => "in",
                     "value" => o["value"].is_a?(Array) ? o["value"] : [o["value"]].flatten
                   })
        else
          o
        end
      end.compact

      c.update(predicates: segments)
    end
  end

  task clean_nested_bots: :environment do

    BotTask.find_each do |bot_task|

      next if bot_task.paths.nil?

      bot_task.paths.map do |path|
        
        next if path["steps"].nil?

        path["steps"].map do |step|
          if step.key?("controls")
            new_controls = step["controls"]["schema"].reject{ |o| 
              o.key?("controls") 
            } 
            step.merge!({"controls"=> step["controls"].merge!({ "schema"=> new_controls }) })
            step
          else
            step
          end
        end
      end

      bot_task.save

    end
  end
end




