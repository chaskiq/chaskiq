# frozen_string_literal: true

module Tokenable
  extend ActiveSupport::Concern

  included do
    before_create :generate_token
  end

  protected

  def generate_token
    self.key = loop do
      random_token = SecureRandom.base58(24)
      break random_token unless self.class.exists?(key: random_token)
    end
  end
end
