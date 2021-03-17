module MessageApis::Reveniu

  class PaymentRecord
    include ActiveModel::Model
    include ActiveModel::Validations
    attr_accessor :url

    validate :valid_url?

    def valid_url?
      uri = URI.parse(url)
      add_error unless uri.is_a?(URI::HTTP) && !uri.host.nil?
      matches_url?(url)
    rescue URI::InvalidURIError
      add_error
    end

    def matches_url?(url)
      unless url.match(
        %r{https://reveniu-stage.herokuapp.com|https://reveniu.com}
      ).to_a.any?
        add_error('must include valid reveniu domain')
      end
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
            url: '/package_iframe_internal/Reveniu'
          }
        },
        {
          type: 'text',
          text: 'This will open the Reveniu.com secure payment gateway.',
          style: 'muted',
          align: 'center'
        }
      ]
    end
  end

end