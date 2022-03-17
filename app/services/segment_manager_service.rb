class SegmentManagerService
  include ActiveModel::Model

  attr_accessor :predicates, :app

  def initialize(predicates: [], app: nil)
    @app = app
    @predicates = predicates.map do |predicate|
      generate_predicates(predicate)
    end
  end

  def segment_predicates=(attributes)
    self.predicates = attributes.keys.map do |o|
      generate_predicates(attributes[o])
    end
  end

  def handle_new_segment=(kind)
    data = app.fields_for_segments.find { |o| o["name"] === kind }

    if data
      self.predicates = predicates <<
                        SegmentPredicate.new({
                                               type: data["type"],
                                               attribute: data["name"],
                                               comparison: nil
                                             })
    end
  end

  def generate_predicates(predicate)
    predicate = predicate.with_indifferent_access

    SegmentPredicate.new(
      type: predicate[:type],
      attribute: predicate[:attribute],
      comparison: predicate[:comparison],
      value: predicate[:value]
    )
  end

  def results(params)
    # @segment = params[:id].present? ?
    # @app.segments.find(params[:id]) :
    @segment = @app.segments.new

    @segment.assign_attributes(predicates: predicates.as_json)

    @segment.execute_query.page(params[:page] || 1)
            .per(params[:per] || 20)
  end
end

class SegmentPredicate
  include ActiveModel::Model
  include ActiveModel::Dirty

  attr_accessor :attribute
  attr_reader :type, :comparison, :value

  define_attribute_methods :value, :comparison, :type, :attribute

  def initialize(type: nil, attribute: nil, comparison: nil, value: nil)
    @type = type
    @attribute = attribute
    @comparison = comparison
    @value = value.is_a?(Array) ? value.compact_blank : value
  end

  def type=(val)
    type_will_change! unless @type == val
    @type = val
  end

  # def attribute=(val)
  #  attribute_will_change! unless	@attribute == val
  #  @attribute = val
  # end

  def comparison=(val)
    comparison_will_change! unless	@comparison == val
    @comparison = val
  end

  def value=(val)
    val = val.compact_blank! if val.is_a?(Array)
    value_will_change! unless @value == val
    @value = val
  end

  def type=(val)
    type_will_change! unless @type == val
    @type = val
  end

  def relative_options
    return string_predicates if @type == "string"
    return date_predicates if @type == "date"
  end

  def date_predicates
    [
      {
        label: I18n.t("segment_manager.more_than"),
        value: "lt"
        # defaultSelected: compare('lt'),
      },
      {
        label: I18n.t("segment_manager.exactly"),
        value: "eq"
        # defaultSelected: compare('eq'),
      },
      {
        label: I18n.t("segment_manager.less_than"),
        value: "gt"
        # defaultSelected: compare('gt'),
      }
    ]
  end

  def string_predicates
    [
      {
        label: I18n.t("segment_manager.is"),
        value: "eq",
        defaultSelected: false
      },
      {
        label: I18n.t("segment_manager.is_not"),
        value: "not_eq",
        defaultSelected: false
      },
      {
        label: I18n.t("segment_manager.starts_with"),
        value: "contains_start",
        defaultSelected: false
      },
      {
        label: I18n.t("segment_manager.ends_with"),
        value: "contains_ends",
        defaultSelected: false
      },
      {
        label: I18n.t("segment_manager.contains"),
        value: "contains",
        defaultSelected: false
      },
      {
        label: I18n.t("segment_manager.does_not_contain"),
        value: "not_contains",
        defaultSelected: false
      },
      {
        label: I18n.t("segment_manager.is_unknown"),
        value: "is_null",
        defaultSelected: false
      },
      {
        label: I18n.t("segment_manager.has_any_value"),
        value: "is_not_null",
        defaultSelected: false
      }
    ]
  end

  def save
    # do persistence work
    changes_applied
  end

  def as_json(*)
    {
      type: type,
      attribute: attribute,
      comparison: comparison,
      value: value
    }
  end
end
