module MessageApis::Reveniu
  class Api < MessageApis::BasePackage
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
  end
end
