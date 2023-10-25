class Apps::AssignmentRulesController < ApplicationController

  before_action :find_app
  before_action :set_navigation
  # before_action :check_plan, only: [:update]

  def index
    @assignment_rules = @app.assignment_rules.page(params[:page]).per(10)
  end

  def new
    @assignment_rule = @app.assignment_rules.new

    @segment_manager = SegmentManagerService.new(
      app: @app,
      predicates: AssignmentRule.default_conditions
    )

    @changed = false
  end
  
  def destroy
    @assignment_rule = @app.assignment_rules.find(params[:id])
    @assignment_rule.destroy
    redirect_to app_assignment_rules_path
  end

  def edit
    @assignment_rule = @app.assignment_rules.find(params[:id])
    @segment_manager = SegmentManagerService.new(
      app: @app,
      predicates: @assignment_rule.conditions
    )
  end

  def update

    @assignment_rule = @app.assignment_rules.find(params[:id])

    segment_predicate = params[:assignment_rule][:segment_predicate]
    segment_predicates = segment_predicate.keys.sort.map { |key| segment_predicate[key] }

    @assignment_rule.conditions = segment_predicates
    @assignment_rule.title = params[:assignment_rule][:title]
    @assignment_rule.agent_id = params[:assignment_rule][:agent_id]

    @segment_manager = SegmentManagerService.new(
      app: @app,
      predicates: @assignment_rule.conditions
    )

    @segment_manager.handle_new_segment = params["new_segment"] if params["new_segment"].present?

    @changed = false

    if params["commit"] == "save" 
      if @assignment_rule.save
        flash.now[:notice] = "assignment rule updated"
      end
    end
   
  end

  def create

    @assignment_rule = @app.assignment_rules.new

    segment_predicate = params[:assignment_rule][:segment_predicate]
    segment_predicates = segment_predicate.keys.sort.map { |key| segment_predicate[key] }

    @assignment_rule.conditions = segment_predicates
    @assignment_rule.title = params[:assignment_rule][:title]
    @assignment_rule.agent_id = params[:assignment_rule][:agent_id]

    @segment_manager = SegmentManagerService.new(
      app: @app,
      predicates: @assignment_rule.conditions
    )

    @segment_manager.handle_new_segment = params["new_segment"] if params["new_segment"].present?

    @changed = false

    if params["commit"] == "save" 
      if @assignment_rule.save
        flash.now[:notice] = "assignment rule saved"
      end
    end
   
  end


  private 

  def set_navigation
    @navigator = "apps/conversations/navigator"
  end
end
