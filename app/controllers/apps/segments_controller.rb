class Apps::SegmentsController < ApplicationController
	before_action :find_app
	before_action :find_segments

	layout 'application'

	def index
		
	end

	def show
		@segment = @segments.find(params[:id])

		@segment = @app.segments.new
		resource_params = [
				{
						"type": "match",
						"attribute": "match",
						"comparison": "and",
						"value": "and"
				},
				{
						"type": "string",
						"attribute": "type",
						"comparison": "in",
						"value": [
								"AppUser"
						]
				}
		]

		resource_params_custom = resource_params.dup 
		
		#resource_params_custom << {
		#	"type": "string",
		#	"attribute": "gob_type",
		#	"comparison": nil
		#}

		#resource_params_custom << {
		#	"type": "date",
		#	"attribute": "last_visited_at",
		#	"comparison": nil
		#}

		@segment_manager = SegmentManagerService.new(predicates: resource_params_custom)
		#resource_params = search.require(:data).permit(
		#		predicates: [:attribute, :comparison, :type, :value, { value: [] }]
		#		)
		@segment.assign_attributes(predicates: resource_params)

		@app_users = @segment.execute_query
													.page(params[:page] || 1)
													.per(params[:per] || 20)
	end


private
	def find_segments
		@segments = Segment.union_scope(
			@app.segments.all, Segment.where(app_id: nil)
		).order("id asc")
	end

end
