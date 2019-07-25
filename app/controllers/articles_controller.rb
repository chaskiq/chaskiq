class ArticlesController < ApplicationController

  layout "articles"

  def show
    render html: "", layout: true, layout: "articles"
  end

end
