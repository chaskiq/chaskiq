module MessageApis::TwilioPhone
  class Store
    NAMESPACE = "/twilio_phone/".freeze

    def self.hash(conversation_key)
      Kredis.hash(namespace(conversation_key))
    end

    def self.set(conversation_key, key, value)
      hash(conversation_key).update(key => value)
    end

    def self.get(conversation_key, key)
      hash(conversation_key)[key]
    end

    def self.get_values(conversation_key)
      Redis.current.hgetall(namespace(conversation_key))
    end

    def self.delete_key(conversation_key, key)
      hash(namespace(conversation_key)).del(key)
    end

    def self.locked_agents
      Kredis.unique_list "#{NAMESPACE}/locked_agents"
    end

    def self.namespace(conversation_key)
      "#{NAMESPACE}#{conversation_key}"
    end
  end
end
