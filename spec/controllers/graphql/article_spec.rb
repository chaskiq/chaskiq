require 'rails_helper'

RSpec.describe GraphqlController, type: :controller do

  let!(:app){
    FactoryGirl.create(:app)
  }

  let!(:user){
    app.add_user({email: "test@test.cl"})
  }

  let!(:agent){
    role = app.add_agent({email: "test2@test.cl"})
    role.agent
  }

  let(:campaign){
    FactoryGirl.create(:campaign, app: app)
  }

  before :each do 
    Mutations::BaseMutation.any_instance
    .stub(:current_user)
    .and_return(agent)

    allow_any_instance_of(Types::BaseObject).to receive(:current_user).and_return(agent)
  end

  context "find" do 
    it "find articles empty collection" do 

      graphql_post(type: 'ARTICLES', variables: {
        appKey: app.key, 
        #page: 1,
        #filter: nil,
        #sort: nil
      })

      expect(graphql_response.data.app.articles).to be_empty

    end

    it "find articles present collection" do 
      app.articles.create({title: "hello world", author: agent})
      graphql_post(type: 'ARTICLES', variables: {
        appKey: app.key, 
        #page: 1,
        #filter: nil,
        #sort: nil
      })

      expect(graphql_response.data.app.articles).to be_present

    end
  end


  context "create" do
    it "create new article" do
      graphql_post(type: 'CREATE_ARTICLE', variables: {
        appKey: app.key, 
        content: {
          serialized_content: "aaa",
          text_content: "aaa",
        }
      })

      expect(graphql_response.data.createArticle).to be_present
      expect(app.articles).to be_any
    end

  end

  context "update" do

    it "create & update article" do

      article = app.articles.create({title: "hello world", author: agent})

      expect(app.articles).to be_any

      graphql_post(type: 'EDIT_ARTICLE', variables: {
        appKey: app.key, 
        id: article.id,
        content: {
          serialized_content: "edited!",
          text_content: "edited!"
        }
      })
      
      expect(graphql_response.data.editArticle).to be_present
      expect(app.reload.articles).to be_present
    end


  end

  context "delete" do

    it "create & delete article" do

      article = app.articles.create({title: "hello world", author: agent})

      expect(app.articles).to be_any

      graphql_post(type: 'DELETE_ARTICLE', variables: {
        appKey: app.key, 
        id: article.id
      })

      expect(graphql_response.data.deleteArticle).to be_present

      expect(app.reload.articles).to be_blank
    end

  end



end