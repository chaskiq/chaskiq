# a bug introduced in rails 7 
# read: https://github.com/hotwired/turbo-rails/issues/340

Rails.application.config.after_initialize do |app|
  key_generator = ActiveSupport::KeyGenerator.new app.secret_key_base,
    iterations: 1000,
    hash_digest_class: OpenSSL::Digest::SHA1

  app.message_verifier("ActiveStorage").rotate(key_generator.generate_key("ActiveStorage"))
end