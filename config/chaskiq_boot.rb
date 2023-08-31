module ChaskiqBoot

  def self.plugin_autoloader
    begin
      if Chaskiq::Config.get("DISABLE_AUTOLOAD_APPSTORE") != "true"
        puts "🌱🌱🌱 LOADING CHASKIQ PLUGINS 🌱🌱🌱"
        Plugin.save_all_plugins 
      else
        puts "❗ CHASKIQ PLUGINS LOADING IS DISABLED ❗"
      end
      rescue => e
        puts "🔴 ERROR saving plugins #{e.message}"
    end
    puts ascii()
    puts "🔥 Visit https://appstore.chaskiq.io for a comprehensive plugin list for your Chaskiq instance 🔥"
  end

  def self.ascii()

    <<~VIEW
    ________               __   _      
    / ____/ /_  ____ ______/ /__(_)___ _
   / /   / __ \/ __ `/ ___/ //_/ / __ `/
  / /___/ / / / /_/ (__  ) ,< / / /_/ / 
  \____/_/ /_/\__,_/____/_/|_/_/\__, /  
                                  /_/   
    VIEW


  end
end