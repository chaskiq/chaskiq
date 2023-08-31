class Dante::EmbedBlockRenderer
  def initialize(block_key:, data:)
    @block_key = block_key
    @data = data
  end

  def render
    embed_data = @data[:embed_data]

    html = <<~HTML
      <div class="graf graf--mixtapeEmbed">
        <span contenteditable="false">
          #{picture_html(embed_data)}
          #{anchor_html(embed_data)}
          <span>#{embed_data[:provider_url] || embed_data[:url]}</span>
        </span>
      </div>
    HTML

    html.strip
  end

  private

  def picture(embed_data)
    embed_data.dig(:images, 0, :url)
  end

  def class_for_image(embed_data)
    image = embed_data[:images].first
    return "" unless image

    "height-#{image[:height]} width-#{image[:width]}"
  end

  def picture_html(embed_data)
    return "" unless picture(embed_data)

    <<~HTML
      <a target="_blank" class="js-mixtapeImage mixtapeImage #{class_for_image(embed_data)}"
         href="#{embed_data[:url]}" style="background-image: url('#{picture(embed_data)}')" rel="noreferrer"></a>
    HTML
  end

  def anchor_html(embed_data)
    <<~HTML
      <a class="markup--anchor markup--mixtapeEmbed-anchor" target="_blank" href="#{embed_data[:url]}" rel="noreferrer">
        <strong class="markup--strong markup--mixtapeEmbed-strong">#{embed_data[:title]}</strong>
        <em class="markup--em markup--mixtapeEmbed-em">#{embed_data[:description]}</em>
      </a>
    HTML
  end
end
