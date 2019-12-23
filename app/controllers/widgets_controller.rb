# frozen_string_literal: true

class WidgetsController < ApplicationController
  include ActionView::Helpers::AssetUrlHelper
  include Webpacker::Helper

  protect_from_forgery except: :show

  def show
    respond_to do |format|
      format.js { redirect_to widget_javascript_source }
    end
  end

  private

  def widget_javascript_source
    asset_pack_path('embed.js')
  end
end
