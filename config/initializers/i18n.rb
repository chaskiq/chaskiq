module I18nJS
  def self.translations
    ::I18n.backend.send(:init_translations)
    ::I18n.backend.send(:translations)
  end
end