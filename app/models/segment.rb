class Segment < ApplicationRecord

  belongs_to :app, optional: true
    store :properties, accessors: [ 
      :per_page, 
      :predicates, 
      :sort_by,
      :sort_direction 
    ], coder: JSON


  # predicate example:
  # {type: "role", attribute: "role", comparison: "eq", value: "user_role"}

end
