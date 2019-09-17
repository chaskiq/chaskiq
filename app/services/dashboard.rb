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
  end

  def browser
    @app.visits.group(:browser_name, :browser_version).count
  end

end