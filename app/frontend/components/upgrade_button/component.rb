# frozen_string_literal: true

class UpgradeButton::Component < ApplicationViewComponent
  option :classes, default: -> { "absolute hidden z-10 ml-1 mt-3 transform w-screen max-w-md px-2 origin-top-right right-0 md:-ml-4 sm:px-0 lg:ml-0 lg:right-2/6 lg:translate-x-1/6 opacity-100 translate-y-0" }
  option :size, default: -> { "" }
  option :app, default: -> { "" }
  option :label, default: -> { "" }
  option :feature, default: -> { "" }
end
