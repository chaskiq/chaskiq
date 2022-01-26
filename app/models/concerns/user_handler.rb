module UserHandler
  extend ActiveSupport::Concern

  def add_anonymous_user(attrs)
    session_id = attrs.delete(:session_id)
    callbacks = attrs.delete(:disable_callbacks)

    next_id = attrs[:name].presence || "visitor #{DummyName::Name.new}"

    if attrs.dig(:properties, :name).blank?
      attrs.merge!(
        name: next_id.to_s
      )
    end

    ap = app_users.visitors.find_or_initialize_by(session_id: session_id)
    app_user.disable_callbacks = true if callbacks.present?
    ap = handle_app_user_params(ap, attrs)
    ap.generate_token
    ap.save
    ap
  end

  def add_lead(attrs)
    email = attrs.delete(:email)
    callbacks = attrs.delete(:disable_callbacks)
    additional_validations = attrs.delete(:additional_validations)
    ap = app_users.leads.find_or_initialize_by(email: email)
    ap.additional_validations = true if additional_validations
    ap = handle_app_user_params(ap, attrs)
    ap.disable_callbacks = true if callbacks.present?
    data = attrs.deep_merge!(properties: ap.properties)
    ap.generate_token
    ap.save
    ap
  end

  def add_user(attrs)
    email = attrs.delete(:email)
    additional_validations = attrs.delete(:additional_validations)
    callbacks = attrs.delete(:disable_callbacks)
    # page_url = attrs.delete(:page_url)
    ap = app_users.find_or_initialize_by(email: email)
    ap.additional_validations = true if additional_validations
    ap.disable_callbacks = true if callbacks.present?

    ap = handle_app_user_params(ap, attrs)
    ap.last_visited_at = attrs[:last_visited_at] if attrs[:last_visited_at].present?
    ap.subscribe! unless ap.subscribed?
    ap.type = "AppUser"
    ap.save
    ap
  end

  def handle_app_user_params(app_user, attrs)
    attrs = attrs.to_h.with_indifferent_access
    attrs = { properties: attrs } unless attrs.key?(:properties)

    # data keys
    keys = attrs[:properties].keys.map(&:to_sym) & built_in_updateable_fields
    data_keys = attrs[:properties].slice(*keys)

    # custom fields support
    property_keys = attrs[:properties].keys.map(&:to_sym) & custom_field_keys
    property_params = attrs[:properties].slice(*property_keys)

    if property_params.any?
      data = { properties: app_user.properties.merge(property_params) }
      app_user.assign_attributes(data)
    end

    app_user.assign_attributes(data_keys)
    app_user
  end

  def update_properties(app_user, attrs)
    u = handle_app_user_params(app_user, attrs)
    u.save
  end

  def add_agent(attrs, bot: nil, role_attrs: {})
    email = attrs.delete(:email)
    user = Agent.find_or_initialize_by(email: email)
    # user.skip_confirmation!
    if user.new_record?
      user.password = attrs[:password] || Devise.friendly_token[0, 20]
      user.save
    end

    role = roles.find_or_initialize_by(agent_id: user.id, role: role)
    data = attrs.deep_merge!(properties: user.properties)

    user.assign_attributes(data)
    user.bot = bot
    user.save

    # role.last_visited_at = Time.now
    role.assign_attributes(role_attrs)
    role.save
    role
  end

  def add_bot_agent(attrs)
    add_agent(attrs, bot: true)
  end

  def get_non_users_by_session(session_id)
    app_users.non_users.find_by(session_id: session_id)
  end

  def get_app_user_by_email(email)
    app_users.users.find_by(email: email)
  end

  def compare_user_identifier(data)
    return if data.blank?

    ActiveSupport::SecurityUtils.secure_compare(
      OpenSSL::HMAC.hexdigest("sha256", encryption_key, data["email"]),
      data["identifier_key"]
    )
  end

  def create_agent_bot
    add_bot_agent(email: "bot@#{id}-chaskiq", name: "chaskiq bot")
  end

  def add_admin(attrs)
    add_agent(
      {
        email: attrs[:email],
        password: attrs[:password]
      },
      bot: nil,
      role_attrs: { access_list: ["manage"], role: "admin" }
    )
  end

  def add_visit(opts = {})
    add_user(opts.merge(last_visited_at: Time.zone.now))
  end
end
