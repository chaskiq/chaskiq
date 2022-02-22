PERMISSION_MANIFEST = YAML.load(
  File.open(Rails.root.join("config/permissions.yml")
  )
).with_indifferent_access.freeze