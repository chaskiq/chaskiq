class TourStepForm
  include ActiveModel::Model

  attr_accessor :title, :content, :position, :target

  # validates :title, presence: true
  # validates :content, presence: true
  # validates :position, presence: true, numericality: { only_integer: true }
end
