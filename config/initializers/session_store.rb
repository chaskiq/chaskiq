Rails.application.config.session_store :cookie_store, 
  key: '_chaskiq_session', 
  secure: Chaskiq::Config.get("host").to_s.include?("https") or Rails.env.production? 
