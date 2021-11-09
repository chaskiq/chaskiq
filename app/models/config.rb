class Config

  attr_accessor :config

  def initialize(config: {})
    @config = config
  end

  def get(name)
    #config[name] || ENV[name.upcase]
    Rails.application.credentials.config.fetch(name.to_sym, ENV[name.to_s.upcase])
  end

  def fetch(name, fallback)
    Rails.application.credentials.config.fetch(name.to_sym, ENV[name.to_s.upcase])
    #config[name] || ENV.fetch(name.upcase, fallback)
  end
end