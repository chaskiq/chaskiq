# frozen_string_literal: true

# Based on https://github.com/github/view_component/blob/master/lib/rails/generators/component/component_generator.rb
class ViewComponentGenerator < Rails::Generators::NamedBase
  source_root File.expand_path("templates", __dir__)

  class_option :skip_test, type: :boolean, default: false
  class_option :skip_preview, type: :boolean, default: false
  class_option :skip_js, type: :boolean, default: false
  class_option :skip_css, type: :boolean, default: false

  argument :attributes, type: :array, default: [], banner: "attribute"

  def create_component_file
    template "component.rb", File.join("app/frontend/components", class_path, file_name, "component.rb")
  end

  def create_template_file
    template "component.html.erb", File.join("app/frontend/components", class_path, file_name, "component.html.erb")
  end

  def create_test_file
    return if options[:skip_test]

    template "component_spec.rb", File.join("spec/frontend/components", class_path, "#{file_name}_spec.rb")
  end

  def create_preview_file
    return if options[:skip_preview]

    template "preview.rb", File.join("app/frontend/components", class_path, file_name, "preview.rb")
  end

  def create_css_file
    return if options[:skip_css] || options[:skip_js]

    template "index.css", File.join("app/frontend/components", class_path, file_name, "index.css")
  end

  def create_js_file
    return if options[:skip_js]

    template "index.js", File.join("app/frontend/components", class_path, file_name, "index.js")
  end

  private

  def parent_class
    "ApplicationViewComponent"
  end

  def preview_parent_class
    "ApplicationViewComponentPreview"
  end

  def initialize_signature
    return if attributes.blank?

    attributes.map { |attr| "option :#{attr.name}" }.join("\n  ")
  end
end
