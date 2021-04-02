# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BotTask, type: :model do
  let(:app) do
    FactoryBot.create :app
  end

  let(:app_user) do
    app.add_user(email: 'test@test.cl', first_name: 'dsdsa')
  end

  let(:new_conversation_bot) do
    app.bot_tasks.create(
      title: 'foo',
      scheduling: 'inside_office',
      bot_type: 'new_conversations'
    )
  end

  let(:new_conversation_bot_outside) do
    app.bot_tasks.create(
      title: 'foo',
      scheduling: 'outside_office',
      bot_type: 'new_conversations',
      state: 'enabled'
    )
  end

  describe 'for new conversations' do
    it 'collection check' do
      bot = new_conversation_bot
      expect(bot).to be_persisted
      expect(app.bot_tasks.for_new_conversations).to be_any
      expect(app.bot_tasks.enabled.for_new_conversations).to be_blank
    end

    it 'bots for app new conversations' do
      tasks = app.bot_tasks.get_welcome_bots_for_user(app_user, true)
      expect(tasks).to be_nil
    end

    describe 'enabled inside office' do
      before :each do
        new_conversation_bot.update(state: 'enabled')
      end

      it 'will return for inside office' do
        tasks = app.bot_tasks.get_welcome_bots_for_user(app_user, true)
        expect(tasks).to be_present
      end

      it 'will not return for inside office' do
        tasks = app.bot_tasks.get_welcome_bots_for_user(app_user, false)
        expect(tasks).to be_nil
      end

      it 'will return anyway for inside office on nil availability' do
        tasks = app.bot_tasks.get_welcome_bots_for_user(app_user, nil)
        expect(tasks).to be_present
      end
    end

    describe 'enabled outside office' do
      it 'will not return for inside office' do
        new_conversation_bot_outside
        tasks = app.bot_tasks.get_welcome_bots_for_user(app_user, true)
        expect(tasks).to be_nil
      end

      it 'will return for outside office' do
        new_conversation_bot_outside
        tasks = app.bot_tasks.get_welcome_bots_for_user(app_user, false)
        expect(tasks).to be_present
      end

      it 'will return for nil' do
        new_conversation_bot_outside
        tasks = app.bot_tasks.get_welcome_bots_for_user(app_user, nil)
        expect(tasks).to be_present
      end
    end
  end
end
