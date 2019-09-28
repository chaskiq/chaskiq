module Types
  class ConversationPartContentType < Types::BaseObject
    field :serialized_content, String, null: true
    field :html_content, String, null: true
    field :text_content, String, null: true
    field :blocks, Types::JsonType, null: true
    field :state, String, null: true
    field :data, Types::JsonType, null: true

    #methods = [
    #  :serialized_content,
    #  :html_content,
    #  :text_content,
    #  :blocks,
    #  :state,
    #  :data,
    #]


    def serialized_content
      object.serialized_content if object.respond_to?(:serialized_content)
    end
    
    def html_content
      object.html_content if object.respond_to?(:html_content)
    end
    
    def text_content
      object.text_content if object.respond_to?(:text_content)
    end
    
    def blocks
      object.blocks if object.respond_to?(:blocks)
    end
    
    def state
      object.state if object.respond_to?(:state)
    end
    
    def data
      object.data if object.respond_to?(:data)
    end
  end
end
