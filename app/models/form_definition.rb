class FormDefinition

	include ActiveModel::Model
	include ActiveModel::Validations
  attr_accessor :id, :app_package

  def definition_builder(integration)
		self.id = integration.id
		self.app_package = integration.app_package
		definitions = integration.app_package.definitions

		definitions.each do |definition|
			initialize_definition(definition, integration.settings[ definition["name"] ] )
		end
 	end

	def initialize_definition(definition, value)
		definition_name = definition["name"]
		#self.instance_variable_set "@definition_#{definition["name"]}", nil
		self.class.class_eval do
			attr_accessor "definition_#{definition["name"]}".to_sym

			define_method("definition_#{definition_name}") { 
				value
			}

			define_method("definition_#{definition_name}_label") { 
				definition["label"]
			}

			define_method("definition_#{definition_name}_hint") { 
				definition["hint"]
			}

			validates_presence_of "definition_#{definition["name"]}".to_sym if definition[:required]
		end

		self
	end

end