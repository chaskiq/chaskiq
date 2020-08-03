# frozen_string_literal: true

class Role < ApplicationRecord
  belongs_to :agent
  belongs_to :app

  acts_as_taggable_on :access

  delegate :id, to: :agent, prefix: 'agent'
  delegate :avatar_url, to: :agent
  delegate :email, to: :agent
  delegate :name, to: :agent
  delegate :display_name, to: :agent

  delegate :first_name, to: :agent
  delegate :last_name, to: :agent
  delegate :country, to: :agent
  delegate :country_code, to: :agent
  delegate :region, to: :agent
  delegate :region_code, to: :agent
  delegate :avatar_url, to: :agent
  delegate :lang, to: :agent
  delegate :available, to: :agent
  delegate :sign_in_count, to: :agent
  delegate :last_sign_in_at, to: :agent
  delegate :invitation_accepted_at, to: :agent
  delegate :invitation_sent_at, to: :agent


  scope :admin, -> { where('role =?', 'admin') }
end
