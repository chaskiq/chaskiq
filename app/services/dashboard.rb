class Dashboard 

  attr_accessor :app, :range

  # d = Dashboard.new(app: App.find(n) )
  def initialize(app: , range: )
    @app = app
    @range = (DateTime.parse(range[:from])..DateTime.parse(range[:to]))
  end

  def resource
    app
  end

  def visits
    @app.visits
    .all.group_by_day(:created_at)
    .count.map{|o| 
      {
        "day": o.first.strftime("%F"),
        "value": o.last
      } 
    }
  end

  def browser_name
    @app.visits.group(:browser_name).count
    .map do |k,v| 
      {
        id: k || 'unknown', 
        label: k || 'unknown', 
        value: v, 
        color: "hsl(265, 70%, 50%)"
      } 
    end
  end

  def browser
    @app.visits.group(:browser_name).count
    .map do |k,v| 
      {
        id: k || 'unknown', 
        label: k || 'unknown', 
        value: v, 
        color: "hsl(265, 70%, 50%)"
      } 
    end
  end

  def lead_os
    @app.app_users.leads.group(:os).count
    .map do |k,v| 
      { id: k || 'unknown', 
        label: k || 'unknown', 
        value: v, 
        color: "hsl(265, 70%, 50%)"
      } 
    end
  end

  def user_os
    @app.app_users.group(:os).count
    .map do |k,v| 
      { id: k || 'unknown', 
        label: k || 'unknown', 
        value: v, 
        color: "hsl(265, 70%, 50%)"
      } 
    end
  end

  def user_country
    @app.app_users.group(:country, :city).count
    .map do |k,v| 
      { id: k || 'unknown', 
        label: k || 'unknown', 
        value: v, 
        color: "hsl(265, 70%, 50%)"
      } 
    end
  end

end