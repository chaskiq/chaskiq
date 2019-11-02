module Types
  class BotTaskType < Types::BaseObject
    field :id, Int, null: true
    field :title, String, null: true
    field :predicates, Types::JsonType, null: true
    field :paths, [Types::BotPathType], null: true
    field :state, String, null: true
    field :segments, Types::JsonType, null: true
    field :scheduling, Types::JsonType, null: true
    field :urls, Types::JsonType, null: true
    def segments
      object.segments.blank? ? [] : object.segments
    end
    def paths
      object.paths.present? ? object.paths : []
    end

    field :metrics, Types::PaginatedMetricsType, null:true do
      argument :page, Integer, required: false, default_value: 1
      argument :per, Integer, required: false, default_value: 20
    end
    
    def metrics(page: 1 , per: 20)
      @metrics = object.metrics
                        .order("id desc")
                        .page(page)
                        .per(per)
      #render :index
    end


  end
end
