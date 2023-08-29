class Dante::AudioRecorderRenderer
  def initialize(block_key:, data:, domain: nil)
    @block_key = block_key
    @data = data
    @domain = domain
  end

  def render
    url, caption = @data.values_at(:url, :caption)
    audio_url = get_url(url, @domain)

    figure = <<~HTML
      <figure id="#{@block_key}" class="graf graf--figure">
        <div>
          <div>
            #{url && "<audio src=\"#{audio_url}\" controls></audio>"}
          </div>
        </div>
        #{caption_html(caption)}
      </figure>
    HTML

    figure.strip
  end

  private

  def get_url(url, domain)
    domain ? "#{domain}#{url}" : url
  end

  def caption_html(caption)
    return "" unless caption && caption != "type a caption (optional)"

    <<~HTML
      <figcaption class="imageCaption">
        <span>
          <span data-text="true">#{caption}</span>
        </span>
      </figcaption>
    HTML
  end
end
