class Apps::InboundSettingsController < ApplicationController
  before_action :find_app

  def show
    @segment_manager = SegmentManagerService.new(app: @app)
    @segment_manager.segment_predicates = {}
    @collection = @segment_manager.results({
                                             page: params[:page],
                                             per: 5
                                           })
  end

  def update
    @segment_manager = SegmentManagerService.new(app: @app)

    if params.dig(:app, :inbound_settings_objects, :segment_predicate)
      resource_params = params.require(:app).permit(inbound_settings_objects: [segment_predicate: %i[type attribute value comparison]])
      @segment_manager.segment_predicates = resource_params.dig(:inbound_settings_objects, :segment_predicate)
    end
    @segment_manager.handle_new_segment = params["new_segment"] if params["new_segment"].present?
    @namespace = "users"

    @collection = @segment_manager.results(params) unless @segment_manager.predicates.find { |o| o.value.nil? }
  end
end
