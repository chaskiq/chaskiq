class ChaskiqDocsSchema < GraphQL::Schema
  #mutation(Types::MutationType)
  query(Types::QueryDocsType)
end