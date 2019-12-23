# frozen_string_literal: true

json.array! @campaigns, partial: 'campaigns/campaign', as: :campaign
