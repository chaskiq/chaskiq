class Avatar::Component < ViewComponent::Base
  option :src
  option :app
  option :indicator, default: -> { false }
  option :size, default: -> { "small" }
  option :classes
  option :alt
  option :avatar_kind
  option :palette

  # <%= render(AvatarComponent.new(src: 'path_to_image.jpg', app: @app_state)) %>

  def size_class_name
    case size
    when "small"
      "h-6 w-6"
    when "medium"
      "h-8 w-8"
    when "large"
      "h-10 w-10"
    when "full"
      "w-full h-full"
    else
      if size.is_a?(Numeric)
        "h-#{size} w-#{size}"
      else
        "h-6 w-6"
      end
    end
  end

  def resolved_palette
    palette || app&.avatar_settings&.[]("palette") || "264653,2a9d8f,e9c46a,f4a261,e76f51"
  end

  def avatar_kind
    return @avatar_kind if @avatar_kind

    app&.avatar_settings&.dig("style") || "marble"
  end

  def encoded_name
    CGI.escape(alt)
  end
end
