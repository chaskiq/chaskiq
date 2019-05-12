module Types
  class MutationType < Types::BaseObject
    field :insertComment, mutation: Mutations::InsertComment
    # TODO: remove me
    #description: "An example field added by the generator"
    ##field :insert_comment, String, null: false,
    #def test_field
    #  "Hello World"
    #end
  end
end
