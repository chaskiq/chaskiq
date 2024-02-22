class MessengerController < ApplicationController
  layout "messenger"

  def show
    @app = App.find_by(key: params[:id])
    if params[:token].present?
      data = CHASKIQ_VERIFIER.verify(params[:token], purpose: :messenger_token)
      @app_user = @app.app_users.find_by(session_id: data[:app_user][:session_id])
      session[:messenger_session_id] = @app_user.session_id
    end

    resolve_contents

    render formats: [:turbo_stream], layout: false if request.headers["Turbo-Frame"]
  end

  def confirm_gdpr
    @app = App.find_by(key: params[:id])
    @app_user = @app.app_users.find_by(session_id: session[:messenger_session_id])
    @app_user.update(privacy_consent: true)

    render turbo_stream: [
      turbo_stream.remove("privacy-consent-prompt")
    ]
  end

  def events
    @app = App.find_by(key: params[:id])
    @app_user = @app.app_users.find_by(session_id: session[:messenger_session_id])

    case params[:event]
    when "send_message" then register_visitor_ping
    when "request_trigger" then request_trigger
    when "get_banners_for_user" then get_banners_for_user(@app_user)
    when "track_click" then track_click(params["messenger"])
    when "track_close" then track_close(params["messenger"])
    when "track_open" then track_open(params["messenger"])
    when "track_tour_finished" then track_tour_finished(params["messenger"])
    when "track_tour_skipped" then track_tour_skipped(params["messenger"])
    when "update_conversation_state" then render_conversation_state(params)
    when "notify_typing" then notify_typing

    end

    head :ok
  end

  # this is the same as message_event_channel#send_message
  def register_visitor_ping
    bundle = params.require(:browser_data).permit(
      :browser_name,
      :browser_version,
      :os,
      :os_version,
      :title
    )

    VisitCollector.new(user: @app_user)
                  .update_browser_data(bundle)

    AppUserEventJob.perform_now(
      app_key: @app.key,
      user_id: @app_user.id
    )
  end

  def request_trigger
    AppUserTriggerJob.perform_now(
      app_key: @app.key,
      user_id: @app_user.id,
      conversation: params[:conversation],
      trigger_id: params[:trigger]
    )
  end

  def tester
    @app = App.find_by(key: params[:id])
    @sessionless = params[:sessionless]
    @json_payload = {}
    @json_payload.merge!(user_options) unless params[:sessionless]

    @encrypted_data = if params[:jwt].present?
                        t = JWE.encrypt(@json_payload.to_json, @app.encryption_key, alg: "dir")
                        t = "'#{t}'"
                      else
                        @json_payload.to_json
                      end

    render "tester", layout: false
  end

  def home_apps
    return @app.visitor_home_apps.to_a if @app_user.is_a?(Visitor)

    @app.user_home_apps.to_a
  end

  def render_conversation_state; end

  def notify_typing
    conversation = @app.conversations.find_by(key: params[:conversation])
    conversation.notify_typing_to_agents
  end

  private

  def get_messages_for_user
    UserAutoMessage.broadcast_message_to_user(@app_user)
  end

  def get_banners_for_user(user)
    Banner.broadcast_banner_to_user(user)
  end

  def needs_privacy_consent
    privacy_consent_required = @app.privacy_consent_required
    user_privacy_consent = @app_user.privacy_consent
    # skip if already consent
    return false if user_privacy_consent
    # skip if privacy consent is none
    return false if privacy_consent_required.blank? || privacy_consent_required == "none"
    # privacy consent on
    return true if privacy_consent_required == "all"

    EuCountries.include?(request&.location&.country_code) if privacy_consent_required == "eu"
  end

  def user_options
    key = @app.encryption_key
    email = "test@test.cl"
    options = {
      email: email,
      properties: {
        name: params[:name] || "miguel",
        lang: params[:lang] || "en",
        id: "localhost",
        country: params[:country] || "chile",
        role: params[:pro] || "admin",
        pro: params[:pro],
        num_devices: params[:num_devices].nil? ? 2 : params[:num_devices].to_i,
        plan: params[:plan] || "pro",
        last_sign_in: params[:last_sign_in] || 2.days.ago
      }
    }
    if params[:jwt].blank?
      options.merge!({
                       identifier_key: OpenSSL::HMAC.hexdigest("sha256", key, email)
                     })
    end
    options
  end

  def resolve_contents
    @agents = @app.agents.where(available: true)
                  .with_attached_avatar.where(bot: nil)
                  .limit(5)

    @app_user = @app.app_users.find_by(session_id: session[:messenger_session_id])

    @home_apps = home_apps

    @latest_conversations = @app_user.conversations.order("updated_at desc").limit(4)

    @needs_privacy_consent = needs_privacy_consent
  end

  def track_open(data)
    @app_user.track_open(
      trackable_id: data["trackable_id"],
      trackable_type: "Message"
    )
  end

  def track_close(data)
    @app_user.track_close(
      trackable_id: data["trackable_id"],
      trackable_type: "Message"
    )
  end

  def track_click(data)
    @app_user.track_click(
      trackable_id: data["trackable_id"],
      trackable_type: "Message"
    )
  end

  def track_tour_finished(data)
    @app_user.track_finish(
      trackable_id: data["trackable_id"],
      trackable_type: "Message"
    )
  end

  def track_tour_skipped(data)
    @app_user.track_skip(
      trackable_id: data["trackable_id"],
      trackable_type: "Message"
    )
  end
end
