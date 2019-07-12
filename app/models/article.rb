class Article < ApplicationRecord
  include AASM

  belongs_to :author, class_name: "Agent"
  belongs_to :app

  has_one :article_content

  has_many_attached :images

  accepts_nested_attributes_for :article_content

  aasm column: :state do
    state :draft, :initial => true
    state :published

    event :publish , after: :set_published_at do
      transitions :from => :draft, :to => :published
    end
  end

  def set_published_at
    self.published_at = Time.zone.now
    self.save
  end

end
