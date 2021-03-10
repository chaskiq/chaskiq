# frozen_string_literal: true

include ActionView::Helpers::AssetUrlHelper
include Webpacker::Helper

module MessageApis
  class ArticleSearch
    attr_accessor :secret

    def initialize(config:); end

    def trigger(event); end

    def enqueue_process_event(params, package)
      HookMessageReceiverJob.perform_now(
        id: package.id,
        params: params.permit!.to_h
      )
    end

    def process_event(params, package); end

    # for display in replied message
    def self.display_data(data); end

    class PresenterManager
      def self.search_definitions
        [
          {
            type: 'text',
            text: 'Help Center',
            style: 'header'
          },
          {
            name: 'a',
            label: 'a separator',
            action: {},
            type: 'separator'
          },
          {
            type: 'input',
            id: 'unsaved-2',
            name: 'search_articles',
            label: 'Find Answers Quickly',
            placeholder: 'Search for an article...',
            save_state: 'unsaved',
            action: {
              type: 'submit'
            }
          },
          {
            type: 'spacer',
            size: 'm'
          }
        ]
      end

      # Initialize flow webhook URL
      # Sent when an app has been inserted into a conversation, message or
      # the home screen, so that you can render the app.
      def self.initialize_hook(kind:, ctx:)
        definitions = search_definitions
        {
          # kind: kind,
          # ctx: ctx,
          definitions_url: '',
          definitions: definitions
        }
      end

      # Submit flow webhook URL
      # Sent when an end-user interacts with your app, via a button,
      # link, or text input. This flow can occur multiple times as an
      # end-user interacts with your app.
      def self.submit_hook(kind:, ctx:)
        { content: { kind: kind, ctx: ctx } }

        term = ctx.dig(:values, :search_articles)
        # I18n.locale = lang
        if term.present?
          articles = ctx[:app].articles.published
                              .includes([:author, :collection, :section, { article_content: :translations }])
                              .search(term)
                              .page(1)
                              .per(10)
        end

        unless term.present?
          articles = ctx[:app].articles.published
                              .includes([:author, :collection, :section, { article_content: :translations }])
                              .page(1)
                              .per(5)
        end

        results = [
          {
            type: 'spacer',
            size: 'm'
          },
          {
            type: 'list',
            disabled: false,
            items: articles.map do |o|
              {
                type: 'item',
                id: o.slug.to_s,
                title: o.title || '---',
                subtitle: o.description,
                action: {
                  type: 'frame',
                  url: '/package_iframe_internal/ArticleSearch'
                }
              }
            end
          },
          {
            type: 'spacer',
            size: 'm'
          }
        ]

        definitions = search_definitions << results

        {
          # kind: kind,
          # ctx: ctx,
          definitions: definitions.flatten
        }
      end

      # Configure flow webhook URL (optional)
      # Sent when a teammate wants to use your app, so that you can show
      # them configuration options before it’s inserted. Leaving this option
      # blank will skip configuration.
      def self.configure_hook(kind:, ctx:)
        definitions = [
          {
            type: 'text',
            text: 'The Article Search',
            style: 'header',
            align: 'center'
          },
          {
            type: 'text',
            text: 'The Article Search app gives a new home for your Help Center right inside the Messenger.',
            style: 'muted',
            align: 'center'
          },
          {
            id: 'activate-action',
            label: 'Activate plugin',
            type: 'button',
            align: 'center',
            action: {
              type: 'submit'
            }
          }
        ]

        if ctx.dig(:field, :action, :type) === 'submit' && (ctx.dig(:field, :id) == 'activate-action')
          results = {
            foo: 'bar',
            baz: 'baaz'
          }

          return  {
            kind: 'initialize',
            # ctx: ctx,
            definitions: definitions,
            results: results
          }
        end

        {
          kind: kind,
          # ctx: ctx,
          definitions: definitions
        }
      end

      # Submit Sheet flow webhook URL (optional)
      # Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
      def self.sheet_hook(_params)
        []
      end

      def self.sheet_view(params)
        @user = params[:user]

        @article = App.find_by(
          key: params[:app_key]
        ).articles.friendly.find(params.dig(:field, :id))

        @name = @user[:name]
        @email = @user[:email]

        @json_article = @article.as_json(
          methods: [:serialized_content],
          include: %i[author collection]
        )

        template = ERB.new <<~EOF
                              <html lang="en">
                                <head>
                                  <meta charset="UTF-8">
                                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                  <meta http-equiv="X-UA-Compatible" content="ie=edge">
                                  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;600;700;800;900&display=swap" rel="stylesheet">
                                  <title>[Chaskiq Article]</title>
          #{'          '}
                                  <style>
                                    body {
                                      font-family: 'Inter', sans-serif;
                                    }
                                  </style>
          #{'          '}
                                  <script>
          #{'          '}
                                    window.articleJson=<%= @json_article.to_json %>
                                    window.domain="<%= Rails.application.config.action_controller.asset_host %>";
                    #{'              '}
                                  </script>
                                  <script src="<%= "#{Rails.application.config.action_controller.asset_host}#{asset_pack_url('article.js')}" %>"></script>
          #{'          '}
                                </head>
          #{'          '}
                                <body>
                                  <div class="container">
                                    <div id="main-page">
                                    </div>
                                  </div>
          #{'          '}
                                </body>
                              </html>
        EOF

        template.result(binding)
      end
    end
  end
end
