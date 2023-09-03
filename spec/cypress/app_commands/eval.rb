# frozen_string_literal: true

ActiveRecord::Base.connection_pool.with_connection do
  Kernel.eval(command_options) if Rails.env.test? && !command_options.nil?
end
