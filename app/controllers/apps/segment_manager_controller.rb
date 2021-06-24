class Apps::SegmentManagerController < ApplicationController
	before_action :find_app

	def create

		resource_params = params[:segment_manager_service].permit!
	
		@segment_manager = SegmentManagerService.new(app: @app)
		@segment_manager.segment_predicates = resource_params["segment_predicate"]

		@segment_manager.handle_new_segment = params["new_segment"] if params["new_segment"].present?

		respond_to do |format|
      format.turbo_stream{ 
				render turbo_stream: [
          turbo_stream.replace(
						"segment_form", 
						partial: "form", 
						locals: { app: @app },
					),
				]
			}
      format.html #{ redirect_to "/" }
		end
	end
end
