require 'chronic'

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

  def query
    self.app
    app_users = AppUser.arel_table
    app.app_users.arel_table[Arel.star]
  end

  def execute_query
    arel_table = AppUser.arel_table
    user_table = User.arel_table

    left_outer_join = arel_table  
                    .join(user_table, Arel::Nodes::OuterJoin)
                    .on(user_table[:id].eq(arel_table[:user_id]))
                    .join_sources

    self.app.app_users.joins(left_outer_join).where(query_builder)
  end

  # JSONB queries on steroids
  # https://jes.al/2016/01/querying-json-fields-in-postgresql-using-activerecord/

  def query_builder
    arel_table = AppUser.arel_table
    user_table = User.arel_table
 
    Array(self.predicates).reduce(nil) do |query, predicate|
      next if predicate["type"] == "or"

      # check if its in table column
      if AppUser.columns.map(&:name).include?(predicate["attribute"])
        field = arel_table[predicate["attribute"]]
      else
        # included in user table ??
        if predicate["attribute"] == "email" 
          field = user_table[predicate["attribute"]]

        # otherwise use in JSONB properties column
        else
          field = Arel::Nodes::InfixOperation.new('->>', 
            arel_table[:properties], 
            Arel::Nodes.build_quoted(predicate["attribute"])
          )
        end
      end

      # date predicates
      case predicate["type"]
      when "date"
        check = field.send(predicate["comparison"], Chronic.parse(predicate["value"]) )
      else
        check = field.send(predicate["comparison"], predicate["value"] )
      end
      #                  
      if query.nil?
        check
      else
        if self.predicates.find{|o|  o["type"] == "or" }
          query.or(check)
        else
          query.and(check)
        end
      end
    end
  end

end
