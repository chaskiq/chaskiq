class Apps::ContactsController < ApplicationController

	before_action :find_app

	def new
				
		respond_to do |format|
      format.turbo_stream{ 
				render turbo_stream: [
          turbo_stream.replace(
						"modal", 
						template: "apps/contacts/new", 
						locals: { app: @app },
					),
				]
			}
      format.html #{ redirect_to "/" }
		end
	end

	def create
		
    respond_to do |format|
      format.turbo_stream { 
        render turbo_stream: [
          turbo_stream.replace(
						"modal", 
						template: "apps/contacts/new", 
						locals: { app: @app },
					),
				]
      }
      format.html {
        render :show
      }
    end


	end

end
