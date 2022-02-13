module MessageApis::Bootic
  class Presenter
    # Initialize flow webhook URL
    # Sent when an app has been inserted into a conversation, message or the home screen, so that you can render the app.
    def self.initialize_hook(kind:, ctx:)
      definitions = []

      type_value = ctx.dig(:values, :type)
      block_type = ctx.dig(:values, :block_type)

      case ctx.dig(:values, :type)
      when "order-search"
        {
          values: { block_type: block_type },
          definitions: order_search_definitions
        }
      when "products-list"
        {
          values: { block_type: block_type },
          definitions: [
            {
              type: "content"
            }
          ]
        }
      end
    end

    def self.content_hook(kind:, ctx:)
      {
        definitions: search_products(kind: kind, ctx: ctx)
      }
    end

    # Submit flow webhook URL
    # Sent when an end-user interacts with your app, via a button, link, or text input. This flow can occur multiple times as an end-user interacts with your app.
    def self.submit_hook(kind:, ctx:)
      case ctx[:field]["id"]
      when "bootic-q-order"
        definitions = search_order(kind: kind, ctx: ctx)
      when "back-to-order-search"
        definitions = order_search_definitions
      when "bootic-q", "back-to-list"
        definitions = search_products(kind: kind, ctx: ctx)
      else
        definitions = display_product_details(kind: kind, ctx: ctx)
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

      menu = [
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

      definitions = menu

      # a pre configure logic  in case shop does not exist
      if ctx[:package].settings["shop"].blank?
        if ctx.dig(:field, :id).present? && ctx.dig(:field, :id).include?("selected-shop")
          id = ctx.dig(:field, :id).split("--").last
          ctx[:package].settings["shop"] = id
          ctx[:package].save
          # return menu definitions
          return {
            definitions: definitions
          }
        end
        return product_list_site_chooser(kind: kind, ctx: ctx)
      end

      if ctx.dig(:field, :id).present? # == "confirm" &&
        # ctx.dig(:field, :action, :type) === "submit"
        case ctx.dig(:field, :id)
        when "products-list"
          return {
            kind: "initialize",
            definitions: definitions,
            results: {
              type: "products-list",
              block_type: "dynamic"
            }
          }
        when "order-search"
          return {
            kind: "initialize",
            definitions: definitions,
            results: {
              type: "order-search",
              block_type: "static"
            }
          }
        end
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

    def self.order_search_definitions
      [
        {
          type: "text",
          text: "Bootic shop order search",
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
          id: "bootic-q-order",
          name: "search_order",
          label: "Find Order Status",
          placeholder: "Search for order id...",
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

    def self.product_search_definitions
      [
        {
          type: "text",
          text: "Bootic shop product search",
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
          name: "search_product",
          label: "Find products quickly",
          placeholder: "Search for a product...",
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
                   tertiary_text: "#{o['tags'].join(', ')} $#{o['price']}",
                   image: image,
                   action: {
                     type: "submit"
                     # url: "/package_iframe_internal/ArticleSearch"
                   }
                 }
               end
      }
    end

    def self.display_product_details(kind:, ctx:)
      api = ctx[:package].message_api_klass

      response = JSON.parse(api.get_product(ctx[:field]["id"]).body)

      image = response.dig("_embedded", "images").first

      definitions = [
        {
          text: response["title"],
          type: "text",
          style: "header",
          align: "center"
        },
        {
          text: "#{response['currency_code']} $#{response['price']}",
          type: "text"
        },
        {
          type: "image",
          url: image.dig("_links", "medium", "href"),
          height: "376",
          width: "376"
          # align: ,
          # rounded:
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

        { type: "separator" },

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

      response = api.get_products(q: ctx.dig(:value, :search_product))
      products = JSON.parse(response.body).dig("_embedded", "items")

      definitions = []
      definitions += product_search_definitions

      empty_search = {
        type: "text",
        text: "0 results! search again"
      }

      return definitions << empty_search if products.blank?

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

    def self.search_order(kind:, ctx:)
      api = ctx[:package].message_api_klass

      # "C6CF659"
      response = api.get_order(ctx[:value][:search_order]) # .get_products(q: ctx.dig(:value, :search_product))

      order = JSON.parse(response.body)

      back_button = {
        id: "back-to-order-search",
        label: "Back",
        type: "button",
        variant: "link",
        align: "left",
        action: {
          type: "submit"
        }
      }

      if response.status != 200
        return [
          {
            type: "text",
            text: "order not found, search again"
          },
          back_button
        ]
      end

      [
        {
          type: "text",
          style: "header",
          text: "ORDER: nº #{order['code']}"
        },

        { type: "separator" },

        {
          type: "text",
          text: "status #{order['status']}"
        },
        {
          type: "text",
          text: "fullfilment status: #{order['fulfillment_status']}"
        },

        { type: "separator" },

        table_for(
          order,
          %w[id shop_id code status],
          nil
        ),
        { type: "separator" },

        {
          type: "text",
          style: "header",
          text: "Pricing information"
        },

        table_for(
          order,
          %w[net_total discount_total cart_total shipping_total shipping_discount shipping_minus_discount prices_include_tax],
          nil
        ),

        { type: "separator" },

        {
          type: "text",
          style: "header",
          align: "right",
          text: "Total #{order['total']}"
        },

        { type: "separator" },

        {
          type: "text",
          style: "header",
          text: "Refund information"
        },

        table_for(
          order,
          %w[total_refunded max_refundable_amount],
          nil
        ),

        { type: "separator" },

        {
          type: "text",
          style: "header",
          text: "Payment Info"
        },

        table_for(
          order["payment_info"],
          %w[name type],
          nil
        ),

        { type: "separator" },

        {
          type: "text",
          style: "header",
          text: "Shipping Address"
        },

        table_for(
          order["_embedded"]["address"],
          %w[street country_name region_name],
          nil
        ),

        { type: "separator" },

        {
          type: "text",
          style: "header",
          text: "Contact"
        },

        table_for(
          order["_embedded"]["contact"],
          %w[id name email phone_number],
          nil
        ),

        { type: "separator" },

        {
          type: "text",
          style: "header",
          text: "Line Items"
        },

        {
          type: "list",
          disabled: false,
          items: order["_embedded"]["line_items"].map do |item|
            {
              type: "item",
              id: item["product_slug"],
              title: item["variant_title"],
              subtitle: (item["total"]).to_s,
              url: item.dig("_embedded", "image", "_links", "thumbnail", "href"),
              action: {
                type: "submit"
              }
            }
          end
        },

        { type: "separator" },

        table_for(
          order,
          %w[created_on updated_on pending_on closed_on shipped_on],
          ->(item) { date_format(item) }
        ),
        { type: "separator" },

        back_button
      ]
    end

    def self.table_for(object, items, render = nil)
      { type: "data-table",
        items: items.map do |item|
          {
            type: "field-value",
            field: item.humanize,
            value: render.is_a?(Proc) ? render.call(object[item]) : object[item]
          }
        end }
    end

    def self.product_list_site_chooser(kind:, ctx:)
      api = ctx[:package].message_api_klass

      response = JSON.parse(api.test.body)

      apps = response["_embedded"]["shops"]

      definitions = [
        {
          type: "text",
          text: "Select a shop",
          style: "header"
        },
        {
          type: "text",
          text: "in order to configure action on this plugin you must choose a shop first"
        },
        {
          type: "list",
          disabled: false,
          items: apps.map do |o|
                   {
                     type: "item",
                     id: "selected-shop--#{o['id']}",
                     title: o["name"],
                     subtitle: o["subdomain"],
                     action: {
                       type: "submit"
                     }
                   }
                 end
        }
      ]

      {
        # kind: "initialize",
        definitions: definitions,
        results: {
          type: "products-list",
          block_type: "dynamic"
        }
      }
    end

    def self.date_format(date)
      I18n.l(Date.parse(date), format: :short)
    rescue StandardError
      "--"
    end
  end
end
