class SegmentManagerService

		include ActiveModel::Model

		attr_accessor :predicates, :app
		
		def initialize(predicates: [], app: nil)
      @app = app
			@predicates = predicates.map{ |predicate| 
				generate_predicates(predicate)
			}
		end

    def segment_predicates=(attributes)
      self.predicates = attributes.keys.map{ |o| 
        generate_predicates(attributes[o])
      }
    end

    def handle_new_segment=(kind)
      data = app.fields_for_segments.find{|o| o["name"] === kind}
      
      if data
        self.predicates = self.predicates << 
        SegmentPredicate.new({
                                "type": data["type"],
                                "attribute": data["name"],
                                "comparison": nil
                              })
      end

    end

		def generate_predicates(predicate)
			SegmentPredicate.new(
				type: predicate[:type], 
				attribute: predicate[:attribute], 
				comparison: predicate[:comparison], 
				value: predicate[:value]
			)
		end

end

class SegmentPredicate

	include ActiveModel::Model

	attr_accessor :type, :attribute, :comparison, :value

	def initialize(type: nil, attribute: nil, comparison: nil, value: nil)
		@type = type
		@attribute = attribute
		@comparison = comparison
		@value = value
	end

  def relative_options
    return string_predicates if @type == "string" 
    return date_predicates if @type == "date" 
  end

	def date_predicates
		[
      {
        label: I18n.t('segment_manager.more_than'),
        value: 'lt',
        #defaultSelected: compare('lt'),
      },
      {
        label: I18n.t('segment_manager.exactly'),
        value: 'eq',
        #defaultSelected: compare('eq'),
      },
      {
        label: I18n.t('segment_manager.less_than'),
        value: 'gt',
        #defaultSelected: compare('gt'),
      },
    ]
	end

	def string_predicates
		[
      {
        label: I18n.t('segment_manager.is'),
        value: 'eq',
        defaultSelected: false,
      },
      {
        label: I18n.t('segment_manager.is_not'),
        value: 'not_eq',
        defaultSelected: false,
      },
      {
        label: I18n.t('segment_manager.starts_with'),
        value: 'contains_start',
        defaultSelected: false,
      },
      {
        label: I18n.t('segment_manager.ends_with'),
        value: 'contains_ends',
        defaultSelected: false,
      },
      {
        label: I18n.t('segment_manager.contains'),
        value: 'contains',
        defaultSelected: false,
      },
      {
        label: I18n.t('segment_manager.does_not_contain'),
        value: 'not_contains',
        defaultSelected: false,
      },
      {
        label: I18n.t('segment_manager.is_unknown'),
        value: 'is_null',
        defaultSelected: false,
      },
      {
        label: I18n.t('segment_manager.has_any_value'),
        value: 'is_not_null',
        defaultSelected: false,
      }
    ]
	end


end