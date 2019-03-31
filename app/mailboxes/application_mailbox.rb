class ApplicationMailbox < ActionMailbox::Base
  # routing /something/i => :somewhere


  routing /^save@/i     => :forwards
  routing /@replies\./i => :replies

end
