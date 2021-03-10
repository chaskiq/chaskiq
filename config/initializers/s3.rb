# frozen_string_literal: true

require 'aws-sdk-s3'

ENV['AWS_REGION'] = ENV['AWS_S3_REGION'] || 'us-east-1'

AWS_CLIENT = begin
  if Rails.env.test?
    nil
  else
    Aws::S3::Client.new(
      access_key_id: ENV['AWS_ACCESS_KEY_ID'],
      secret_access_key: ENV['AWS_SECRET_ACCESS_KEY']
    )
  end
rescue StandardError
  nil
end
