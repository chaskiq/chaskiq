# frozen_string_literal: true

# from https://framagit.org/framasoft/framapiaf/
require 'http'
require 'oembed'

class FetchLinkCardService < BaseService
  URL_PATTERN = %r{https?://\S+}.freeze

  def call(url)
    # Get first http/https URL that isn't local
    # url = parse_urls(status)
    return if url.nil?

    url = url.to_s

    # card = PreviewCard.where(status: status).first_or_initialize(status: status, url: url)
    card = PreviewCard.find_or_initialize_by(url: url)
    # TODO: add a TTL here
    return card if card.persisted?

    res = http_client.head(url, ssl: { verify_mode: OpenSSL::SSL::VERIFY_NONE })

    return if res.code != 200 || res.mime_type != 'text/html'

    if o = attempt_oembed(card, url)
      return o
    else
      return attempt_opengraph(card, url)
    end
  end

  def http_client(options = {})
    timeout = { write: 10, connect: 10, read: 10 }.merge(options)

    HTTP.headers(user_agent: user_agent)
        .timeout(timeout)
        .follow
  end

  private

  def user_agent
    @user_agent ||= "#{HTTP::Request::USER_AGENT} (Hermesapp/Crawler; +http://github.com/michelson/hermesapp/)"
  end

  def parse_urls(status)
    if status.local?
      urls = status.text.match(URL_PATTERN).to_a.map { |uri| Addressable::URI.parse(uri).normalize }
    else
      html  = Nokogiri::HTML(status.text)
      links = html.css('a')
      urls  = links.map do |a|
        Addressable::URI.parse(a['href']).normalize unless skip_link?(a)
      end .compact
    end
    urls.first
  end

  def skip_link?(a)
    # Avoid links for hashtags and mentions (microformats)
    a['rel'].present? && a['rel'].include?('tag') || a['class'].present? && a['class'].include?('u-url')
  end

  def attempt_oembed(card, url)
    response = OEmbed::Providers.get(url)

    card.type          = response.type
    card.title         = response.respond_to?(:title)         ? response.title         : ''
    card.author_name   = response.respond_to?(:author_name)   ? response.author_name   : ''
    card.author_url    = response.respond_to?(:author_url)    ? response.author_url    : ''
    card.provider_name = response.respond_to?(:provider_name) ? response.provider_name : ''
    card.provider_url  = response.respond_to?(:provider_url)  ? response.provider_url  : ''
    card.width         = 0
    card.height        = 0

    if response.respond_to?(:thumbnail_url)
      image = begin
                download_image(URI.parse(response.thumbnail_url))
              rescue StandardError
                nil
              end
      card.image.attach(image) if image.present?
    end
    # card.url    = response.url
    card.width  = response.width.presence  || 0
    card.height = response.height.presence || 0
    card.html   = response.try(:html)
    # case card.type
    card.save
    card
  rescue OEmbed::NotFound
    false
  end

  def attempt_opengraph(card, url)
    response = http_client.get(url)

    return if response.code != 200 || response.mime_type != 'text/html'

    page = Nokogiri::HTML(response.to_s)

    card.type             = :link
    card.title            = meta_property(page, 'og:title') || page.at_xpath('//title').content
    card.description      = meta_property(page, 'og:description') || meta_property(page, 'description')

    if meta_property(page, 'og:image')
      image = begin
                download_image(meta_property(page, 'og:image'))
              rescue StandardError
                nil
              end
      card.image.attach(image) if image.present?
    end

    return if card.title.blank?

    card.save_with_optional_image!
    card
  end

  def download_image(url)
    handle = open(url)

    file = Tempfile.new("foo-#{Time.now.to_i}", encoding: 'ascii-8bit')
    file.write(handle.read)
    file.close

    new_file = ActionDispatch::Http::UploadedFile.new(
      filename: "foo-#{Time.now.to_i}.jpg",
      type: handle.content_type,
      tempfile: file
    )
  end

  def meta_property(html, property)
    node = html.at_xpath("//meta[@property=\"#{property}\"]")
    return if node.blank?

    node.attribute('content').value || node.attribute('content').value
  end
end
