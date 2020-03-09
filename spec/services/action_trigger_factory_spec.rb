# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ActionTriggerFactory do
  subject { ActionTriggerFactory.new }

  let(:app) do
    FactoryBot.create :app
  end

  let(:agent) do
    role = app.add_agent(email: 'test@test.cl', first_name: 'dsdsa')
    role.agent
  end

  before :each do
    subject.config do |c|
      c.path(
        title: 'base path',
        steps: [
          c.message(text: 'are you an existing customer ?', uuid: 1, agent: agent),
          c.controls(
            uuid: 2,
            type: 'ask_option',
            schema: [
              c.button(label: 'yes', next_uuid: 2),
              c.button(label: 'no', next_uuid: 4)
            ]
          )
        ],
        follow_actions: [c.assign(10)]
      )

      c.path(
        title: 'yes',
        steps: [
          c.message(text: 'great', uuid: 2, agent: agent)
        ],
        follow_actions: [c.assign(10)]
      )

      c.path(
        title: 'no',
        steps: [
          c.message(text: 'uha', uuid: 4, agent: agent),
          c.controls(
            uuid: 'sss',
            type: 'data_retrieval',
            schema: [
              c.input(name: 'email', label: 'email', placeholder: 'email')
            ]
          )

        ],
        follow_actions: [c.assign(10)]
      )
    end
  end

  it 'path' do
    expect(subject.to_obj.paths).to be_any
  end
end
