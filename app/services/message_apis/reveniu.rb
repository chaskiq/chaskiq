module MessageApis
  class Reveniu < BasePackage
    attr_accessor :secret

    def initialize(config:); end


    def process_event(params, package)
      # todo, here we can do so many things like make a pause and
      # analize conversation subject or classyficators

      message = ConversationPart.find_by(
        key: params.dig('variables', 'input', 'external_id')
      )

      m = message.messageable
      schema = m.blocks['schema'].dup
      last_block = [
        {
          type: 'text',
          text: 'Reveniu payment result',
          style: 'header',
          align: 'center'
        },
        {
          type: 'text',
          text: "status #{status[params.dig('variables', 'input', 'status')]}",
          style: 'header',
          align: 'center'
        }
      ]

      m.blocks['schema'] = last_block
      m.save_replied(params['variables']['input'])
    end

    def status
      {
        '1' => 'On time',
        '2' => 'Failed Attempt 1',
        '3' => 'Failed Attempt 2',
        '4' => 'Failed Attempt 3',
        '5' => 'Failed',
        '6' => 'Not Started'
      }
    end

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
end
