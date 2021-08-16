require "draftjs_exporter/html"
require "draftjs_exporter/entities/link"

class DraftConvert
  def self.perform(blocks)
    mapper.call(blocks)
  end

  def self.mapper
    DraftjsExporter::HTML.new(
      entity_decorators: {
        "LINK" => DraftjsExporter::Entities::Link.new(className: "markup--anchor")
      },
      block_map: {
        "header-one" => { element: "h1", className: "graf graf--h2" },
        "header-two" => { element: "h2", className: "graf graf--h3" },
        "header-three" => { element: "h3", className: "graf graf--h4" },
        "header-four" => { element: "h4", className: "graf graf--h5" },
        "blockquote" => { element: "blockquote", className: "graf graf--blockquote" },
        "code-block" => { element: "pre", className: "graf graf--code" },
        "unordered-list-item" => {
          element: "li", className: "graf graf--insertunorderedlist",
          wrapper: ["ul", { className: "public-DraftStyleDefault-ul" }]
        },
        "ordered-list-item" => {
          element: "li", className: "graf graf--insertorderedlist",
          wrapper: ["ul", { className: "public-DraftStyleDefault-ul" }]
        },
        "unstyled" => { element: "div", className: "graf graf--p" },
        "file" => { render: file_proc },
        "image" => { render: image_proc },
        "giphy" => { render: image_proc },
        "embed" => { render: embed_proc },
        "video" => { render: video_proc },
        "recorded-video" => {
          render: recorded_video_proc
        }

      },
      style_map: {
        "ITALIC" => { fontStyle: "italic" },
        "BOLD" => { fontStyle: "bold" },
        "CODE" => { fontStyle: "" }
      }
    )
  end

  def self.image_proc
    lambda do |document, block|
      image_url = block.fetch(:data, {}).fetch(:url, "")
      image_width = block.fetch(:data, {}).fetch(:width, "100%")
      image_height = block.fetch(:data, {}).fetch(:height, "100%")
      image_ratio = block.fetch(:data, {}).fetch(:ratio, "100")
      image_direction = block.fetch(:data, {}).fetch(:direction, "")
      caption = block[:text]

      default_style = "max-width=#{image_width};max-height=#{image_height}"

      html = %(
        <div>
          <div class="aspectRatioPlaceholder is-locked" style="#{default_style}">
            <div
              class="aspect-ratio-fill"
              style="padding-bottom: '#{image_ratio}%'"
            ></div>
            <img src="#{image_url}" width="#{image_width}" height="#{image_height}" />
          </div>
        </div>

        <figcaption class="imageCaption">
          <span>
            <span data-text="true">#{caption}</span>
          </span>
        </figcaption>
      )

      block[:text] = ""
      figure = document.create_element("figure")
      figure[:class] = "graf graf--figure"
      figure.add_child(html)
      figure
    end
  end

  def self.video_proc
    lambda do |document, block|
      images = block.fetch(:data, {}).fetch(:images, "")
      title = block.fetch(:data, {}).fetch(:title, "")
      html = block.dig(:data, :embed_data, :html)

      description = block.fetch(:data, {}).fetch(:description, "")
      provider_url = block.fetch(:data, {}).fetch(:provider_url, "")
      provisory_text = block.fetch(:data, {}).fetch(:provisory_text, "")

      fig = %(
        <figcaption class="imageCaption">
          <div class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
            <span>
              <span>#{provisory_text}</span>
            </span>
          </div>
        </figcaption>
      )

      html = %(
        <figure
          class="graf--figure graf--iframe graf--first"
          tabIndex="0"
        >
          <div class="iframeContainer">
            #{html}
          </div>
          #{fig}
        </figure>
      )

      block[:text] = ""
      figure = document.create_element("div")
      figure[:class] = "graf graf--mixtapeEmbed"
      figure.add_child(html)
      figure
    end
  end

  def self.embed_proc
    lambda do |document, block|
      embed_data = block.dig(:data, :embed_data)
      images = embed_data.fetch(:images, [])
      title = embed_data.fetch(:title, "")
      description = embed_data.fetch(:description, "")
      provider_url = embed_data.fetch(:provider_url, "")
      provisory_text = block.fetch(:data, {}).fetch(:provisory_text, "")

      image_element = if images[0] && images[0][:url]
                        %{
        <a target="_blank"
          rel="noopener noreferrer"
          class="js-mixtapeImage mixtapeImage"
          href="#{provider_url}"
          style="background-image: url(#{images[0][:url]})">
        </a>
      }
                      else
                        ""
                      end

      html = %(
        <span>
          #{image_element}
          <a
            class="markup--anchor markup--mixtapeEmbed-anchor"
            target="_blank"
            rel="noopener noreferrer"
            href="#{provisory_text}"
          >
            <strong class="markup--strong markup--mixtapeEmbed-strong">
              #{title}
            </strong>
            <em class="markup--em markup--mixtapeEmbed-em">
              #{description}
            </em>
          </a>
          #{provider_url}
        </span>
      )

      block[:text] = ""
      figure = document.create_element("div")
      figure[:class] = "graf graf--mixtapeEmbed"
      figure.add_child(html)
      figure
    end
  end

  def self.recorded_video_proc
    lambda do |document, block|
      url = block.fetch(:data, {}).fetch(:url, "")
      text = block.fetch(:data, {}).fetch(:text, "")

      html = %(
        <div className="iframeContainer">
          <video
            autoPlay="false"
            style="width:'100%'"
            controls="true"
            src="#{url}"
          ></video>
        </div>
        <figcaption className="imageCaption">
          <div className="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
            <span>#{text}</span>
          </div>
        </figcaption>
      )

      block[:text] = ""
      figure = document.create_element("div")
      figure[:class] = "graf--figure graf--iframe graf--first"
      figure.add_child(html)
      figure
    end
  end

  def self.file_proc
    lambda do |document, block|
      image_url = block.fetch(:data, {}).fetch(:url, "")
      image_direction = block.fetch(:data, {}).fetch(:url, "")
      caption = block[:text]

      html = %(
        <a
          href="#{image_url}"
          rel="noopener noreferrer"
          target="blank"
          class="flex items-center border rounded bg-gray-800 border-gray-600 p-4 py-2"
        >
          #{block[:text]}
        </a>
      )

      block[:text] = ""
      figure = document.create_element("div")
      figure.add_child(html)
      figure
    end
  end
end
