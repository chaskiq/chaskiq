# frozen_string_literal: true

require "rails_helper"

RSpec.describe SesSenderJob, type: :job do
  it "enqueue job" do
    ActiveJob::Base.queue_adapter = :test
    expect {
      SesSenderJob.perform_later({})
    }.to have_enqueued_job
  end
end
