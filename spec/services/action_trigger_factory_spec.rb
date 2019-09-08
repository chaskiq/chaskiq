
require 'rails_helper'

RSpec.describe ActionTriggerFactory do
  subject { ActionTriggerFactory.new }

  before :each do 
    
    subject.config do |c|
      c.path(
        title: "base path" , 
        steps: [
          c.message(text: "are you an existing customer ?", uuid: 1),
          c.controls(
            uuid: 2, 
            type: "ask_option" , 
            schema: [
              c.button(text: "yes", next_uuid: 2), 
              c.button(text: "no", next_uuid: 4)
            ]
          )
        ],
        follow_actions: [c.assign(10)],
      )

      c.path(
        title: "yes" , 
        steps: [
          c.message(text: "great", uuid: 2)
        ],
        follow_actions: [c.assign(10)],
      )

      c.path(
        title: "no" , 
        steps: [
          c.message(text: "uha", uuid: 4),
          c.controls(
            uuid: "sss",
            type: "data_retrieval",
            schema: [
              c.input(label: "email", placeholder: "email")
            ]
          )
          
        ],
        follow_actions: [c.assign(10)],
      )
      
    end
  end

  it "path" do
    expect(subject.to_obj.paths).to be_any
  end

end