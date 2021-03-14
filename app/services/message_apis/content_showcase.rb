# frozen_string_literal: true

require 'uri'

module MessageApis
  class ContentShowcase < BasePackage
    attr_accessor :secret    
  end
end

class AnnouncementRecord
  include ActiveModel::Model
  include ActiveModel::Validations
  attr_accessor :heading, :title, :page_url, :description, :cover_image

  validates :title, presence: true
  validates_format_of :page_url, with: URI::DEFAULT_PARSER.make_regexp

  def autofill
    return if (!valid? && errors[:page_url].present?) || page_url.blank?

    res = FetchLinkCardService.new.call(page_url)
    self.title = res.title
    self.cover_image = res.images.first[:url] if res.images.any?
    self.description = res.description
  end

  def base_title(title:, subtitle:)
    [{
      type: 'text',
      text: title,
      style: 'header',
      align: 'center'
    },
     {
       type: 'text',
       text: subtitle,
       style: 'muted',
       align: 'center'
     },
     {
       type: 'separator'
     }]
  end

  def customize_buttons(type:)
    [
      {
        type: 'button',
        id: "customize-#{type}",
        label: 'Customize',
        action: {
          type: 'submit'
        }
      },

      {
        type: 'button',
        id: 'pick-another',
        variant: 'outlined',
        size: 'small',
        label: 'Pick another template',
        action: {
          type: 'submit'
        }
      }
    ]
  end

  def base_schema
    [

      {
        type: 'text',
        text: 'Pick a template',
        style: 'header'
      },

      {
        type: 'list',
        disabled: false,
        items: [
          {
            type: 'item',
            id: 'announcement',
            title: 'Announcement',
            subtitle: 'Broadcast a new message',
            action: {
              type: 'submit'
            }
          },
          {
            type: 'item',
            id: 'top-articles',
            title: 'Top Articles',
            subtitle: 'Suggest helpful articles',
            action: {
              type: 'submit'
            }
          }
        ]
      }
    ]
  end

  def schema
    [
      {
        type: 'separator'
      },
      {
        type: 'input',
        name: 'heading',
        label: 'heading',
        placeholder: 'Introduce your announcement',
        id: 'heading',
        value: heading
      },
      {
        type: 'separator'
      },
      {
        type: 'input',
        name: 'page_url',
        label: 'Page url',
        placeholder: 'e.g. https://blog.chaskiq.io',
        id: 'page_url',
        value: page_url,
        errors: errors[:page_url].any? ? errors[:page_url].uniq.join(', ') : nil
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
        label: 'Title (required)',
        value: title,
        placeholder: 'e.g. https://blog.chaskiq.io',
        id: 'title'
      },
      {
        type: 'input',
        label: 'Description',
        value: description,
        placeholder: 'Make a short description',
        id: 'description'
      },
      {
        type: 'input',
        label: 'Cover image url (required)',
        value: cover_image,
        placeholder: 'e.g. https://blog.chaskiq.io',
        id: 'cover_image'
      },
      {
        type: 'separator'
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
      { type: 'separator' },
      {
        type: 'spacer',
        size: 'sm'
      },
      {
        type: 'input',
        name: 'heading',
        label: 'heading',
        placeholder: 'Introduce your announcement',
        id: 'heading',
        value: heading
      },
      {
        type: 'spacer',
        size: 'sm'
      },
      {
        type: 'separator'
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
        type: 'separator'
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

  def top_articles_schema(fields = nil)
    top_articles_up + (fields || article_fields) + top_articles_buttons
  end

  def article_fields(index = 0)
    fields = [
      {
        type: 'text',
        style: 'header',
        text: 'Article'
      },
      {
        type: 'input',
        name: "article[#{index}][page_url]",
        label: 'Page url',
        placeholder: 'e.g. https://blog.chaskiq.io',
        id: 'page_url',
        value: page_url,
        errors: errors[:page_url].any? ? errors[:page_url].uniq.join(', ') : nil
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
        label: 'Title (required)',
        name: "article[#{index}][title]",
        value: title,
        placeholder: 'e.g. https://blog.chaskiq.io',
        id: 'title'
      },
      {
        type: 'input',
        label: 'Description',
        name: "article[#{index}][description]",
        value: description,
        placeholder: 'Make a short description',
        id: 'description'
      },
      {
        type: 'input',
        label: 'Cover image url (required)',
        name: "article[#{index}][cover_image]",
        value: cover_image,
        placeholder: 'e.g. https://blog.chaskiq.io',
        id: 'cover_image'
      },
      {
        type: 'separator'
      }
    ]
  end

  # list
  def presentation_schema
    [
      {
        type: 'separator'
      },
      {
        type: 'text',
        style: 'header',
        text: heading
      },
      {
        type: 'separator'
      },
      {
        type: 'image',
        url: cover_image,
        height: 200,
        width: '100%',
        align: 'center'
      },
      {
        type: 'list',
        disabled: false,
        items: [
          {
            type: 'item',
            id: 'list-item-1',
            title: title,
            subtitle: description,
            action: {
              type: 'url',
              url: page_url
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
        type: 'separator'
      },
      {
        type: 'text',
        style: 'header',
        text: heading
      },
      {
        type: 'separator'
      },
      {
        type: 'list',
        disabled: false,
        items: [
          {
            type: 'item',
            id: 'list-item-1',
            title: title,
            subtitle: description,
            image: cover_image,
            action: {
              type: 'url',
              url: page_url
            }
          }
        ]
      }
    ]
  end

  def self.generate_collection(items)
    items.map { |o| new(o) }
  end

  def self.generate_collection_definitions(items, append: false, validate: false, autofill_index: nil)
    items.map! do |o|
      o.permit(
        :description,
        :heading,
        :page_url,
        :title,
        :cover_image
      )
    end

    result = generate_collection(items)
             .each_with_index.map  do |o, i|
      o.valid? if validate
      o.autofill if autofill_index == i
      o.article_fields(i)
    end
    result += new.article_fields(result.size) if append
    result
  end

  def self.collection_presentation(items)
    items.map! do |o|
      o.permit(
        :description,
        :heading,
        :page_url,
        :title,
        :cover_image
      )
    end

    result = generate_collection(items)
             .each_with_index.map  do |o, _i|
      o
      # o.valid? #if validate
    end
    result += new.article_fields(result.size) if append
    result
  end

  def article_presentation_fields(items)
    [
      {
        type: 'separator'
      },
      {
        type: 'text',
        style: 'header',
        text: heading
      },
      {
        type: 'separator'
      },
      {
        type: 'list',
        disabled: false,
        items: items.map(&:list_item)
      }
    ]
  end

  def list_item
    {
      type: 'item',
      id: 'list-item-1',
      title: title,
      subtitle: description,
      image: cover_image,
      action: {
        type: 'url',
        url: page_url
      }
    }
  end
end
