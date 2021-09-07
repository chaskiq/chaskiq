# frozen_string_literal: true

class WidgetsController < ApplicationController
  include ActionView::Helpers::AssetUrlHelper
  include Webpacker::Helper

  protect_from_forgery except: :show

  def show
    respond_to do |format|
      format.js {
        redirect_to asset_pack_path("#{widget_javascript_source}.js") 
      }
    end
  end

  private

  def widget_javascript_source
    case params[:id]
    when 'embed', "editor" then params[:id]
    else
      'embed'
    end
  end
end
