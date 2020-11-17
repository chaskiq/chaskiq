YAML_PLANS ||= YAML.load(
    File.open(	Rails.root.join("config/subscriptions.yml")))
    .with_indifferent_access
    .dig("subscriptions", "plans")