module PackagePresenters
  class ContentShowcase
    # Initialize flow webhook URL
    # Sent when an app has been inserted into a conversation, message or
    # the home screen, so that you can render the app.
    def self.initialize_hook(kind:, ctx:)
      if ctx.dig(:values, :article)

        record = AnnouncementRecord.new(
          heading: ctx.dig(:values, :heading)
        )

        articles = ctx.dig(:values, :article)
        # TODO: validate ?
        items = articles.map do |o|
          options = o.permit(
            :description,
            :heading,
            :page_url,
            :title,
            :cover_image
          )
          record.class.new(options)
        end

        definitions = record.article_presentation_fields(items)

        return {
          wait_for_input: false,
          definitions: definitions
        }
      end

      aa = AnnouncementRecord.new(
        ctx[:values].permit(
          :description,
          :heading,
          :page_url,
          :title,
          :cover_image
        )
      )

      definitions = aa.presentation_schema

      {
        # kind: kind,
        # ctx: ctx,
        wait_for_input: false,
        definitions: definitions
      }
    end

    # Submit flow webhook URL
    # Sent when an end-user interacts with your app, via a button,
    # link, or text input. This flow can occur multiple times as an
    # end-user interacts with your app.
    def self.submit_hook(kind:, ctx:)
      { content: { kind: kind, ctx: ctx } }

      definitions = [
        {
          type: 'text',
          text: 'yes!!!!!',
          style: 'header'
        },
        {
          type: 'text',
          text: "This is paragraph text. Here's a [link](https://dev.chaskiq.io/). Here's some *bold text*. Lorem ipsum.",
          style: 'paragraph'
        }
      ]

      {
        # kind: kind,
        # ctx: ctx,
        definitions: definitions
      }
    end

    # Configure flow webhook URL (optional)
    # Sent when a teammate wants to use your app, so that you can show
    # them configuration options before it’s inserted. Leaving this option
    # blank will skip configuration.
    def self.configure_hook(kind:, ctx:)
      record = AnnouncementRecord.new
      base_definitions = record.base_schema

      definitions = base_definitions

      if ctx.dig(:field, :action, :type) === 'submit'
        if ctx.dig(:field, :id) == 'pick-another'
          return {
            kind: kind,
            definitions: base_definitions
          }
        end

        if ctx.dig(:field, :id) == 'announcement'
          definitions = record.base_title(
            title: 'Announcement',
            subtitle: 'Broadcast a message'
          ) + record.customize_buttons(type: 'announcement')

          return {
            kind: kind,
            definitions: definitions
          }
        end

        if ctx.dig(:field, :id) == 'top-articles'
          definitions = record.base_title(
            title: 'Top Articles',
            subtitle: 'Suggest helpful articles'
          ) + record.customize_buttons(type: 'top-articles')

          return {
            kind: kind,
            definitions: definitions
          }
        end

        if ctx.dig(:field, :id) == 'autofill'
          aa = AnnouncementRecord.new(
            description: ctx.dig(:values, :description),
            heading: ctx.dig(:values, :heading),
            page_url: ctx.dig(:values, :page_url),
            title: ctx.dig(:values, :title)
          )
          aa.autofill
          aa.schema

          return {
            kind: kind,
            definitions: aa.schema
          }
        end

        if ctx.dig(:field, :id) == 'add-to-messenger'
          aa = AnnouncementRecord.new(
            description: ctx.dig(:values, :description),
            heading: ctx.dig(:values, :heading),
            page_url: ctx.dig(:values, :page_url),
            title: ctx.dig(:values, :title)
          )
          aa.autofill
          aa.schema

          unless aa.valid?
            return {
              kind: kind,
              definitions: aa.schema
            }
          end

          return {
            kind: 'initialize',
            definitions: aa.schema,
            results: ctx[:values]
          }
        end

        # CUSTOMIZE ACTIONS

        if ctx.dig(:field, :id) == 'customize-announcement'

          definitions = record.base_title(
            title: 'Announcement',
            subtitle: 'Broadcast a message'
          ) + record.schema

          return {
            kind: kind,
            definitions: definitions
          }
        end

        if ctx.dig(:field, :id) == 'customize-top-articles'
          definitions = record.base_title(
            title: 'Top Articles',
            subtitle: 'Suggest helpful articles'
          ) + record.top_articles_schema

          return {
            kind: kind,
            definitions: definitions
          }
        end

        if ctx.dig(:field, :id) == 'add-articles-to-messenger'
          articles = ctx.dig(:values, 'article')

          record.heading = ctx.dig(:values, 'heading')

          validations = articles.map do |o|
            options = o.permit(
              :description,
              :heading,
              :page_url,
              :title,
              :cover_image
            )
            record.class.new(options).valid?
          end.uniq

          if validations.any?(&:!)

            definitions = record.base_title(
              title: 'Top Articles',
              subtitle: 'Suggest helpful articles'
            ) + record.top_articles_schema(
              record.class.generate_collection_definitions(
                articles,
                append: false,
                validate: true
              )
            )

            return {
              kind: kind,
              definitions: definitions.flatten
            }

          else

            return {
              kind: 'initialize',
              definitions: [],
              results: ctx[:values]
            }

          end
        end

        if ctx.dig(:field, :id) == 'add-new-article'
          record.heading = ctx.dig(:values, 'heading')

          articles = ctx.dig(:values, 'article')
          definitions = record.base_title(
            title: 'Top Articles',
            subtitle: 'Suggest helpful articles'
          ) + record.top_articles_schema(
            record.class.generate_collection_definitions(
              articles, append: true, validate: false
            )
          )
          return {
            kind: kind,
            definitions: definitions.flatten
          }
        end

        if ctx.dig(:field, :id).include? 'autofill-'

          record.heading = ctx.dig(:values, 'heading')

          autofill_index = ctx.dig(:field, :id).split('-').last.to_i
          articles = ctx.dig(:values, 'article')

          definitions = record.base_title(
            title: 'Top Articles',
            subtitle: 'Suggest helpful articles'
          ) + record.top_articles_schema(
            record.class.generate_collection_definitions(
              articles,
              append: false,
              validate: false,
              autofill_index: autofill_index
            )
          )
          return {
            kind: kind,
            definitions: definitions.flatten
          }

        end

      end

      {
        kind: kind,
        # ctx: ctx,
        definitions: definitions
      }
    end

    # Submit Sheet flow webhook URL (optional)
    # Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
    def self.sheet_hook(params)
      []
    end
  end
end
