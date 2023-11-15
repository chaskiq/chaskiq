class Apps::InboundSettingsController < ApplicationController
  before_action :find_app
  before_action :set_namespace

  def show
    audience_handler
  end

  def update
    if params[:new_segment].blank?
      segment_predicate = params["app"]["inbound_settings_objects_attributes"]["segment_predicate"]
      segment_predicates = begin
        segment_predicate.permit!.keys.sort.map { |key| segment_predicate[key].to_h }
      rescue StandardError
        []
      end

      # first updates everything else
      @app.update(resource_params)

      current_segments = @app.inbound_settings
      current_segments[@namespace]["predicates"] = segment_predicates

      # second attached the new predicates
      @app.update({ inbound_settings: current_segments })
      @app.reload
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

    # @collection = @segment_manager.results({
    #                                         page: params[:page],
    #                                         per: 5
    #                                       })
  end

  def set_namespace
    @namespace = params[:id] || "users"
  end

  def resource_params
    params.require(:app).permit(
      inbound_settings_objects_attributes: {
        users_attributes: %i[
          enabled
          enabled_inbound
          close_conversations_after
          segment
        ],
        visitors_attributes: %i[
          allow_idle_sessions
          idle_sessions_after
          enabled
          enabled_inbound
          close_conversations_after
          segment
        ]
      }
    )
    # params.require(:app).permit(
    #  inbound_settings_objects: [
    #    :users_enabled,
    #    :visitors_enabled,
    #    :users_segment,
    #    :visitors_segment,
    #    segment_predicate: [
    #      :type,
    #      :attribute,
    #      :comparison,
    #      { value: [] }, # This permits the value as an array
    #      :value # This permits the value as a scalar (e.g., string)
    #    ]
    #  ]
    # )
  end
end
