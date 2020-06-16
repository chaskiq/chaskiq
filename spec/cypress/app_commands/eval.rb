# frozen_string_literal: true

ActiveRecord::Base.connection_pool.with_connection do
  if Rails.env.test?
    Kernel.eval(command_options) unless command_options.nil?
  end
end