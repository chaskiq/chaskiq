# frozen_string_literal: true

require 'rails_helper'

RSpec.describe OriginValidator do
  let(:app) { FactoryBot.create( :app , domain_url: 'http://loc.cl')}

  it 'validates same origin' do
    expect(OriginValidator.new(
      app: 'http://loc.cl', 
      host: 'http://loc.cl'
    )).to be_is_valid
  end

  it 'validates multiple' do
    expect(OriginValidator.new(
      app: 'http://loc.cl,http://loc.io', 
      host: 'http://loc.cl'
    )).to be_is_valid
  end

  it 'not validates on single' do
    expect { 
      OriginValidator.new(
        app: 'http://loc.cl', 
        host: 'http://loc.cz'
      ).is_valid?
    }.to raise_error(OriginValidator::NonAcceptedOrigin)
  end


  it 'not validates on multiple' do
    expect { 
      OriginValidator.new(
        app: 'http://loc.cl,http://loc.io', 
        host: 'http://loc.cz'
      ).is_valid?
    }.to raise_error(OriginValidator::NonAcceptedOrigin)
  end

end
