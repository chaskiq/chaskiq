# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GraphqlController, type: :controller do
  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:user) do
    app.add_user(email: 'test@test.cl')
  end

  let!(:agent)  do
    role = app.add_agent(email: 'test2@test.cl')
    role.agent
  end

  let(:campaign) do
    FactoryBot.create(:campaign, app: app)
  end

  let(:collection) do
    app.article_collections.create(title: 'foo')
  end

  before :each do
    controller.stub(:current_user).and_return(agent)
    allow_any_instance_of(Types::BaseObject).to receive(:current_user).and_return(agent)

    Mutations::BaseMutation.any_instance
                           .stub(:current_user)
                           .and_return(agent)

    allow_any_instance_of(GraphqlController).to receive(:doorkeeper_authorize!).and_return(agent)
    controller.instance_variable_set(:@current_agent, agent)
  end

  context 'find' do
    it 'find articles empty collection' do
      graphql_post(type: 'ARTICLES', variables: {
                     appKey: app.key,
                     page: 1
                   })

      expect(graphql_response.data.app.articles.meta.total_count).to be_zero
    end

    it 'find articles present collection' do
      app.articles.create(title: 'hello world', author: agent)
      graphql_post(type: 'ARTICLES', variables: {
                     appKey: app.key,
                     page: 1
                   })

      expect(graphql_response.data.app.articles.collection).to be_any
    end
  end

  context 'create' do
    it 'create new article' do
      graphql_post(type: 'CREATE_ARTICLE', variables: {
                     appKey: app.key,
                     title: 'ss',
                     content: {
                       serialized: 'aaa',
                       text: 'aaa'
                     }
                   })

      expect(graphql_response.data.createArticle).to be_present
      expect(app.articles).to be_any
    end
  end

  context 'update' do
    it 'create & update article' do
      article = app.articles.create(
        title: 'hello world',
        author: agent,
        article_content_attributes: {
          html_content: 'foo',
          serialized_content: 'foo',
          text_content: 'foo'
        }
      )

      expect(app.articles).to be_any

      graphql_post(type: 'EDIT_ARTICLE', variables: {
                     appKey: app.key,
                     id: article.id.to_s,
                     description: 'foo',
                     title: 'ss',
                     content: {
                       serialized: 'edited!',
                       text: 'edited!'
                     }
                   })

      content = graphql_response.data.editArticle.article.content
      expect(content.serialized_content).to be == 'edited!'

      expect(graphql_response.data.editArticle).to be_present
      expect(app.reload.articles).to be_present
    end
  end

  context 'delete' do
    it 'create & delete article' do
      article = app.articles.create(title: 'hello world', author: agent)

      expect(app.articles).to be_any

      graphql_post(type: 'DELETE_ARTICLE', variables: {
                     appKey: app.key,
                     id: article.id.to_s
                   })

      expect(graphql_response.data.deleteArticle).to be_present

      expect(app.reload.articles).to be_blank
    end
  end

  context 'collections' do
    before :each do
      article = app.articles.create(
        title: 'hello world',
        author: agent,
        article_content_attributes: {
          html_content: 'foo',
          serialized_content: 'foo',
          text_content: 'foo'
        }
      )
    end

    it 'create' do
      graphql_post(type: 'ARTICLE_COLLECTION_CREATE', variables: {
                     appKey: app.key,
                     collectionId: 1,
                     title: 'ss'
                   })

      expect(graphql_response.data.articleCollectionCreate.collection).to be_present
    end

    it 'edit' do
      graphql_post(type: 'ARTICLE_COLLECTION_EDIT', variables: {
                     appKey: app.key,
                     title: 'edited',
                     id: collection.id,
                     description: ''
                   })

      expect(graphql_response.data.articleCollectionEdit.collection).to be_present
      expect(app.article_collections.last.title).to be == 'edited'
    end

    it 'delete' do
      graphql_post(type: 'ARTICLE_COLLECTION_DELETE', variables: {
                     appKey: app.key,
                     id: collection.id
                   })

      expect(graphql_response.data.articleCollectionDelete.collection).to be_present

      expect(app.reload.article_collections).to be_blank
    end

    it 'add article to collection' do
      collection
      expect(app.article_collections).to be_any
      expect(app.article_collections.first.articles).to be_blank

      graphql_post(type: 'CREATE_ARTICLE', variables: {
                     appKey: app.key,
                     title: 'ss',
                     content: {
                       serialized: 'aaa',
                       text: 'aaa'
                     }
                   })

      expect(graphql_response.data.createArticle).to be_present
      expect(app.articles).to be_any

      graphql_post(type: 'ADD_ARTICLES_TO_COLLECTION', variables: {
                     appKey: app.key,
                     collectionId: collection.id,
                     articlesId: [app.articles.last.id.to_s]
                   })

      expect(app.reload.article_collections.first.articles).to be_any
    end
  end

  context 'sections' do
    before :each do
      article = app.articles.create(
        title: 'hello world',
        author: agent,
        article_content_attributes: {
          html_content: 'foo',
          serialized_content: 'foo',
          text_content: 'foo'
        }
      )
    end

    it 'create section' do
      graphql_post(type: 'ARTICLE_SECTION_CREATE', variables: {
                     appKey: app.key,
                     title: 'foo',
                     collectionId: collection.id
                   })

      expect(graphql_response.data.articleSectionCreate).to be_present
    end

    it 'edit section' do
      section = collection.sections.create(title: 'foo')

      graphql_post(type: 'ARTICLE_SECTION_EDIT', variables: {
                     appKey: app.key,
                     collectionId: 1,
                     title: 'edited',
                     id: section.id.to_s,
                     collectionId: collection.id
                   })

      expect(graphql_response.data.articleSectionEdit).to be_present
      expect(section.reload.title).to be == 'edited'
    end

    it 'delete section' do
      section = collection.sections.create(title: 'foo')

      graphql_post(type: 'ARTICLE_SECTION_DELETE', variables: {
                     appKey: app.key,
                     id: section.id.to_s
                   })

      expect(graphql_response.data.articleSectionDelete).to be_present
      expect(collection.reload.sections).to be_empty
    end
  end
end
