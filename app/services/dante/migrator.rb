class Dante::Migrator
  def self.migrate_conversation_parts(id: nil)
    parts = ConversationPartContent.joins("INNER JOIN conversation_parts ON conversation_parts.messageable_id = conversation_part_contents.id AND conversation_parts.messageable_type = 'ConversationPartContent'")
                                   .joins("INNER JOIN conversations ON conversations.id = conversation_parts.conversation_id")
                                   .where(conversations: { app_id: id })

    parts.find_each do |record|
      Rails.logger.info("INIT PROCESS OF #{record.id}")
      draft_content = record.serialized_content
      begin
        new_content = Dante::Converter.draftjs_to_prosemirror(draft_content)
        record.update_column(:serialized_content, new_content.to_json)
        Rails.logger.info("OK content #{record.id}")
      rescue StandardError => e
        Rails.logger.error("Error converting part content #{record.id}")
        # Rails.logger.error(e)
      end
    end
  end

  def self.migrate_articles(id: nil)
    Article.where(app_id: id).find_each do |article|
      article.article_content.translations.find_each do |record|
        Rails.logger.info("INIT PROCESS OF #{record.id}")
        draft_content = record.serialized_content
        begin
          new_content = Dante::Converter.draftjs_to_prosemirror(draft_content)
          record.update_column(:serialized_content, new_content.to_json)
          Rails.logger.info("OK content #{record.id}")
        rescue StandardError => e
          Rails.logger.error("Error converting part content #{record.id}")
          Rails.logger.error(e)
        end
      end
    end
  end

  def self.migrate_bot_tasks(id: nil)
    return if id.blank?

    BotTask.where(app_id: id).find_each do |record|
      next if record.settings["paths"].blank?

      begin
        updated_paths = record.paths.map do |path|
          path["steps"].map! do |step|
            if step["type"] == "messages" && step.key?("messages")
              step["messages"].each do |message|
                next unless message.key?("serialized_content")

                draft_content = message["serialized_content"]
                new_content = Dante::Converter.draftjs_to_prosemirror(draft_content).to_json
                message["serialized_content"] = new_content
              end
            end
            step
          end
          path
        end
        record.update_column(:settings, record.settings.merge({ "paths" => updated_paths }))
        # record.update_column(:serialized_content, new_content.to_json)
        Rails.logger.info("OK content #{record.id}")
      rescue StandardError => e
        Rails.logger.error("Error converting part content #{record.id}")
        Rails.logger.error(e)
      end
    end
  end

  def self.migrate_banners(id: nil)
    return if id.blank?

    Banner.where(app_id: id).find_each do |record|
      next if record.serialized_content.blank?

      begin
        draft_content = record.serialized_content
        new_content = Dante::Converter.draftjs_to_prosemirror(draft_content)
        record.update_column(:serialized_content, new_content.to_json)
        Rails.logger.info("OK content #{record.id}")
      rescue StandardError => e
        Rails.logger.error("Error converting part content #{record.id}, #{e.message}")
      end
    end
  end

  def self.migrate_user_auto_message(id: nil)
    return if id.blank?

    UserAutoMessage.where(app_id: id).find_each do |record|
      next if record.serialized_content.blank?

      begin
        Rails.logger.info("processing #{record.id}")
        draft_content = record.serialized_content
        new_content = Dante::Converter.draftjs_to_prosemirror(draft_content)
        record.update_column(:serialized_content, new_content.to_json)
        Rails.logger.info("OK content #{record.id}")
      rescue StandardError => e
        Rails.logger.error("Error converting part content #{record.id}, #{e.message}")
      end
    end
  end

  def self.migrate_campaigns(id: nil)
    return if id.blank?

    Campaign.where(app_id: id).find_each do |record|
      next if record.serialized_content.blank?

      begin
        Rails.logger.info("processing #{record.id}")
        draft_content = record.serialized_content
        new_content = Dante::Converter.draftjs_to_prosemirror(draft_content)
        record.update_column(:serialized_content, new_content.to_json)
        Rails.logger.info("OK content #{record.id}")
      rescue StandardError => e
        Rails.logger.error("Error converting part content #{record.id}, #{e.message}")
      end
    end
  end

  def self.migrate_tours(id: nil)
    Tour.where(app_id: id).find_each do |record|
      Rails.logger.info("processing #{record.id}")
      begin
        updated_settings = record.settings.dup
        updated_settings["steps"].each do |step|
          next unless step.key?("serialized_content")

          draft_content = step["serialized_content"]
          new_content = Dante::Converter.draftjs_to_prosemirror(draft_content)
          step["serialized_content"] = new_content.to_json
        end
        record.update_column(:settings, updated_settings)
        Rails.logger.info("OK content #{record.id}")
      rescue StandardError => e
        Rails.logger.error("Error converting part content #{record.id}, #{e.message}")
      end
    end
  end

  def self.migrate_quick_replies(id: nil)
    return if id.blank?

    QuickReply.where(app_id: id).find_each do |article|
      article.translations.find_each do |record|
        Rails.logger.info("INIT PROCESS OF #{record.id}")
        draft_content = record.content
        begin
          new_content = Dante::Converter.draftjs_to_prosemirror(draft_content)
          record.update_column(:content, new_content.to_json)
          Rails.logger.info("OK content #{record.id}")
        rescue StandardError => e
          Rails.logger.error("Error converting part content #{record.id}")
          Rails.logger.error(e)
        end
      end
    end
  end

  def self.migrate_app(id: nil)
    Rails.logger.info("RUNNING account #{id}")
    migrate_conversation_parts(id: id)
    migrate_articles(id: id)
    migrate_bot_tasks(id: id)
    migrate_banners(id: id)
    migrate_user_auto_message(id: id)
    migrate_campaigns(id: id)
    migrate_tours(id: id)
    migrate_quick_replies(id: id)
  end

  def self.migrate_apps(ids: nil)
    ids.each do |id|
      migrate_app(id: id)
    end
  end
end
