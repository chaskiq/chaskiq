class Apps::InboundSettingsController < ApplicationController
  before_action :find_app
  before_action :set_namespace

  def show
    audience_handler
  end

  def update
    if params[:new_segment].blank?

      segment_predicate = resource_params[:inbound_settings_objects][:segment_predicate]
      segment_predicates = begin
        segment_predicate.keys.sort.map { |key| segment_predicate[key].to_h }
      rescue StandardError
        []
      end

      current_segments = @app.inbound_settings
      current_segments[@namespace]["predicates"] = segment_predicates

      if params[:force_save] == "true"
        @app.update(inbound_settings: current_segments)
      else
        @changed = true
        @app.assign_attributes(inbound_settings: current_segments)
      end
    end

    audience_handler

    # @collection = @segment_manager.results(params) unless @segment_manager.predicates.find { |o| o.value.nil? }
  end

  def audience_handler
    @segment_manager = SegmentManagerService.new(
      app: @app,
      predicates: @app.inbound_settings[@namespace]["predicates"] || []
    )

    @segment_manager.handle_new_segment = params["new_segment"] if params["new_segment"].present?

    @collection = @segment_manager.results({
                                             page: params[:page],
                                             per: 5
                                           })
  end

  def set_namespace
    @namespace = params[:id] || "users"
  end

  def resource_params
    params.require(:app).permit(
      inbound_settings_objects: {
        segment_predicate: [
          :type,
          :attribute,
          :comparison,
          { value: [] }, # This permits the value as an array
          :value # This permits the value as a scalar (e.g., string)
        ]
      }
    )
  end
end
