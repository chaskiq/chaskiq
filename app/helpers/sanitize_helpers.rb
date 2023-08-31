module SanitizeHelpers
  def sanitize_field(input)
    full_sanitizer = Rails::Html::FullSanitizer.new
    full_sanitizer.sanitize(input, tags: %w[a img], attributes: %w[href src])
  end
end
