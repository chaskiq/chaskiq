class AppUserTriggerJob < ApplicationJob
  queue_as :default

  # send notification unless it's read
  def perform(app_key:, user_id: )
    @app = App.find_by(key: app_key)
    app_user = @app.app_users.find(user_id)

    key = "#{@app.key}-#{app_user.session_id}"

    MessengerEventsChannel.broadcast_to(key, {
      type: "triggers:receive", 
      data: trigger_generation
    }.as_json) if @app.bot_tasks.any?
  end


  def trigger_generation

    subject = ActionTriggerFactory.new
    subject.config do |c|
      c.path(
        title: "request_for_email" , 
        steps: [
          c.message(text: "#{@app.name} will reply as soon as they can.", uuid: 1),
          c.controls(
            uuid: 2,
            type: "data_retrieval",
            schema: [
              c.input(
                label: "enter your email", 
                name: "email", 
                placeholder: "enter your email"
              )
            ]
          ),
          c.message(text: "molte gratzie", uuid: 3),
        ],
        follow_actions: [c.assign(10)],
      )
    end

    subject

  end



=begin
    {
    id: "alo",
    title: "ask_for_email",
    paths: [
      {"id":"31e992bd-cff3-42ff-9d10-06c891dd58eb",
      "title":"request_for_email",
      "steps":[
        {
          "step_uid":"fde0229a-f9d5-486b-a50b-a97a3dffd38a",
          "type":"messages",
          "messages":[
            {
              "app_user":{
              "display_name":"bot",
              "email":"bot@chaskiq.io",
              "id":1,
              "kind":"agent"
            },
            "serialized_content":"{\"blocks\":[{\"key\":\"9oe8n\",\"text\":\"#{@app.name} will reply as soon as they can.\\n\\n\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"fka2j\",\"text\":\"Give the team a way to reach you:\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
            "html_content":"hola"}
          ]
        },
        {
          "step_uid":"01df0852-523d-4055-9a55-57c8b1b34a89",
          "messages":[],
          "controls":{
            "type":"data_retrieval",
            "schema":[
              {"id":"704abeec-5906-498b-8377-be4852031b08",
                "element":"input",
                "type":"text",
                "placeholder":"enter email",
                "name":"email",
                "label":"enter your email"
              }
            ]
          }
        }
      ]
      }
    ],
    predicates: []
  }
  end
=end
end
