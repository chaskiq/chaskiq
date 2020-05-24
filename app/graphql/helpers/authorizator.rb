module Helpers::Authorizator
  def authorize!(mode, object)
    #cancancan mode
    context[:authorize].call(mode, object)
  end

  def doorkeeper_authorize!
    #raise "not logged user" if context[:current_user].blank? 
    context[:doorkeeper_authorize].call()
  end

  def can?(mode, object)
    context[:can].call(mode, object)
  end
end