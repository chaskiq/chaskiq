class TailwindFormBuilder < ActionView::Helpers::FormBuilder
	# include ActionView::Helpers::TagHelper
	# include ActionView::Context

	def hint(attribute, options)
		return '' if options[:hint].blank? && hint_tr(attribute).blank?
		@template.content_tag( :div, class: "text-gray-500 text-xs" ) {
			options[:hint] || hint_tr(attribute)
		}
	end

	def error(attribute, object)
		return '' if object.errors[attribute.to_sym].blank?
		@template.content_tag( :div, class: "text-red-500 text-xs italic" ) {
			object.errors[attribute.to_sym].join(", ").to_s
		}
	end

	def field_details(attribute, object, options )
		content = (error(attribute, object) + hint(attribute, options)).html_safe
		return  '' if content.blank?
		@template.content_tag( :div, class: "mt-1 text-xs text-gray-500 dark:text-gray-100" ){ 
			(error(attribute, object) + hint(attribute, options)).html_safe
		}
	end


	def text_field(attribute, options={})
		@template.content_tag( :div, class: 'w-full sm:w-full py-2 pr-2' )do
			@template.label_tag( tr(options[:label] || attribute), nil, class: "block text-gray-700 dark:text-white text-sm font-bold mb-2" ) + 
			super(attribute, options.reverse_merge(class: "input")) + 
			field_details(attribute, object, options)
		end
	end

	def text_area(attribute, options={})
		@template.content_tag( :div, class: 'w-full sm:w-full py-2 pr-2' )do
			@template.label_tag( tr(options[:label] || attribute), nil, class: "block text-gray-700 dark:text-white text-sm font-bold mb-2" ) + 
			super(attribute, options.reverse_merge(class: "input")) + 
			field_details(attribute, object, options)
		end
	end

	def select(object_name, method_name, template_object, options={})
		@template.content_tag( :div, class: 'w-full sm:w-full py-2 pr-2', "data-controller": "select" )do
			@template.label_tag( tr(options[:label] || object_name), nil, class: "block text-gray-700 dark:text-white text-sm font-bold mb-2" ) + 
			super(object_name, method_name, template_object, options.reverse_merge(class: "select")) + 
			@template.content_tag(:div, data: { "select-target": "holder"}){''} +
			field_details(object_name, object, options)
		end
	end

	def color_fieldssss(object_name, method='', options = {})
		Tags::ColorField.new(object_name, method, self, options).render
	end

	def div_radio_button(method, tag_value, options = {})
		@template.content_tag(:div,
			@template.radio_button(
				@object_name, method, tag_value, objectify_options(options)
			)
		)
	end

	def check_box(method, options = {}, checked_value = "1", unchecked_value = "0")

		info = @template.label_tag( 
			tr(options[:label] || method), nil, 
			class: "block font-bold text-md leading-5 text-gray-900 dark:text-white" ) + 
		field_details(method, object, options)

		options.merge!(class: "self-start mt-1 mr-1 form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out")
		@template.content_tag( :div, class: 'flex items-center' )do
			@template.check_box(
				@object_name, method, objectify_options(options), checked_value, unchecked_value
			) + @template.content_tag( :div, class: 'flex-col items-center' ) { info }
			
		end
	end

	def tr(name)
    I18n.t(name, scope: [:activerecord, :attributes, @object_name], :default => name.to_s)
  end

	def hint_tr(name)
    I18n.t(name, scope: [:activerecord, :hints, @object_name], :default => nil)
  end
end