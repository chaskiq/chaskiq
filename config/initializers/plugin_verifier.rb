CHASKIQ_FRAME_VERIFIER = ActiveSupport::MessageVerifier.new(Chaskiq::Config.get('SECRET_KEY_BASE').to_s, digest: "SHA256")
