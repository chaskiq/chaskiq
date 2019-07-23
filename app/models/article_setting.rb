class ArticleSetting < ApplicationRecord
  belongs_to :app
  store :preferences, accessors: [ 
      :social_media_buttons, 
      :links,
      :color,
    ], coder: JSON

    has_one_attached :logo
    has_one_attached :header_image
end
