# frozen_string_literal: true
require 'uri'

module MessageApis
  class ContentShowcase

    attr_accessor :secret

    def initialize(config:)

    end

    def trigger(event)
      #binding.pry
      #case event.action
      #when 'email_changed' then register_contact(event.eventable)
      #end
    end

    def enqueue_process_event(params, package)
      HookMessageReceiverJob.perform_now(
        id: package.id, 
        params: params.permit!.to_h
      )
    end

    def process_event(params, package)
      
    end

    # for display in replied message
    def self.display_data(data)
      return if data.blank?
      k = data["cancelled"] ? "canceled" : "confirmed"
      {
        "#{k}": "you are scheduled with 
        #{data['assigned_to'].join(", ")} 
        at Calendly on #{data['start_time_pretty']}",
        formatted_text: "you are scheduled with 
        #{data['assigned_to'].join(", ")} 
        at Calendly on #{data['start_time_pretty']}"
      }
    end

    class PresenterManager
      # Initialize flow webhook URL
      # Sent when an app has been inserted into a conversation, message or 
      # the home screen, so that you can render the app.
      def self.initialize_hook(kind: , ctx:)
       
        if ctx.dig(:values, :article)

          record = AnnouncementRecord.new(
            heading: ctx.dig(:values, :heading)
          )

          articles = ctx.dig(:values, :article)
          # TODO: validate ?
          items = articles.map{ |o| 
            options = o.permit(
              :description,
              :heading,
              :page_url,
              :title,
              :cover_image
            )
            record.class.new(options)
          }

          definitions = record.article_presentation_fields(items)
          
          return {
            definitions: definitions
          }
        end
        
        aa = AnnouncementRecord.new(
          ctx.dig(:values).permit(
            :description,
            :heading,
            :page_url,
            :title,
            :cover_image
          ) 
        )

        definitions = aa.presentation_schema

        {
          #kind: kind, 
          #ctx: ctx, 
          wait_for_input: false,
          definitions: definitions 
        }

      end

      # Submit flow webhook URL
      # Sent when an end-user interacts with your app, via a button, 
      # link, or text input. This flow can occur multiple times as an 
      # end-user interacts with your app.
      def self.submit_hook(kind: , ctx:)
        {content: {kind: kind, ctx: ctx}}

        definitions = [
          {
            "type":  "text",
            "text":  "yes!!!!!",
            "style": "header"
          },
          {
            "type":  "text",
            "text":  "This is paragraph text. Here's a [link](https://dev.chaskiq.io/). Here's some *bold text*. Lorem ipsum.",
            "style": "paragraph"
          }
        ]

        {
          #kind: kind, 
          #ctx: ctx, 
          definitions: definitions 
        }

      end

      # Configure flow webhook URL (optional)
      # Sent when a teammate wants to use your app, so that you can show 
      # them configuration options before it’s inserted. Leaving this option 
      # blank will skip configuration.
      def self.configure_hook(kind: , ctx:)
        
        record = AnnouncementRecord.new
        base_definitions = record.base_schema

        definitions = base_definitions

        if ctx.dig(:field, :action, :type) === "submit"
          if ctx.dig(:field, :id) == "pick-another"
            return  {
              kind: kind, 
              definitions: base_definitions, 
            }
          end

          if ctx.dig(:field, :id) == "announcement"
            definitions = record.base_title(
              title: "Announcement", 
              subtitle: "Broadcast a message") + record.customize_buttons(type: 'announcement')

            return  {
              kind: kind, 
              definitions: definitions, 
            }
          end

          if ctx.dig(:field, :id) == "top-articles"
            definitions = record.base_title(
              title: "Top Articles", 
              subtitle: "Suggest helpful articles") + record.customize_buttons(type: 'top-articles')

            return  {
              kind: kind, 
              definitions: definitions, 
            }
          end

          if ctx.dig(:field, :id) == "autofill"
            aa = AnnouncementRecord.new(
              description: ctx.dig(:values, :description),
              heading: ctx.dig(:values, :heading),
              page_url: ctx.dig(:values, :page_url),
              title: ctx.dig(:values, :title)
            )
            aa.autofill
            aa.schema

            return  {
              kind: kind, 
              definitions: aa.schema, 
            }
          end

          if ctx.dig(:field, :id) == "add-to-messenger"
            aa = AnnouncementRecord.new(
              description: ctx.dig(:values, :description),
              heading: ctx.dig(:values, :heading),
              page_url: ctx.dig(:values, :page_url),
              title: ctx.dig(:values, :title)
            )
            aa.autofill
            aa.schema

            if !aa.valid?
              return  {
                kind: kind, 
                definitions: aa.schema, 
              }
            end

            return  {
              kind: 'initialize', 
              definitions: aa.schema, 
              results: ctx.dig(:values) 
            }
          end


          # CUSTOMIZE ACTIONS

          if ctx.dig(:field, :id) == "customize-announcement"

            definitions = record.base_title(
              title: "Announcement", 
              subtitle: "Broadcast a message"
            ) + record.schema

            return  {
              kind: kind, 
              definitions: definitions, 
            }
          end

          if ctx.dig(:field, :id) == "customize-top-articles"
            definitions = record.base_title(
              title: "Top Articles", 
              subtitle: "Suggest helpful articles"
            ) + record.top_articles_schema

            return  {
              kind: kind, 
              definitions: definitions, 
            }
          end

          if ctx.dig(:field, :id) == "add-articles-to-messenger"
            articles = ctx.dig(:values, "article") 

            record.heading = ctx.dig(:values, "heading")

            validations = articles.map{ |o| 
              options = o.permit(
                :description,
                :heading,
                :page_url,
                :title,
                :cover_image
              )
              record.class.new(options).valid?
            }.uniq

            if validations.any?{|o| !o}

              definitions = record.base_title(
                title: "Top Articles", 
                subtitle: "Suggest helpful articles"
              ) + record.top_articles_schema(
                record.class.generate_collection_definitions(
                  articles, 
                  append: false, 
                  validate: true
                )              
              )
  
              return  {
                kind: kind, 
                definitions: definitions.flatten,
              }

            else

              return  {
                kind: 'initialize', 
                definitions: [], 
                results: ctx.dig(:values) 
              }

            end
          end

          if ctx.dig(:field, :id) == "add-new-article"
            record.heading = ctx.dig(:values, "heading")

            articles = ctx.dig(:values, "article") 
            definitions = record.base_title(
              title: "Top Articles", 
              subtitle: "Suggest helpful articles"
            ) + record.top_articles_schema(
              record.class.generate_collection_definitions(
                articles, append: true, validate: false
              )
            )
            return  {
              kind: kind, 
              definitions: definitions.flatten
            }
          end

          if ctx.dig(:field, :id).include? "autofill-"

            record.heading = ctx.dig(:values, "heading")

            autofill_index = ctx.dig(:field, :id).split("-").last.to_i
            articles = ctx.dig(:values, "article")

            definitions = record.base_title(
              title: "Top Articles", 
              subtitle: "Suggest helpful articles"
            ) + record.top_articles_schema(
              record.class.generate_collection_definitions(
                articles, 
                append: false, 
                validate: false,
                autofill_index: autofill_index
              )
            )
            return  {
              kind: kind, 
              definitions: definitions.flatten, 
            }

          end

        end

        {
          kind: kind, 
          #ctx: ctx, 
          definitions: definitions 
        }
      end

      #Submit Sheet flow webhook URL (optional)
      #Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
      def self.sheet_hook(params)
        []
      end


    end
  
  end
end

class AnnouncementRecord
  include ActiveModel::Model
  include ActiveModel::Validations
  attr_accessor :heading, :title, :page_url, :description, :cover_image

  validates :title, presence: true
  validates_format_of :page_url, with: URI::regexp

  def autofill
    return if (!valid? && errors[:page_url].present?) or page_url.blank?
    res = FetchLinkCardService.new.call(self.page_url)
    self.title = res.title
    self.cover_image = res.images.first[:url] if res.images.any?
    self.description = res.description
  end

  def base_title(title: , subtitle:)
    [{
      "type":  "text",
      "text":  title,
      "style": "header",
      "align": "center"
    },
    {
      "type":  "text",
      "text":  subtitle,
      "style": "muted",
      "align": "center"
    },
    {
      "type":  "separator"
    }]
  end

  def customize_buttons(type:)
    [
      {
        type: "button",
        id: "customize-#{type}",
        label: "Customize",
        action: {
          type: "submit" 
        }
      },

      {
        type: "button",
        id: "pick-another",
        variant: 'outlined',
        size: 'small',
        label: "Pick another template",
        action: {
          type: "submit" 
        }
      }
    ]
  end

  def base_schema
    [

      {
        "type":  "text",
        "text":  "Pick a template",
        "style": "header"
      },

      {
        type: "list",
        disabled: false,
        items: [
          {
            "type": "item",
            "id": "announcement",
            "title": "Announcement",
            "subtitle": "Broadcast a new message",
            "action": {
              "type": "submit"
            }
          },
          {
            "type": "item",
            "id": "top-articles",
            "title": "Top Articles",
            "subtitle": "Suggest helpful articles",
            "action": {
              "type": "submit"
            }
          }
        ]
      }
    ]
  end

  def schema
    
    [
      {
        "type":  "separator"
      },
      {
        type: 'input',
        name: 'heading',
        label: "heading",
        placeholder: "Introduce your announcement",
        id: 'heading',
        value: self.heading
      },
      {
        "type":  "separator"
      },
      {
        type: 'input',
        name: 'page_url',
        label: "Page url",
        placeholder: "e.g. https://blog.chaskiq.io",
        id: 'page_url',
        value: self.page_url,
        errors: errors[:page_url].any? ? errors[:page_url].uniq.join(", ") : nil
      },
      {
        type: 'spacer',
        size: 's'
      },
      {
        type: 'button',
        variant: 'outlined',
        id: 'autofill',
        size: 'small',
        label: 'autofill inputs with page details',
        action: {
          type: 'submit'
        }
      },
      {
        type: 'spacer',
        size: 's'
      },
      {
        type: 'input',
        label: "Title (required)",
        value: self.title,
        placeholder: "e.g. https://blog.chaskiq.io",
        id: 'title'
      },
      {
        type: 'input',
        label: "Description",
        value: self.description,
        placeholder: "Make a short description",
        id: 'description'
      },
      {
        type: 'input',
        label: "Cover image url (required)",
        value: self.cover_image,
        placeholder: "e.g. https://blog.chaskiq.io",
        id: 'cover_image'
      },
      {
        "type":  "separator"
      },
      {
        type: 'button',
        size: 'small',
        id: 'add-to-messenger',
        label: 'Add to messenger home',
        action: {
          type: 'submit'
        }
      }
    ]
  end

  def top_articles_up
    [
      { "type":  "separator" },
      {
        type: 'spacer',
        size: 'sm'
      },
      {
        type: 'input',
        name: 'heading',
        label: "heading",
        placeholder: "Introduce your announcement",
        id: 'heading',
        value: self.heading
      },
      {
        type: 'spacer',
        size: 'sm'
      },
      {
        "type":  "separator"
      }
    ]
  end

  def top_articles_buttons
    [
      {
        type: 'button',
        size: 'small',
        id: 'add-new-article',
        variant: 'outlined',
        label: 'Add new article',
        action: {
          type: 'submit'
        }
      },
      {
        "type":  "separator"
      },
      {
        type: 'button',
        size: 'small',
        id: 'add-articles-to-messenger',
        label: 'Add articles to messenger home',
        action: {
          type: 'submit'
        }
      }
    ]
  end

  def top_articles_schema(fields=nil)
    top_articles_up  + (fields || article_fields)  + top_articles_buttons
  end

  def article_fields(index=0)
    fields = [
      {
        type: 'text',
        style: 'header',
        text: "Article"
      },
      {
        type: 'input',
        name: "article[#{index}][page_url]",
        label: "Page url",
        placeholder: "e.g. https://blog.chaskiq.io",
        id: 'page_url',
        value: self.page_url,
        errors: errors[:page_url].any? ? errors[:page_url].uniq.join(", ") : nil
      },
      {
        type: 'spacer',
        size: 's'
      },
      {
        type: 'button',
        variant: 'outlined',
        id: "autofill-#{index}",
        size: 'small',
        label: 'autofill inputs with page details',
        action: {
          type: 'submit'
        }
      },
      {
        type: 'spacer',
        size: 's'
      },
      {
        type: 'input',
        label: "Title (required)",
        name: "article[#{index}][title]",
        value: self.title,
        placeholder: "e.g. https://blog.chaskiq.io",
        id: 'title'
      },
      {
        type: 'input',
        label: "Description",
        name: "article[#{index}][description]",
        value: self.description,
        placeholder: "Make a short description",
        id: 'description'
      },
      {
        type: 'input',
        label: "Cover image url (required)",
        name: "article[#{index}][cover_image]",
        value: self.cover_image,
        placeholder: "e.g. https://blog.chaskiq.io",
        id: 'cover_image'
      },
      {
        "type":  "separator"
      }
    ]

  end

  # list
  def presentation_schema
    [
      {
        "type":  "separator"
      },
      {
        type: 'text',
        style: 'header',
        text: self.heading
      },
      {
        "type":  "separator"
      },
      {
        "type": "image",
        "url": self.cover_image,
        "height": 200,
        "width": '100%',
        "align": "center"
      },
      {
        type: "list",
        disabled: false,
        items: [
          {
            "type": "item",
            "id": "list-item-1",
            "title": self.title,
            "subtitle": self.description,
            "action": {
              "type": "url",
              "url": self.page_url
            }
          }
        ]
      }
    ]
  end

  # list
  def presentation_schema_list
    [
      {
        "type":  "separator"
      },
      {
        type: 'text',
        style: 'header',
        text: self.heading
      },
      {
        "type":  "separator"
      },
      {
        type: "list",
        disabled: false,
        items: [
          {
            "type": "item",
            "id": "list-item-1",
            "title": self.title,
            "subtitle": self.description,
            "image": self.cover_image,
            "action": {
              "type": "url",
              "url": self.page_url
            }
          }
        ]
      }
    ]
  end

  def self.generate_collection(items)
    items.map{|o| self.new(o)}
  end

  def self.generate_collection_definitions(items, append: false, validate: false, autofill_index: nil )
    items.map!{ |o| 
      o.permit(
        :description,
        :heading,
        :page_url,
        :title,
        :cover_image
      )
    }

    result = self.generate_collection(items)
    .each_with_index.map{ |o, i|
      o.valid? if validate
      o.autofill if autofill_index == i
      o.article_fields(i)
    }
    result += self.new.article_fields(result.size) if append
    result
  end

  def self.collection_presentation(items)
    items.map!{ |o| 
      o.permit(
        :description,
        :heading,
        :page_url,
        :title,
        :cover_image
      )
    }

    result = self.generate_collection(items)
    .each_with_index.map{ |o, i|
      o
      #o.valid? #if validate
    }
    result += self.new.article_fields(result.size) if append
    result
  end

  def article_presentation_fields(items)

    [
      {
        "type":  "separator"
      },
      {
        type: 'text',
        style: 'header',
        text: self.heading
      },
      {
        "type":  "separator"
      },
      {
        type: "list",
        disabled: false,
        items: items.map(&:list_item)
      }
    ]

  end

  def list_item
    {
      "type": "item",
      "id": "list-item-1",
      "title": self.title,
      "subtitle": self.description,
      "image": self.cover_image,
      "action": {
        "type": "url",
        "url": self.page_url
      }
    }
  end


end
