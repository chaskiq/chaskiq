# frozen_string_literal: true

class Visitor < AppUser
  def become_lead!
    becomes!(Lead)
    self.type = 'Lead'
    save

    lead_event
    self
  end
end
