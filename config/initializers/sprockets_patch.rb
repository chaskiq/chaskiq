Sprockets::DigestUtils.module_eval do |variable|
  def already_digested?(name)
    cond = name =~ /-([0-9a-f]{7,128})\.digested/ || name =~ /-(?:[A-Z2-7]{8})*(?:[A-Z2-7]{2}={6}|[A-Z2-7]{4}={4}|[A-Z2-7]{5}={3}|[A-Z2-7]{7}=)?\.digested$/
    puts "DIGESTED NAME: #{name} #{cond ? "SI" : "NO"}"
  end
end