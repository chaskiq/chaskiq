require 'app_packages_catalog'

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
      o.owner = Agent.find_by(email: ENV['ADMIN_EMAIL'])
      o.save
    end
  end
end

namespace :upgrade_tasks do
  task predicates: :environment do
    Message.all.each do |c|
      next if c.segments.nil?

      segments = c.segments.compact.map do |o|
        if o['attribute'] == 'type'
          o.merge!({
                     'comparison' => 'in',
                     'value' => o['value'].is_a?(Array) ? o['value'] : [o['value']].flatten
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
        if o['attribute'] == 'type'
          o.merge!({
                     'comparison' => 'in',
                     'value' => o['value'].is_a?(Array) ? o['value'] : [o['value']].flatten
                   })
        else
          o
        end
      end.compact

      c.update(predicates: segments)
    end
  end
end
