# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ListImporterJob, type: :job do
  it "enqueue job" do
    ActiveJob::Base.queue_adapter = :test
    expect {
      ListImporterJob.perform_later({})
    }.to have_enqueued_job
  end
end
