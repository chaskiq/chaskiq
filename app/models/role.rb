# frozen_string_literal: true

class Role < ApplicationRecord
  include AuditableBehavior

  belongs_to :agent
  belongs_to :app
  acts_as_taggable_on :access

  store_accessor :properties, %i[write_access read_access all_access]

  delegate :id, to: :agent, prefix: "agent"
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
  delegate :enable_deliveries, to: :agent

  delegate :permissions, to: :agent
  delegate :conversations, to: :agent
  delegate :area_of_expertise, to: :agent
  delegate :specialization, to: :agent
  delegate :phone_number, to: :agent
  delegate :address, to: :agent
  delegate :availability, to: :agent

  scope :admin, -> { where("role =?", "admin") }

  def inbound_email_address
    part = URLcrypt.encode(agent.id.to_s)
    domain = app.outgoing_email_domain
    "inbound+#{app.key}+#{part}@#{domain}"
  end
end
