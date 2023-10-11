class Dante::VideoBlockRenderer
  def initialize(block_key:, data:)
    @block_key = block_key
    @data = data
  end

  def render
    embed_data, caption = @data.values_at(:embed_data, :caption)
    embed_html = render_embed_html(embed_data)

    figure = <<~HTML
      <figure class="graf--figure graf--iframe graf--first">
        <div class="iframeContainer">
          #{embed_html}
        </div>
        #{caption_html(caption)}
      </figure>
    HTML

    figure.strip
  end

  private

  def render_embed_html(embed_data)
    embed_data[:media] ? embed_data[:media][:html] : embed_data[:html]
  end

  def caption_html(caption)
    return "" unless caption

    <<~HTML
      <figcaption class="imageCaption">
        <span class="danteDefaultPlaceholder">
          #{caption}
        </span>
      </figcaption>
    HTML
  end
end
