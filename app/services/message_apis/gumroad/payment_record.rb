module MessageApis::Reveniu

	class PaymentRecord
		include ActiveModel::Model
		include ActiveModel::Validations
		attr_accessor :url

		validate :valid_url?

		def valid_url?
			add_error('must include valid Gumroad domain') unless url.include?('https://gum.co')
			uri = URI.parse(url)
			add_error unless uri.is_a?(URI::HTTP) && !uri.host.nil?
		rescue URI::InvalidURIError
			add_error
		end

		def add_error(msg = 'valid url needed')
			errors.add(:url, msg)
		end

		def initialize(url:)
			self.url = url
		end

		def valid_schema
			# return []
			[
				{
					type: 'text',
					text: 'Payment Link',
					style: 'header',
					align: 'center'
				},
				{
					type: 'button',
					id: 'add-field',
					label: 'Enter payment gateway',
					align: 'center',
					variant: 'success',
					action: {
						type: 'frame',
						url: '/package_iframe_internal/Gumroad'
					}
				},
				{
					type: 'text',
					text: 'This will open the Gumroad.com secure payment gateway.',
					style: 'muted',
					align: 'center'
				}
			]
		end
	end
end