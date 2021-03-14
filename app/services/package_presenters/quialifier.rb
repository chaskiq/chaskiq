module PackagePresenters
	class Quialifier
		# Initialize flow webhook URL
		# Sent when an app has been inserted into a conversation, message or
		# the home screen, so that you can render the app.
		def self.initialize_hook(kind:, ctx:)
			options = ctx[:values][:item].map { |o| o[:name] }

			QualifierRecord.configure(
				options
			)

			record = QualifierRecord.new(items: [])

			ctx[:values][:item].map do |o|
				record.add_item(o[:name], o[:label])
			end

			{
				kind: kind,
				# ctx: ctx,
				definitions: record.schema
			}
		end

		# Submit flow webhook URL
		# Sent when an end-user interacts with your app, via a button,
		# link, or text input. This flow can occur multiple times as an
		# end-user interacts with your app.
		def self.submit_hook(kind:, ctx:)
			fields = ctx[:app].searcheable_fields.map do |o|
				o['name'].to_sym
			end

			QualifierRecord.configure(
				fields
			)

			params = ctx.dig(:values).permit(fields)

			QualifierRecord.configure_validations(
				params.keys.map(&:to_sym)
			)

			record = QualifierRecord.new(
				params
			)

			record.valid?

			if record.valid? && ctx[:current_user].is_a?(AppUser)
				ctx[:current_user].update(
					params
				)
			end

			params.keys.each do |o|
				record.add_item(o)
			end

			record.items.each do |o|
				o[:label] = ctx.dig(:definitions)&.find { |d| d[:id] == o[:id] }&.dig(:label)
				o[:value] = ctx.dig(:values, o[:id].to_sym)
				o[:placeholder] = "type your #{o[:label]}"
			end

			definitions = record.schema

			result = {
				# kind: 'initialize',
				definitions: definitions
			}

			if record.valid?
				result.merge!(
					results: ctx.dig(:values),
					definitions: record.confirmed_definitions
				)
			end

			result
		end

		# Configure flow webhook URL (optional)
		# Sent when a teammate wants to use your app, so that you can show
		# them configuration options before it’s inserted. Leaving this option
		# blank will skip configuration.
		def self.configure_hook(kind:, ctx:)
			app = ctx[:app]
			fields = app.searcheable_fields

			definitions = [
				{
					type: 'text',
					style: 'header',
					align: 'center',
					text: 'qualify users'
				},
				{
					type: 'text',
					style: 'muted',
					align: 'center',
					text: 'Compose forms for qualificators'
				},
				{
					type: 'separator'
				},
				{
					type: 'text',
					text: 'Pick a template',
					style: 'header'
				},

				{
					type: 'list',
					disabled: false,
					items: [
						{
							type: 'item',
							id: 'contact-fields',
							title: 'Contact fields',
							subtitle: 'Ask for name , email & company',
							action: {
								type: 'submit'
							}
						},
						{
							type: 'item',
							id: 'any-field',
							title: 'Custom Fields',
							subtitle: 'Ask for custom field data',
							action: {
								type: 'submit'
							}
						}
					]
				}
			]

			if ctx.dig(:field, :id) == 'contact-fields'

				r = QualifierRecordItem.new(
					options: fields
				)
				r.add_item('name')
				r.add_item('email')
				r.add_item('company_name')

				return {
					kind: kind,
					definitions: r.schema
				}
			end

			if ctx.dig(:field, :id) == 'any-field'
				r = QualifierRecordItem.new(
					options: fields
				)

				r.add_item(nil)

				return {
					kind: kind,
					definitions: r.schema
				}
			end

			if ctx.dig(:field, :id) == 'add-field'

				r = QualifierRecordItem.new(
					options: fields
				)

				ctx[:values].require(:item).each do |o|
					r.add_item(o[:name])
				end

				r.add_item(nil)

				return {
					kind: kind,
					definitions: r.schema
				}
			end

			if ctx.dig(:field, :id) == 'confirm' &&
				 ctx.dig(:field, :action, :type) === 'submit'

				# TODO: validate

				return {
					kind: 'initialize',
					definitions: definitions,
					results: ctx[:values]
				}
			end

			{
				# kind: kind,
				# ctx: ctx,
				definitions: definitions
			}
		end

		# Submit Sheet flow webhook URL (optional)
		# Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
		def self.sheet_hook(params)
			[]
		end
	end
end