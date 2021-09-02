# frozen_string_literal: true

require "rails_helper"

RSpec.describe EmailChatNotifierJob, type: :job do
  it "enqueues job" do
    ActiveJob::Base.queue_adapter = :test
    expect {
      EmailChatNotifierJob.perform_later({})
    }.to have_enqueued_job
  end
end
