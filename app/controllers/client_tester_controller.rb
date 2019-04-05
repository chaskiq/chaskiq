require 'nokogiri'
class ClientTesterController < ApplicationController

  layout "client"
  
  def show

    #html = `curl 
    url = "https://www.wikidata.org/wiki/Wikidata:Main_Page"
    html = Net::HTTP.get(URI.parse(url))
    doc = Nokogiri::HTML(html)
    @html = doc.css("body").to_html

  end
end
