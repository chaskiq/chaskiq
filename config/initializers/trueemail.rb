require 'truemail'

Truemail.configure do |config|
  # Required parameter. Must be an existing email on behalf of which verification will be performed
  config.verifier_email = 'verifier@example.com'

  # Optional parameter. Must be an existing domain on behalf of which verification will be performed.
  # By default verifier domain based on verifier email
  # config.verifier_domain = 'somedomain.com'

  # Optional parameter. You can override default regex pattern
  # config.email_pattern = /regex_pattern/

  # Optional parameter. You can override default regex pattern
  # config.smtp_error_body_pattern = /regex_pattern/

  # Optional parameter. Connection timeout in seconds.
  # It is equal to 2 by default.
  config.connection_timeout = 1

  # Optional parameter. A SMTP server response timeout in seconds.
  # It is equal to 2 by default.
  config.response_timeout = 1

  # Optional parameter. Total of connection attempts. It is equal to 2 by default.
  # This parameter uses in mx lookup timeout error and smtp request (for cases when
  # there is one mx server).
  config.connection_attempts = 3

  # Optional parameter. You can predefine default validation type for
  # Truemail.validate('email@email.com') call without with-parameter
  # Available validation types: :regex, :mx, :smtp
  config.default_validation_type = :mx

  # Optional parameter. You can predefine which type of validation will be used for domains.
  # Also you can skip validation by domain. Available validation types: :regex, :mx, :smtp
  # This configuration will be used over current or default validation type parameter
  # All of validations for 'somedomain.com' will be processed with regex validation only.
  # And all of validations for 'otherdomain.com' will be processed with mx validation only.
  # It is equal to empty hash by default.
  # config.validation_type_for = { 'somedomain.com' => :regex, 'otherdomain.com' => :mx }

  # Optional parameter. Validation of email which contains whitelisted domain always will
  # return true. Other validations will not processed even if it was defined in validation_type_for
  # It is equal to empty array by default.
  # config.whitelisted_domains = ['somedomain1.com', 'somedomain2.com']

  # Optional parameter. With this option Truemail will validate email which contains whitelisted
  # domain only, i.e. if domain whitelisted, validation will passed to Regex, MX or SMTP validators.
  # Validation of email which not contains whitelisted domain always will return false.
  # It is equal false by default.
  # config.whitelist_validation = true

  # Optional parameter. Validation of email which contains blacklisted domain always will
  # return false. Other validations will not processed even if it was defined in validation_type_for
  # It is equal to empty array by default.
  # config.blacklisted_domains = ['somedomain3.com', 'somedomain4.com']

  # Optional parameter. With this option Truemail will filter out unwanted mx servers via
  # predefined list of ip addresses. It can be used as a part of DEA (disposable email
  # address) validations. It is equal to empty array by default.
  # config.blacklisted_mx_ip_addresses = ['1.1.1.1', '2.2.2.2']

  # Optional parameter. This option will provide to use custom DNS gateway when Truemail
  # interacts with DNS. Valid port numbers are in the range 1-65535. If you won't specify
  # nameserver's ports Truemail will use default DNS TCP/UDP port 53. By default Truemail
  # uses DNS gateway from system settings and this option is equal to empty array.
  # config.dns = ['10.0.0.1', '10.0.0.2:54']

  # Optional parameter. This option will provide to use not RFC MX lookup flow.
  # It means that MX and Null MX records will be cheked on the DNS validation layer only.
  # By default this option is disabled.
  # config.not_rfc_mx_lookup_flow = true

  # Optional parameter. This option will provide to use smtp fail fast behaviour. When
  # smtp_fail_fast = true it means that truemail ends smtp validation session after first
  # attempt on the first mx server in any fail cases (network connection/timeout error,
  # smtp validation error). This feature helps to reduce total time of SMTP validation
  # session up to 1 second. By default this option is disabled.
  # config.smtp_fail_fast = true

  # Optional parameter. This option will be parse bodies of SMTP errors. It will be helpful
  # if SMTP server does not return an exact answer that the email does not exist
  # By default this option is disabled, available for SMTP validation only.
  # config.smtp_safe_check = true

  # Optional parameter. This option will enable tracking events. You can print tracking events to
  # stdout, write to file or both of these. Tracking event by default is :error
  # Available tracking event: :all, :unrecognized_error, :recognized_error, :error
  # config.logger = { tracking_event: :all, stdout: true, log_absolute_path: '/home/app/log/truemail.log' }
end