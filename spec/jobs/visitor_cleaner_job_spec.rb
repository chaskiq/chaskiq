require 'rails_helper'

RSpec.describe VisitorCleanerJob, type: :job do
  it "enqueue job" do
    ActiveJob::Base.queue_adapter = :test
    expect {
      VisitorCleanerJob.perform_later({})
    }.to have_enqueued_job
  end
end
