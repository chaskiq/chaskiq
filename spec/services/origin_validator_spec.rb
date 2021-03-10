# frozen_string_literal: true

require 'rails_helper'

RSpec.describe OriginValidator do
  it 'validates on empty app' do
    expect(
      OriginValidator.new(
        app: '',
        host: 'http://loc.cz'
      )
    ).to be_is_valid
  end

  it 'validates on nil app' do
    expect(
      OriginValidator.new(
        app: nil,
        host: 'http://loc.cz'
      )
    ).to be_is_valid
  end

  it 'validates same origin' do
    expect(OriginValidator.new(
             app: 'http://loc.cl',
             host: 'http://loc.cl'
           )).to be_is_valid
  end

  it 'validates same origin with port' do
    expect(OriginValidator.new(
             app: 'http://loc.cl:3002',
             host: 'http://loc.cl:3002'
           )).to be_is_valid
  end

  it 'validates multiple' do
    expect(OriginValidator.new(
             app: 'http://loc.cl,http://loc.io',
             host: 'http://loc.cl'
           )).to be_is_valid
  end

  it 'validates multiple with port' do
    expect(OriginValidator.new(
             app: 'http://loc.cl:3001,http://loc.io',
             host: 'http://loc.cl:3001'
           )).to be_is_valid
  end

  it 'not validates on single' do
    expect do
      OriginValidator.new(
        app: 'http://loc.cl',
        host: 'http://loc.cz'
      ).is_valid?
    end.to raise_error(OriginValidator::NonAcceptedOrigin)
  end

  it 'not validates on single with different port' do
    expect do
      OriginValidator.new(
        app: 'http://loc.cl:3001',
        host: 'http://loc.cl:3002'
      ).is_valid?
    end.to raise_error(OriginValidator::NonAcceptedOrigin)
  end

  it 'not validates on multiple' do
    expect do
      OriginValidator.new(
        app: 'http://loc.cl,http://loc.io',
        host: 'http://loc.cz'
      ).is_valid?
    end.to raise_error(OriginValidator::NonAcceptedOrigin)
  end

  it 'not validates on multiple with different port' do
    expect do
      OriginValidator.new(
        app: 'http://loc.cl,http://loc.io',
        host: 'http://loc.cl:3002'
      ).is_valid?
    end.to raise_error(OriginValidator::NonAcceptedOrigin)
  end
end
