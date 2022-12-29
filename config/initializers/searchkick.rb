
if c = Chaskiq::Config.get("SEARCHKICK_CLIENT") and c.present?
  Searchkick.client_type = c.to_sym
end