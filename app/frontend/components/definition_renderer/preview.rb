# frozen_string_literal: true

class DefinitionRenderer::Preview < ApplicationViewComponentPreview
  # You can specify the container class for the default template
  # self.container_class = "w-1/2 border border-gray-300"

  def default

    schema = {
      "kind"=>"configure",
      "definitions"=>[
      {"type"=>"text", "text"=>"Pick a template", "style"=>"header"}, 
      {"type"=>"list", "disabled"=>false, 
        "items"=>[
          {"type"=>"item", "id"=>"user-blocks", "title"=>"UserBlock", "subtitle"=>"Put some user blocks", "action"=>{"type"=>"submit"}}, 
          {"type"=>"item", "id"=>"tag-blocks", "title"=>"TagBlocks", "subtitle"=>"put some TagBlocks", "action"=>{"type"=>"submit"}}, 
          {"type"=>"item", "id"=>"user-properties-block", "title"=>"User Properties", "subtitle"=>"put some ConversationBlock", "action"=>{"type"=>"submit"}}, 
          {"type"=>"item", "id"=>"external-profiles", "title"=>"External Profiles", "subtitle"=>"put some ConversationBlock", "action"=>{"type"=>"submit"}}, 
          {"type"=>"item", "id"=>"assignee-block", "title"=>"AssigneeBlock", "subtitle"=>"put some AssigneeBlock", "action"=>{"type"=>"submit"}}, 
          {"type"=>"item", "id"=>"conversation-events", "title"=>"Conversation Events", "subtitle"=>"put some Events on the sidebar", "action"=>{"type"=>"submit"}}
          ]
        }
      ]
    }

    render_component DefinitionRenderer::Component.new(
      schema: schema["definitions"], 
      size: 'sm', 
      values: {}, 
      location: 'inbox',
      app_package: AppPackage.first
    )
  end
end
