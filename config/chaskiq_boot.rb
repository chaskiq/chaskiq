module ChaskiqBoot

  def self.plugin_autoloader
    puts ascii()

    begin
      unless Chaskiq::Config.get("DISABLE_AUTOLOAD_APPSTORE").present?
        puts "⚡⚡⚡⚡ PREPARE TO SAVE CHASKIQ PLUGINS ⚡⚡⚡⚡⚡"
        Plugin.save_all_plugins 
      end
      rescue => e
        puts "ERROR saving plugins #{e.message}"
    end
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