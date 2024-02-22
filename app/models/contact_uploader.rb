class ContactUploader
  include ActiveModel::Model
  include ActiveModel::Attributes

  attr_accessor :file, :contact_type
end
