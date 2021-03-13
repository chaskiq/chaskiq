require 'rails_helper'

RSpec.describe OfflineCheckerJob, type: :job do
  it "enqueue job" do
    ActiveJob::Base.queue_adapter = :test
    expect {
      OfflineCheckerJob.perform_later({})
    }.to have_enqueued_job
  end
end
