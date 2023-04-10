# frozen_string_literal: true

class AppPackagesCatalog
  def self.default_packages
    collection = %w[
      InboxSections
      ContentShowcase
      ArticleSearch
      Qualifier
      ContactFields
      AuditsReports
      Csat
    ]
  end

  def self.packages(dev_packages: false)
    default_packages
  end

  def self.packages_old(dev_packages: false)
    development_packages = %w[
      UiCatalog
      ExternalExample
    ]

    collection = %w[
      Reveniu
      Gumroad
      Stripe
      Counto
      Clearbit
      FullContact
      OpenAi
      Dialogflow
      Helpscout
      Pipedrive
      Slack
      Twitter
      Zoom
      Whereby
      Cal
      Calendly
      Dailytics
      Twilio
      TwilioPhone
      Vonage
      MessageBird
      Dialog360
      Telegram
      Zapier
      Messenger
      TelnyxSms
    ]

    collection = development_packages + collection if dev_packages
    collection + default_packages
  end

  def self.import
    AppPackage.create(packages)
  end

  def self.update(kind)
    pkg = packages.find { |o| o === kind }
    data = "MessageApis::#{pkg}::Api".constantize.definition_info
    pkg = AppPackage.find_or_create_by(name: data[:name])
    pkg.update(data) if pkg.present?
  end

  def self.update_all(dev_packages: false)
    packages(dev_packages: dev_packages).each do |pkg|
      package = AppPackage.find_or_create_by(name: pkg)
      data = "MessageApis::#{pkg}::Api".constantize.definition_info
      package.update(data)
      Rails.logger.error { "PACKAGE #{package.name} errors: #{package.errors.full_messages.join(', ')}" } if package.errors.any?
    end
  end
end
