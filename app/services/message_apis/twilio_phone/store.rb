module MessageApis::TwilioPhone
  class Store
    NAMESPACE = "/twilio_phone/".freeze

    def self.data(conversation_key)
      hash("#{conversation_key}/data")
    end

    def self.set_data(conversation_key, key, value)
      set("#{conversation_key}/data", key, value)
    end

    def self.get_data(conversation_key, key)
      get("#{conversation_key}/data", key)
    end

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

    # locked agents at app key
    def self.locked_agents(key)
      Kredis.unique_list "#{NAMESPACE}/locked_agents/#{key}"
    end

    def self.callblock(key)
      Kredis.string(key).value
    end

    def self.set_callblock(key, value)
      string = Kredis.string(key)
      string.value = value
    end

    def self.del_callblock(key)
      Kredis.string(key).del
    end

    def self.namespace(conversation_key)
      "#{NAMESPACE}#{conversation_key}"
    end
  end
end
