class Apps::SegmentsController < ApplicationController
  before_action :find_app
  before_action :find_segments

  layout "application"

  def index
    @segment = @segments.first
    redirect_to app_segment_path(@app.key, @segment)
  end

  def show
    @segment = @segments.find(params[:id])
    # @segment = @app.segments.new

    defaults = [
      {
        type: "match",
        attribute: "match",
        comparison: "and",
        value: "and"
      },
      {
        type: "string",
        attribute: "type",
        comparison: "in",
        value: [
          "AppUser"
        ]
      }
    ]

    @segment_manager = SegmentManagerService.new(
      app: @app,
      predicates: @segment.predicates # resource_params_custom
    )
    # resource_params = search.require(:data).permit(
    #		predicates: [:attribute, :comparison, :type, :value, { value: [] }]
    #		)

    @app_users = @segment_manager.results(params)
  end

  def edit
    @segment = @segments.find(params[:id])
  end

  def update
    @segment = @segments.find(params[:id])

    if params[:options] === "new"
      flash.now[:notice] = t("common.create_success_message")
      params[:segment][:name]
      if @app.segments.create(
        name: params[:segment][:name],
        predicates: JSON.parse(params[:segment][:predicates])
      )

        @segments = @app.segments

        render turbo_stream: [
          flash_stream,
          turbo_stream.replace(
            "navigator-segment",
            partial: "apps/segments/navigator"
          )
        ]
      end

    elsif @segment.update(predicates: JSON.parse(params[:segment][:predicates]))
      flash.now[:notice] = t("common.update_success_message")
      render turbo_stream: [flash_stream]
    # redirect_to app_team_index_path(@app.key), notice: "epa!", status: 303
    else
      render "edit", status: :unprocessable_entity
    end
  end

  def edit_segment
    @segment = @segments.find(params[:id])

    resource_params = params[:segment_manager_service].permit!
    @segment_manager = SegmentManagerService.new(app: @app)
    @segment_manager.segment_predicates = resource_params["segment_predicate"]

    @segment_manager.handle_new_segment = params["new_segment"] if params["new_segment"].present?

    turbo_views = [
      turbo_stream.replace(
        "segment_form",
        partial: "apps/segment_manager/form",
        locals: {
          segment_manager: @segment_manager,
          changed: @segment.predicates.to_json != @segment_manager.predicates.to_json,
          incomplete: @segment_manager.predicates.any? { |o| o.value.nil? },
          url_form: edit_segment_app_segment_path(@app.key, @segment)
        }
      )
    ]

    unless @segment_manager.predicates.find { |o| o.value.nil? }
      turbo_views << turbo_stream.replace(
        "segment-table",
        partial: "apps/segment_manager/table",
        locals: {
          app: @app,
          segment_manager: @segment_manager,
          results: @segment_manager.results(params)
        }
      )
    end

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_views
      end
      format.html # { redirect_to "/" }
    end
  end

  private

  def find_segments
    @segments = Segment.union_scope(
      @app.segments.all, Segment.where(app_id: nil)
    ).order("id asc")
  end
end
