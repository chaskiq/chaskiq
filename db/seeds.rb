# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

default_predicate = { type: "match" ,
                      attribute: "match",
                      comparison: "and",
                      value: "and"
                    }.with_indifferent_access

subscribed_predicate = {
                        attribute: "subscription_state", 
                        comparison: "eq", 
                        type: "string", 
                        value: "subscribed"
                        }.with_indifferent_access


passive_predicate = {attribute: "subscription_state", 
                        comparison: "eq", 
                        type: "string", 
                        value: "passive"}.with_indifferent_access                     

Segment.create([
  { name: "all users",  predicates: [default_predicate, subscribed_predicate]},

  { name: "all leads",  predicates: [ default_predicate, passive_predicate ]}


  { name: "active users",  predicates: [ default_predicate, 
                                        { attribute: "last_visited_at", 
                                          comparison: "gt", 
                                          type: "date", 
                                          value: "30 days ago"
                                        }.with_indifferent_access]                                
  },

  { name: "sleeping away",  predicates: [ default_predicate,
                                          {attribute: "last_visited_at", 
                                          comparison: "gteq", 
                                          type: "date", 
                                          value: "1 days ago"}.with_indifferent_access
                                        ]                                 
  }
])


app = App.create
app.add_admin(Agent.create(email: "miguelmichelson@gmail.com", password: "123456"))

