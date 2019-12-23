# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Article, type: :model do
  let(:app) do
    FactoryBot.create :app
  end

  let(:agent) do
    role = app.add_agent(email: 'test@test.cl', first_name: 'dsdsa')
    role.agent
  end

  context 'agent articles' do
    it 'empty articles' do
      expect(agent.articles.count).to be_zero
      expect(app.articles.count).to be_zero
    end

    it 'agent article creation' do
      app.articles.create(title: 'hello world', author: agent)
      expect(app.articles.count).to be == 1
      expect(agent.articles.count).to be == 1
      expect(app.articles.first).to be_draft
    end

    it 'agent article creation publish' do
      app.articles.create(title: 'hello world', author: agent)
      expect(app.articles.count).to be == 1
      expect(app.articles.first).to be_draft
      app.articles.first.publish!
      expect(app.articles.first).to be_published
    end

    it 'agent article creation with content' do
      app.articles.create(
        title: 'hello world',
        author: agent,
        article_content_attributes: {
          serialized_content: '',
          text_content: 'hello'
        }
      )
      expect(app.articles.count).to be == 1
      expect(app.articles.first).to be_draft
      expect(app.articles.first.article_content).to be_present
      expect(app.articles.first.article_content.text_content).to be == 'hello'
    end
  end
end
