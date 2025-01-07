CHASKIQ_FRAME_VERIFIER = ActiveSupport::MessageVerifier.new(
  Chaskiq::Config.get('SECRET_KEY_BASE').to_s, 
  digest: "SHA256", url_safe: true)
CHASKIQ_VERIFIER = CHASKIQ_FRAME_VERIFIER