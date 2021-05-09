class PluginSchemaValidator
  attr_accessor :schema

  def initialize(elements)
    self.schema = elements.map { |o| BaseSchema.new(o) }
  end

  def valid?
    !schema.map { |o| o.valid? }.any? { |o| !o }
  end
end

class BaseSchema
  attr_accessor :model

  def initialize(params)
    self.model = case params[:type]
                 when 'text' then TextSchema.new(params)
                 when 'button' then ButtonSchema.new(params)
                 when 'image' then ImageSchema.new(params)
                 when 'data-table' then DataTableSchema.new(params)
                 when 'spacer' then SpacerSchema.new(params)
                 when 'separator' then DividerSchema.new(params)
                 when 'input' then InputSchema.new(params)
                 when 'textarea' then TextAreaSchema.new(params)
                 when 'list' then ListSchema.new(params)
                 when 'single-select' then SingleSelectSchema.new(params)
                 when 'checkbox' then CheckboxSchema.new(params)
                 when 'dropdown' then DropdownSchema.new(params)

                 end
  end

  def valid?
    # response = self.model.valid?
    # puts self.model.errors.inspect
    # response
    model.valid?
  end
end

class TextSchema
  include ActiveModel::Validations

  validates :type, presence: :true
  validates :text, presence: :true
  validates :style, presence: :true, inclusion: { in: %w[paragraph muted header notice notice-error notice-success] }
  validates :align, presence: :true, inclusion: { in: %w[left center right] }

  attr_accessor :type, :text, :style, :align

  def initialize(params)
    self.type = params[:type]
    self.text = params[:text]
    self.style = params[:style] || 'paragraph'
    self.align = params[:align] || 'left'
  end
end

class ButtonSchema
  include ActiveModel::Validations

  validates :id, presence: :true
  validate :action_hash

  attr_accessor :id, :name, :label, :type, :action

  def initialize(params)
    self.id     = params[:id]
    self.name   = params[:name]
    self.label  = params[:label]
    self.type   = params[:type]
    self.action = params[:action]
  end

  def action_hash
    errors.add(:action, 'action format error') if action.present? && !ActionSchema.new(action).valid?
  end
end

class ActionSchema
  include ActiveModel::Validations
  attr_accessor :type, :content_url, :url

  validates :type, presence: :true, inclusion: { in: %w[frame content submit link url] }
  validates :content_url, presence: :true, if: -> { type == 'content' }
  validates :url, presence: :true, if: -> { %w[frame link url].include?(type) }

  def initialize(params)
    self.url = params[:url] if params[:url].present?
    self.type = params[:type] if params[:type].present?
    self.content_url = params[:content_url] if params[:content_url].present?
  end
end

class ImageSchema
  include ActiveModel::Validations
  attr_accessor :type, :url, :width, :height, :align, :rounded

  validates :type, presence: :true, inclusion: { in: %w[image] }
  validates :height, presence: :true, numericality: { only_integer: true }
  validates :width, presence: :true, numericality: { only_integer: true }
  validates :url, presence: :true, format: { with: URI::DEFAULT_PARSER.make_regexp }
  validates :align, inclusion: { in: %w[left center right] }
  validates :rounded, inclusion: { in: [true, false] }

  def initialize(params)
    self.height  = params[:height]
    self.width   = params[:width]
    self.type    = params[:type]
    self.url     = params[:url]
    self.align   = params[:align] || 'left'
    self.rounded = params[:rounded] || false
  end
end

class DataTableSchema
  include ActiveModel::Validations
  attr_accessor :type, :items

  validate :validate_items

  def initialize(params)
    self.type = params[:type]
    self.items = params[:items].map { |o| DataTableItemSchema.new(o) }
  end

  def validate_items
    errors.add(:items, 'items format error') if items.present? && items.any? { |o| !o.valid? }
  end
end

class DataTableItemSchema
  include ActiveModel::Validations
  attr_accessor :type, :field, :value

  validates :type, :field, presence: :true

  def initialize(params)
    self.type = params[:type]
    self.field = params[:field]
    self.value = params[:value]
  end
end

class SpacerSchema
  include ActiveModel::Validations
  attr_accessor :type, :size

  validates :size, presence: :true, inclusion: { in: %w[xs s sm m l xl] }

  def initialize(params)
    self.size = params[:size] || 'm'
    self.type = params[:type]
  end
end

class DividerSchema
  include ActiveModel::Validations
  attr_accessor :type

  def initialize(params)
    self.type = params[:type]
  end
end

class InputSchema
  include ActiveModel::Validations

  attr_accessor :id, :name, :label, :type,
                :placeholder, :value, :save_state, :action, :self_errors

  validates :type, :id, presence: :true
  # validates :name, :label, presence: :true
  validates :save_state, inclusion: { in: %w[saved failed unsaved] }, if: lambda {
    save_state.present?
  }

  validate :action_hash

  def initialize(params)
    self.id     = params[:id]
    self.name   = params[:name]
    self.label  = params[:label]
    self.type   = params[:type]
    self.placeholder = params[:placeholder]
    self.value = params[:value]
    self.self_errors = params[:errors]
    self.save_state = params[:save_state]
    self.action = params[:action]
  end

  def action_hash
    errors.add(:action, 'action format error') if action.present? && !ActionSchema.new(action).valid?
  end
end

class TextAreaSchema
  include ActiveModel::Validations
  attr_accessor :id, :name, :label, :type,
                :placeholder, :value, :self_errors, :save_state

  validates :type, :id, presence: :true
  validates :save_state, inclusion: { in: %w[saved failed unsaved] }, if: lambda {
    save_state.present?
  }

  def initialize(params)
    self.id     = params[:id]
    self.name   = params[:name]
    self.label  = params[:label]
    self.type   = params[:type]
    self.placeholder = params[:placeholder]
    self.value = params[:value]
    self.self_errors = params[:errors]
    self.save_state = params[:save_state]
  end
end

class ListSchema
  include ActiveModel::Validations

  validates :type, :items, presence: :true
  validate :validate_items
  validates :disabled, inclusion: { in: [true, false] }, if: -> { disabled.present? }

  attr_accessor :type, :disabled, :items

  def initialize(params)
    self.type = params[:type]
    self.items = params[:items].map { |o| ListItemSchema.new(o) }
    self.disabled = params[:disabled]
  end

  def validate_items
    errors.add(:items, 'items format error') if items.any? { |o| !o.valid? }
  end
end

class ListItemSchema
  include ActiveModel::Validations
  attr_accessor :type, :id, :title, :subtitle, :action, :tertiary_text

  validates :type, :id, :title, presence: :true
  validate :action_hash

  def initialize(params)
    self.id = params[:id]
    self.type = params[:type]
    self.title = params[:title]
    self.subtitle = params[:subtitle]
    self.tertiary_text = params[:tertiary_text]
    self.action = params[:action]
  end

  def action_hash
    errors.add(:action, 'items format error') if action.present? && !ActionSchema.new(action).valid?
  end
end

class SingleSelectSchema
  include ActiveModel::Validations

  validates :type, :options, presence: :true
  validate :validate_options

  attr_accessor :type, :id, :label, :options, :disabled

  def initialize(params)
    self.type = params[:type]
    self.options = params[:options].map { |o| SingleSelectItemSchema.new(o) }
    self.disabled = params[:disabled]
  end

  def validate_options
    errors.add(:options, 'options format error') if options.any? { |o| !o.valid? }
  end
end

class SingleSelectItemSchema
  include ActiveModel::Validations
  attr_accessor :type, :id, :text, :action

  validates :type, :id, :text, presence: :true
  validate :action_hash

  def initialize(params)
    self.type = params[:type]
    self.id = params[:id]
    self.text = params[:text]
    self.action = params[:action]
  end

  def action_hash
    errors.add(:items, 'action format error') if action.present? && !ActionSchema.new(action).valid?
  end
end

class CheckboxSchema
  include ActiveModel::Validations
  attr_accessor :type, :id, :label, :value, :options

  validates :type, :id, presence: :true
  validate :validate_options

  def initialize(params)
    self.type = params[:type]
    self.id = params[:id]
    self.label = params[:text]
    self.options = params[:options].map { |o| CheckboxItemSchema.new(o) }
    self.value = params[:value]
  end

  def validate_options
    errors.add(:options, 'items format error') if options.present? && options.any? { |o| !o.valid? }
  end
end

class CheckboxItemSchema
  include ActiveModel::Validations
  attr_accessor :type, :id, :text

  validates :type, :id, :text, presence: :true
  def initialize(params)
    self.type = params[:type]
    self.id = params[:id]
    self.text = params[:text]
  end
end

class DropdownSchema
  include ActiveModel::Validations
  attr_accessor :type, :id, :label, :value, :options

  validates :type, :id, :label, presence: :true
  validate :validate_options

  def initialize(params)
    self.type = params[:type]
    self.id = params[:id]
    self.label = params[:label]
    self.options = params[:options].map { |o| DropdownItemSchema.new(o) }
    self.value = params[:value]
  end

  def validate_options
    errors.add(:options, 'items format error') if options.present? && options.any? { |o| !o.valid? }
  end
end

class DropdownItemSchema
  include ActiveModel::Validations
  attr_accessor :type, :id, :text

  validates :type, :id, :text, presence: :true
  def initialize(params)
    self.type = params[:type]
    self.id = params[:id]
    self.text = params[:text]
  end
end
