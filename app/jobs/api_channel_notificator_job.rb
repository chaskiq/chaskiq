# frozen_string_literal: true
#require 'activejob/locking/adapters/suo-redis'

class ApiChannelNotificatorJob < ApplicationJob
  queue_as :default
  #include ActiveJob::Locking::Serialized

  #self.adapter = ActiveJob::Locking::Adapters::SuoRedis
  #self.enqueue_time = 3
  #self.lock_time = 10
  #self.hosts = [REDIS_URL]
  # Make sure the lock_key is always the same

  #def lock_key(object)
  #  k = [self.class.name, 'conversations', object[:conversation]]
  #  puts "ENQUEUED LOCK #{k}"
  #end


  # 
  #unique :until_executed, lock_ttl: 5.seconds
  #def lock_key_arguments
  #  conversation_id = self.arguments.first[:conversation]
  #  k = [self.class.name, 'conversations', conversation_id]
  #  puts "ENQUEUED LOCK #{k}"
  #  k
  #end

  def perform(part_id:, conversation:)
    ConversationPart.find(part_id).notify_message_on_available_channels
  end
end
