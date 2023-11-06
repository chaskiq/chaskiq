# frozen_string_literal: true

class WidgetsController < ApplicationController
  include ActionView::Helpers::AssetUrlHelper

  protect_from_forgery except: [:show, :new_embed]

  def show
    respond_to do |format|
      format.js { redirect_to widget_javascript_source("embed.js") }
    end
  end

  def new_embed
    respond_to do |format|
      format.js { redirect_to widget_javascript_source("new_embed.js") }
    end
  end

  private

  def widget_javascript_source(embed)
    ActionController::Base.helpers.compute_asset_path(embed, debug: true)
  end
end
