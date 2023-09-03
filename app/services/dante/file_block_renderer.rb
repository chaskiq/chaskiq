class Dante::FileBlockRenderer
  def initialize(block_key:, data:, domain: nil)
    @block_key = block_key
    @data = data
    @domain = domain
  end

  def render
    url, caption = @data.values_at(:url, :caption)
    file_url = get_url(url, @domain)
    file_name = get_file_name_from_url(file_url)

    figure = <<~HTML
      <figure id="#{@block_key}" class="graf graf--figure">
        <a href="#{file_url}" target="blank" class="flex items-center border rounded text-sm text-gray-100 bg-gray-500 border-gray-600 p-2 py-2">
          <i class="fa fa-file"></i>
          #{file_name}
        </a>
        #{caption_html(caption)}
      </figure>
    HTML

    figure.strip
  end

  private

  def get_url(url, domain)
    domain ? "#{domain}#{url}" : url
  end

  def get_file_name_from_url(url)
    URI.parse(url).path.split("/").last
  rescue StandardError
    url.split("/").last
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
