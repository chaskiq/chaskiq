require "aws-sdk-s3"

ENV['AWS_REGION'] =  "us-east-1"

AWS_CLIENT = Rails.env.test? ? nil : Aws::S3::Client.new(
  access_key_id: Rails.application.credentials.dig(:aws, :access_key_id),
  secret_access_key: Rails.application.credentials.dig(:aws, :secret_access_key)
) 