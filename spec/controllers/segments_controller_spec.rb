require 'rails_helper'

RSpec.describe SegmentsController, type: :controller do

  # This should return the minimal set of attributes required to create a valid
  # Segment. As you add validations to Segment, be sure to
  # adjust the attributes here as well.
  let(:valid_attributes) {
    {
      predicates: [{attribute: "last_visited_at", 
                    comparison: "gteq", 
                    type: "date", 
                    value: "1 days ago"
                  }.with_indifferent_access]
    }
  }

  let(:invalid_attributes) {
    {
      predicates: [{attributex: "last_visited_at", 
                    comparisonx: "gteq", 
                    typex: "date", 
                    valuex: "1 days ago"
                  }.with_indifferent_access]
    }
  }

  # This should return the minimal set of values that should be in the session
  # in order to pass any filters (e.g. authentication) defined in
  # SegmentsController. Be sure to keep this updated too.
  let(:valid_session) { {} }

  let!(:app){
    FactoryGirl.create :app
  }

  describe "GET #index" do
    it "returns a success response" do
      app.segments.create! valid_attributes
      get :index, params: {app_id: app.key}, session: valid_session
      expect(response).to be_success
    end

    it "returns a success response json" do
      app.segments.create! valid_attributes
      get :index, params: {format: :json, app_id: app.key}, session: valid_session
      expect(response).to be_success
    end

  end

  describe "GET #show" do
    it "returns a success response" do
      segment = app.segments.create! valid_attributes
      get :show, params: {id: segment.to_param, app_id: app.key}, session: valid_session
      expect(response).to be_success
    end

    it "returns a success response json" do
      segment = app.segments.create! valid_attributes
      get :show, params: {format: :json, id: segment.to_param, app_id: app.key}, session: valid_session
      expect(response).to be_success
    end

  end

  describe "GET #new" do
    it "returns a success response" do
      get :new, params: {app_id: app.key}, session: valid_session
      expect(response).to be_success
    end
  end

  describe "GET #edit" do
    it "returns a success response" do
      segment = app.segments.create! valid_attributes
      get :edit, params: {id: segment.to_param, app_id: app.key}, session: valid_session
      expect(response).to be_success
    end
  end

  describe "POST #create" do
    context "with valid params" do
      it "creates a new Segment" do
        expect {
          post :create, params: {app_id: app.key, segment: valid_attributes}, session: valid_session
        }.to change(Segment, :count).by(1)
      end

      it "redirects to the created segment" do
        post :create, params: {app_id: app.key, segment: valid_attributes}, session: valid_session
        expect(response).to be_redirect #_to(Segment.last)
      end

      it "redirects to the created segment json" do
        post :create, params: {format: :json, app_id: app.key, segment: valid_attributes}, session: valid_session
        expect(response).to be_success #_to(Segment.last)
      end

    end

    context "with invalid params" do
      it "returns a success response (i.e. to display the 'new' template)" do
        post :create, params: {app_id: app.key, segment: invalid_attributes}, session: valid_session
        expect(response).to be_successful
      end

      it "returns a success response json" do
        post :create, params: {format: :json, app_id: app.key, segment: invalid_attributes}, session: valid_session
        expect(response.status).to be == 422
      end

    end
  end

  describe "PUT #update" do
    context "with valid params" do
      let(:new_attributes) {

        {
          predicates: [{attribute: "last_visited_at", 
                        comparison: "gteq", 
                        type: "date", 
                        value: "1 days ago"
                      }.with_indifferent_access,
                      {attribute: "country", 
                        comparison: "eq", 
                        type: "string", 
                        value: "chile"
                      }.with_indifferent_access,
                    ]
        }

      }

      it "updates the requested segment" do
        segment = app.segments.create! valid_attributes
        put :update, params: {app_id: app.key, id: segment.to_param, segment: new_attributes}, session: valid_session
        segment.reload
        expect(app.segments.first.predicates.count).to be == 2
      end

      it "redirects to the segment" do
        segment = app.segments.create! valid_attributes
        put :update, params: {app_id: app.key, id: segment.to_param, segment: valid_attributes}, session: valid_session
        expect(response).to be_redirect #_to(:show)
      end
    end

    context "with invalid params" do
      it "returns a success response (i.e. to display the 'edit' template)" do
        segment = app.segments.create! valid_attributes
        put :update, params: {app_id: app.key, id: segment.to_param, segment: invalid_attributes}, session: valid_session
        expect(response).to be_success
      end

      it "returns a success response json" do
        segment = app.segments.create! valid_attributes
        put :update, params: {format: :json, app_id: app.key, id: segment.to_param, segment: invalid_attributes}, session: valid_session
        expect(response.status).to be == 422
      end
    end
  end

  describe "DELETE #destroy" do
    it "destroys the requested segment" do
      segment = app.segments.create! valid_attributes
      expect {
        delete :destroy, params: {app_id: app.key, id: segment.to_param}, session: valid_session
      }.to change(Segment, :count).by(-1)
    end

    it "redirects to the segments list" do
      segment = app.segments.create! valid_attributes
      delete :destroy, params: {app_id: app.key, id: segment.to_param}, session: valid_session
      expect(response).to be_redirect #_to(:index)
    end
  end

end
