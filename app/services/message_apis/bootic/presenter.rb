module MessageApis::Bootic
  class Presenter

    def self.search_definitions
      [
        {
          type: "text",
          text: "Help Center",
          style: "header"
        },
        {
          name: "a",
          label: "a separator",
          action: {},
          type: "separator"
        },
        {
          type: "input",
          id: "bootic-q",
          name: "search_articles",
          label: "Find Answers Quickly",
          placeholder: "Search for an article...",
          save_state: "unsaved",
          action: {
            type: "submit"
          }
        },
        {
          type: "spacer",
          size: "m"
        }
      ]
    end

    def self.products_lists(products)
      {
        type: "list",
        disabled: false,
        items: products.map do |o|
          image = products.first.dig(
            "_embedded", 
            "image", 
            "_links", 
            "thumbnail", 
            "href"
          )
                 
          {
              type: "item",
              id: o["slug"],
              title: o["title"],
              subtitle: o["description"],
              tertiary_text: "#{o["tags"].join(', ')} #{o["price"]}",
              image: image,
              action: {
                type: "submit",
                #url: "/package_iframe_internal/ArticleSearch"
              }
            }
          end
      }
    end

    # Initialize flow webhook URL
    # Sent when an app has been inserted into a conversation, message or the home screen, so that you can render the app.
    def self.initialize_hook(kind:, ctx:)
      definitions = []
      #{
      #  kind: "initialize",
      #  definitions: definitions,
      #  values: {}
      #}

      definitions = search_definitions

      type_value = ctx.dig(:values, :type)
      block_type = ctx.dig(:values, :block_type)
      return {
        # ctx: ctx,
        values: { block_type: block_type },
        definitions: [
          {
            type: "content"
          }
        ]
      }

      {
        # kind: kind,
        # ctx: ctx,
        definitions_url: "",
        definitions: definitions
      }
    end

    def self.content_hook(kind:, ctx:)
      {
        definitions: self.search_products(kind: kind, ctx: ctx)
      }
    end

    # Submit flow webhook URL
    # Sent when an end-user interacts with your app, via a button, link, or text input. This flow can occur multiple times as an end-user interacts with your app.
    def self.submit_hook(kind:, ctx:)

      case ctx[:field]["id"]
      when "bootic-q", "back-to-list"
        definitions = self.search_products(kind: kind, ctx: ctx)
      else
        definitions = self.display_product_details(kind: kind, ctx: ctx)
      end

      {
        kind: "submit",
        definitions: definitions,
        values: {}
      }
    end

    # Configure flow webhook URL (optional)
    # Sent when a teammate wants to use your app, so that you can show them configuration options before it’s inserted. Leaving this option blank will skip configuration.
    def self.configure_hook(kind:, ctx:)
      app = ctx[:package].app

      definitions = [
        {
          type: "text",
          style: "header",
          align: "center",
          text: "Bootic Plugin"
        },
        {
          type: "text",
          style: "muted",
          align: "center",
          text: "Choose the right Bootic plugin"
        },
        {
          type: "separator"
        },
        {
          type: "text",
          text: "Pick a template",
          style: "header"
        },
        {
          type: "list",
          disabled: false,
          items: [
            {
              type: "item",
              id: "products-list",
              title: "Product List",
              subtitle: "display a list of products",
              action: {
                type: "submit"
              }
            },
            {
              type: "item",
              id: "order-search",
              title: "Order Search",
              subtitle: "display a form to search an specific order",
              action: {
                type: "submit"
              }
            }
          ]
        }
      ]

      if ctx.dig(:field, :id).present? # == "confirm" &&
        #ctx.dig(:field, :action, :type) === "submit"
        return {
          kind: "initialize",
          definitions: definitions,
          results: ctx[:values]
        }
      end

      {
        # kind: kind,
        # ctx: ctx,
        definitions: definitions
      }
    end

    # Submit Sheet flow webhook URL (optional)
    # Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
    def self.sheet_hook(params)
      { a: 11_111 }
    end

    def self.sheet_view(params); end

    def self.display_product_details(kind:, ctx:)
      api = ctx[:package].message_api_klass
      
      response = JSON.parse(api.get_product(ctx[:field]['id']).body)
      
      image = response.dig("_embedded", "images").first

      definitions = [
        {
          text: response["title"],
          type: "text",
          style: "header",
          align: "center"
        },
        {
          text: "#{response["currency_code"]} #{response["price"]}",
          type: "text"
        },
        {
          type: "image",
          url: image.dig("_links","medium","href"), 
          height: '376' , 
          width: '376' , 
          #align: , 
          #rounded: 
        },

        {
          type: "text",
          text: image["title"],
          align: "center",
          style: "muted"
        },

        {
          text: response["description"],
          type: "text"
        },
        {
          text: response["tags"].join(", ") || "--",
          type: "text",
          align: "right",
          style: "muted"
        },
        
        {type: "separator"},

        {
          id: "back-to-list",
          label: "Back",
          type: "button",
          variant: "link",
          align: "left",
          action: {
            type: "submit"
          }
        }
      ]

    end

    ### def self.search_products
    def self.search_products(kind:, ctx:)
      api = ctx[:package].message_api_klass
      ## all products
      response = api.get_products(q: ctx.dig(:value, :search_articles))
      products = JSON.parse(response.body).dig("_embedded","items")

      definitions = []
      definitions += search_definitions

      empty_search = {
        type: "text",
        text: "0 results! search again"
      }

      if products.blank?
        return definitions << empty_search 
      end

      definitions << products_lists(products)

      definitions << {
        id: "fullcontact-enrich-btn",
        label: "Edit fields",
        type: "button",
        action: {
          type: "submit"
        }
      }
    end
  end
end
