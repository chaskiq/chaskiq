# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Agent, type: :model do

  let(:app) do
    FactoryBot.create :app
  end

  let!(:role){
    app.add_agent({email: 'test@test.cl', first_name: 'dsdsa'})
  }

  describe "inbound email" do

    it "mailbox" do
      puts role.inbound_email_address
      expect(role.inbound_email_address).to be_present 
    end

    it "mailbox" do
      puts role.inbound_email_address
      role.decode_inbound_address(role.inbound_email_address)
      expect(role.inbound_email_address).to be_present 
    end
  end
end
