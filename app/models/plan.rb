class Plan
  include ActiveModel::Model
  attr_accessor :name, :stripe_id, :id, :features, :description

  def self.all
    path = Rails.root.join("config/subscriptions.yml")
    template = ERB.new File.new(path).read
    processed = YAML.load template.result(binding)
    processed.with_indifferent_access.dig("subscriptions", "plans")
  end

  def self.free
    get("free")
  end

  def self.get(name)
    all.find { |o| o[:name] == name }
  end

  def self.get_by_id(id)
    all.find { |o| o[:id] == id }
  end

  def features=(f)
    @features = f.map { |o| Feature.new(o) }
  end

  def enabled?(feature)
    f = get_feature(feature)
    return true if f.blank?

    f&.active?
  end

  def limit_reached?(feature, count)
    c = get_feature(feature)&.count
    return false if c === "unlimited"

    count >= count
  end

  def get_feature(feature)
    @features.find { |f| f.name == feature }
  end

  def allow_feature!(feature)
    return true if Chaskiq::Config.get("SUBSCRIPTIONS_ENABLED") != "true"
    raise PlanError, { code: feature, message: "plan not meet on #{feature}" }.to_json unless enabled?(feature)
  end

  class PlanError < StandardError
    def initialize(msg = "Plan not meet")
      super
    end
  end

  class Feature
    include ActiveModel::Model
    attr_accessor :name, :active, :count

    def active?
      @active
    end
  end
end
