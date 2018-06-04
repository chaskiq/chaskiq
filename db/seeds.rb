# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)


Segment.create([
  { name: "all users",  predicates: []},

  { name: "active users",  predicates: [ {attribute: "last_visited_at", 
                                        comparison: "lt", 
                                        type: "date", 
                                        value: "30 days ago"}.with_indifferent_access]                                 
  },

  { name: "sleeping away",  predicates: [ {attribute: "last_visited_at", 
                                        comparison: "lteq", 
                                        type: "date", 
                                        value: "1 days ago"}.with_indifferent_access]                                 
  }
])