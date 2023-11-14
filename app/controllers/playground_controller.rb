class PlaygroundController < ApplicationController
  def update
    @blocks = JSON.parse(params[:code])
  end
end
