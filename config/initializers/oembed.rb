# frozen_string_literal: true

require 'oembed'
OEmbed::Providers.register_all
OEmbed::Providers.register_fallback(
  OEmbed::ProviderDiscovery,
  OEmbed::Providers::Noembed
)
