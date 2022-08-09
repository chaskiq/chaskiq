module EnableExtensionHerokuMonkeypatch
    # Earl was here # https://stackoverflow.com/a/73273766/2161301
    def self.apply_patch!
      adapter_const = begin
        Kernel.const_get('ActiveRecord::ConnectionAdapters::PostgreSQLAdapter')
      rescue NameError => ne
        puts "#{self.name} -- #{ne}"
      end
  
      if adapter_const
        patched_method = adapter_const.instance_method(:enable_extension)
  
        # Only patch this method if it's method signature matches what we're expecting
        if 1 == patched_method&.arity
          adapter_const.prepend InstanceMethods
        end
      end
    end
  
    module InstanceMethods
      def enable_extension(name)
        name_override = name
  
        if schema_exists?('heroku_ext')
          puts "enable_extension -- Adding SCHEMA heroku_ext"
          name_override = "#{name}\" SCHEMA heroku_ext -- Ignore trailing double quote"
        end
  
        super name_override
      end
    end
  end
  
  EnableExtensionHerokuMonkeypatch.apply_patch!