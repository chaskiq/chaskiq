# frozen_string_literal: true

class Alert::Component < ApplicationViewComponent
  option :title
  option :message
  option :status
  option :placement, default: -> {
    {
      vertical: 'bottom',
      horizontal: 'left',
    }
  }

  def status_icon
    case status
    when 'notice', 'success'
      %{
        <svg
          class="h-6 w-6 text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
    when 'error'
      %{
          <svg
            class="h-6 w-6 text-red-400"
            fill="none"
            viewBox="0 0 20 20"
            stroke="currentColor"
          >
            <path
              d="M2.92893219,17.0710678 C6.83417511,20.9763107 13.1658249,20.9763107 17.0710678,17.0710678 C20.9763107,13.1658249 20.9763107,6.83417511 17.0710678,2.92893219 C13.1658249,-0.976310729 6.83417511,-0.976310729 2.92893219,2.92893219 C-0.976310729,6.83417511 -0.976310729,13.1658249 2.92893219,17.0710678 Z M15.6568542,15.6568542 C18.7810486,12.5326599 18.7810486,7.46734008 15.6568542,4.34314575 C12.5326599,1.21895142 7.46734008,1.21895142 4.34314575,4.34314575 C1.21895142,7.46734008 1.21895142,12.5326599 4.34314575,15.6568542 C7.46734008,18.7810486 12.5326599,18.7810486 15.6568542,15.6568542 Z M9,5 L11,5 L11,11 L9,11 L9,5 Z M9,13 L11,13 L11,15 L9,15 L9,13 Z"
              id="Combined-Shape"
            ></path>
          </svg>
      }
    else
      ""
    end
  end

  def placement_class
    vertical = 'end'
    horizontal = 'end'

    vertical = case @placement[:vertical]
    when 'bottom' then 'end'
    when 'top' then 'start'
    when 'center' then 'center'
    else 
      'end'
    end

    horizontal = case @placement[:horizontal]
    when 'left' then 'end'
    when 'right' then 'start'
    when 'center' then 'center'
    else 
      'end'
    end

    return "sm:items-#{vertical} sm:justify-#{horizontal}"
  end
end
