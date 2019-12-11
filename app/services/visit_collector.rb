class VisitCollector 

  attr_accessor :user

  def initialize(user:)
    self.user = user
  end

  def update_browser_data(options)
    user_options = options.reject{|k,v| !self.user.respond_to?(k) }
    user_options.merge!({referrer: options["url"] })
    !add_web_sessions.empty? and user_options.merge!(add_web_sessions)
    self.user.update(user_options)
    self.user.visits.create(options)
  end

  def add_web_sessions
    options = {}

    options.merge!( {
      first_seen: Time.zone.now
    }) if user.first_seen.blank?
    
    options.merge!( {
      last_seen: Time.zone.now
    })

    return options.merge!( { 
      web_sessions: user.web_sessions.to_i + 1,
      last_visited_at: Time.zone.now
    }) if user.last_visited_at.blank?

    # last visited more than 30 minutes
    diff = (Time.zone.now - user.last_visited_at) / 60

    options.merge!( { 
      web_sessions: user.web_sessions.to_i + 1,
      last_visited_at: Time.zone.now
    }) if diff >= 30

    options
  end

end