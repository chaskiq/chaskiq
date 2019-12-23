# frozen_string_literal: true

require 'nokogiri'

class LinkRenamer
  def self.convert(html, url_prefix = '')
    content = Nokogiri::HTML(html)
    content.css('a').each do |link|
      if link.attr('class').present? && link.attr('class').include?('tpl-block')
        next
      end

      val = link.attributes['href'].value
      link.attributes['href'].value = rename_link(val, url_prefix)
    end

    # make sure nokogiri does not rips off my mustaches
    content.css('body').inner_html.gsub('%7B%7B', '{{').gsub('%7D%7D', '}}')
  end

  def self.rename_link(value, url_prefix)
    url_prefix.to_s + value
  end
end
