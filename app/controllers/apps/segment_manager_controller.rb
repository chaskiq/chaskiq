class Apps::SegmentManagerController < ApplicationController
	before_action :find_app

	def create
		resource_params = params[:segment_manager_service].permit!
		@segment_manager = SegmentManagerService.new(app: @app)
		@segment_manager.segment_predicates = resource_params["segment_predicate"]

		@segment_manager.handle_new_segment = params["new_segment"] if params["new_segment"].present?

		turbo_views = [
			turbo_stream.replace(
				"segment_form", 
				partial: "form", 
				locals: { 
					app: @app, 
					segment_manager: @segment_manager 
				},
			)
		]

		turbo_views <<  turbo_stream.replace(
			"segment-table", 
			partial: "table", 
			locals: { 
				app: @app, 
				segment_manager: @segment_manager, 
				results: @segment_manager.results(params) 
			},
		) unless @segment_manager.predicates.find{|o| o.value.nil? }
		
		respond_to do |format|
      format.turbo_stream{ 
				render turbo_stream: turbo_views
			}
      format.html #{ redirect_to "/" }
		end
	end
end
