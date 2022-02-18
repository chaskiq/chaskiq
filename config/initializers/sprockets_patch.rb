# remove this when https://github.com/rails/sprockets/pull/726
Sprockets::DigestUtils.module_eval do |variable|
  def already_digested?(name)
    name =~ /-([0-9a-zA-Z]{7,128})\.digested/
    #puts "DIGESTED NAME: #{name} #{cond ? "SI" : "NO"}"
  end
end