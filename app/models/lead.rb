class Lead < AppUser

  def verify!
    if self.email.present? && 
      app_users = self.app.app_users.where(type: "AppUser", email: self.email)
      app_users.any?
      clone_records_and_discard(app_users.first)
    else
      self.becomes!(AppUser)
      self.type = "AppUser"
      self.save
    end
  end


  def clone_records_and_discard(app_user)
    attributes = self.deep_clone.attributes.except("id", "created_at", "updated_at", "session_id")
    
    if app_user.update(attributes)
      verify_event(app_user)
    end

    # TODO: detach this
    self.conversations.each do |c|
      c.main_participant = app_user
      c.save
    end
  end

  def verify_event(app_user)
    self.events.log(
      action: :verified_lead, 
      properties: {from: self.id, to: app_user.id}
    )
    
    key = app_user.session_key

    MessengerEventsChannel.broadcast_to(key, {
      type: "user:refresh", 
      data: app_user.as_json(only: [:session_id])
    }.as_json)

  end

end
