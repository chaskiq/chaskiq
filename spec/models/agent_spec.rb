# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Agent, type: :model do
  let(:app) do
    FactoryBot.create :app
  end

  let!(:role) do
    app.add_agent({ email: 'test@test.cl', first_name: 'dsdsa' })
  end

  describe 'inbound email' do
    it 'mailbox' do
      expect(role.inbound_email_address).to be_present
    end

    it 'mailbox' do
      app, agent = App.decode_inbound_address(role.inbound_email_address)
      expect(app).to be_present
      expect(agent).to be_present
    end
  end
end
