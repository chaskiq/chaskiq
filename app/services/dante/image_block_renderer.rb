class Dante::ImageBlockRenderer
  def initialize(block_key:, data:, domain: nil)
    @block_key = block_key
    @data = data
    @domain = domain
  end

  def render
    url, src, aspect_ratio, caption = @data.values_at(:url, :src, :aspect_ratio, :caption)

    if aspect_ratio
      height = aspect_ratio[:height]
      width = aspect_ratio[:width]
      ratio = aspect_ratio[:ratio]
    else
      height = "100%"
      width = "100%"
      ratio = "100"
    end

    default_style = "max-width: #{width}px; max-height: #{height}px;"
    direction_class = direction_class(@data[:direction])
    image_url = get_url(url || src, @domain)

    figure = <<~HTML
      <figure id="#{@block_key}" class="graf graf--figure #{direction_class}">
        <div>
          <div class="aspectRatioPlaceholder is-locked" style="#{default_style}">
            <div class="aspect-ratio-fill" style="padding-bottom: #{ratio}%;"></div>
            <img src="#{image_url}" width="#{width}" height="#{height}" class="graf-image medium-zoom-image" alt="#{caption}">
          </div>
        </div>
        #{caption_html(caption)}
      </figure>
    HTML

    figure.strip
  end

  private

  def direction_class(direction)
    case direction
    when "left"
      "graf--layoutOutsetLeft"
    when "wide"
      "sectionLayout--fullWidth"
    when "fill"
      "graf--layoutFillWidth"
    else
      ""
    end
  end

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
