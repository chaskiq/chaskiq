class Visitor < AppUser

  def become_lead!
    self.becomes!(Lead)
    self.type = "Lead"
    self.save
  end

end
