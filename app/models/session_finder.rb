module SessionFinder
  def self.get_by_cookie_session(value)
    return if value.blank?

    begin
      CHASKIQ_VERIFIER.verify(value, purpose: :login)
    rescue ActiveSupport::MessageVerifier::InvalidSignature
      nil
    end
  end
end
