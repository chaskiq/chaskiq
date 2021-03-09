# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PluginSchemaValidator do
  let(:contract) do
    PluginSchemaValidator
  end

  it 'text validator' do
    expect(
      contract.new(
        [{
          type: 'text',
          text: 'hello',
          style: 'paragraph'
        },
         {
           type: 'text',
           text: 'hello',
           style: 'paragraph'
         }]
      )
    ).to be_valid

    expect(
      contract.new(
        [{
          type: 'text',
          style: 'paragraph'
        },
         {
           type: 'text',
           text: 'hello',
           style: 'paragraph'
         }]
      )
    ).to_not be_valid

    expect(
      contract.new(
        [{
          type: 'text',
          text: 'hello',
          style: 'paragraph-wrong-type'
        }]
      )
    ).to_not be_valid
  end

  it 'image' do
    expect(contract.new(
             [
               {
                 type: 'image',
                 url: 'https://via.placeholder.com/150',
                 height: 50,
                 width: 130
               },

               {
                 type: 'image',
                 url: 'https://via.placeholder.com/150',
                 height: 64,
                 width: 64,
                 align: 'left',
                 rounded: true
               },

               {
                 type: 'image',
                 url: 'https://via.placeholder.com/150',
                 height: 64,
                 width: 64,
                 align: 'center',
                 rounded: true
               },

               {
                 type: 'image',
                 url: 'https://via.placeholder.com/150',
                 height: 64,
                 width: 64,
                 align: 'right',
                 rounded: true
               }
             ]
           )).to be_valid

    expect(contract.new(
             [
               {
                 type: 'image',
                 url: 'https://via.placeholder.com/150',
                 height: 50,
                 "width--": 130
               }
             ]
           )).to_not be_valid
  end

  it 'button validator' do
    expect(
      contract.new([
                     id: 'hello',
                     name: 'bubu',
                     label: 'fuckya',
                     type: 'button',
                     action: {
                       type: 'submit'
                     }
                   ])
    ).to be_valid

    expect(
      contract.new([
                     id: 'hello',
                     name: 'bubu',
                     label: 'fuckya',
                     type: 'button',
                     action: {
                       typeeeee: 'submit'
                     }
                   ])
    ).to_not be_valid

    expect(
      contract.new([
                     nononid: 'hello',
                     label: 'fuckya',
                     type: 'button',
                     action: {
                       typeee: 'submit'
                     }
                   ])
    ).to_not be_valid
  end

  it 'single select' do
    expect(
      contract.new([
                     {
                       type: 'single-select',
                       id: 'single-select-2',
                       label: 'Pre-selected Option',
                       value: 'option-1',
                       options: [
                         {
                           type: 'option',
                           id: 'option-1',
                           text: 'Option 1',
                           action: {
                             type: 'submit'
                           }
                         },
                         {
                           type: 'option',
                           id: 'option-2',
                           text: 'Option 2'
                         },
                         {
                           type: 'option',
                           id: 'option-3',
                           text: 'Option 3'
                         }
                       ]
                     }
                   ])
    ).to be_valid

    expect(
      contract.new([
                     {
                       type: 'single-select',
                       id: 'single-select-2',
                       label: 'Pre-selected Option',
                       value: 'option-1',
                       options: [
                         {
                           "type---": 'option',
                           id: 'option-1',
                           text: 'Option 1',
                           action: {
                             type: 'submit'
                           }
                         }
                       ]
                     }
                   ])
    ).to_not be_valid
  end

  it 'data table' do
    expect(
      contract.new([
                     {
                       type: 'data-table',
                       items: [
                         {
                           type: 'field-value',
                           field: 'Key',
                           value: 'Value 1'
                         },
                         {
                           type: 'field-value',
                           field: 'Key',
                           value: 'Value 2'
                         },
                         {
                           type: 'field-value',
                           field: 'Key',
                           value: 'Value 3 which is a very long value that will exhibit different behaviours to the other values'
                         }
                       ]
                     }
                   ])
    ).to be_valid

    expect(
      contract.new([
                     {
                       type: 'data-table',
                       items: [
                         {
                           type: 'field-value'
                         }
                       ]
                     }
                   ])
    ).to_not be_valid
  end

  it 'spacer' do
    expect(contract.new(
             [
               {
                 type: 'spacer'
               }
             ]
           )).to be_valid
  end

  it 'divider' do
    expect(contract.new(
             [
               {
                 type: 'separator'
               }
             ]
           )).to be_valid
  end

  it 'input' do
    expect(contract.new(
             [
               {
                 type: 'input',
                 id: 'unsaved-1',
                 label: 'Unsaved',
                 placeholder: 'Enter input here...',
                 save_state: 'unsaved'
               },
               {
                 type: 'input',
                 id: 'unsaved-2',
                 label: 'Unsaved (Action)',
                 placeholder: 'Enter input here...',
                 save_state: 'unsaved',
                 action: {
                   type: 'submit'
                 }
               },
               {
                 type: 'input',
                 id: 'unsaved-3',
                 label: 'Unsaved (Disabled)',
                 placeholder: 'Enter input here...',
                 save_state: 'unsaved',
                 disabled: true,
                 action: {
                   type: 'submit'
                 }
               },
               {
                 type: 'input',
                 id: 'failed-1',
                 label: 'Failed',
                 placeholder: 'Enter input here...',
                 value: 'Value is given in JSON',
                 save_state: 'failed'
               },
               {
                 type: 'input',
                 id: 'failed-2',
                 label: 'Failed (Action)',
                 placeholder: 'Enter input here...',
                 value: 'Value is given in JSON',
                 save_state: 'failed',
                 action: {
                   type: 'submit'
                 }
               },
               {
                 type: 'input',
                 id: 'failed-3',
                 label: 'Failed (Disabled)',
                 placeholder: 'Enter input here...',
                 value: 'Value is given in JSON',
                 save_state: 'failed',
                 disabled: true,
                 action: {
                   type: 'submit'
                 }
               },
               {
                 type: 'input',
                 id: 'saved-1',
                 label: 'Saved',
                 placeholder: 'Enter input here...',
                 value: 'Value is given in JSON',
                 save_state: 'saved'
               }
             ]
           )).to be_valid

    expect(contract.new(
             [
               {
                 type: 'input',
                 "id--": 'unsaved-1',
                 label: 'Unsaved',
                 placeholder: 'Enter input here...',
                 save_state: 'unsaved'
               }
             ]
           )).to_not be_valid
  end

  it 'textarea' do
    expect(contract.new(
             [
               {
                 type: 'textarea',
                 id: 'textarea-1',
                 label: 'Normal',
                 placeholder: 'Enter text here...'
               },
               {
                 type: 'textarea',
                 id: 'textarea-2',
                 label: 'With Value',
                 placeholder: 'Enter text here...',
                 value: 'Value entered in JSON.'
               },
               {
                 type: 'textarea',
                 id: 'textarea-3',
                 name: 'textarea-3',
                 label: 'Error',
                 placeholder: 'Enter text here...',
                 value: 'Value entered in JSON.',
                 error: true,
                 errors: { "textarea-3": ['uno error'] }
               },
               {
                 type: 'textarea',
                 id: 'textarea-4',
                 label: 'Disabled',
                 placeholder: 'Unable to enter text',
                 disabled: true
               }
             ]
           )).to be_valid
  end

  it 'dropwdown' do
    expect(contract.new(
             [
               {
                 type: 'dropdown',
                 id: 'dropdown-1',
                 label: 'Unsaved Options',
                 options: [
                   {
                     type: 'option',
                     id: 'option-1',
                     text: 'Option 1'
                   },
                   {
                     type: 'option',
                     id: 'option-2',
                     text: 'Option 2'
                   },
                   {
                     type: 'option',
                     id: 'option-3',
                     text: 'Option 3'
                   }
                 ]
               },
               {
                 type: 'dropdown',
                 id: 'dropdown-2',
                 label: 'Pre-selected Option',
                 value: 'option-1',
                 options: [
                   {
                     type: 'option',
                     id: 'option-1',
                     text: 'Option 1'
                   },
                   {
                     type: 'option',
                     id: 'option-2',
                     text: 'Option 2'
                   },
                   {
                     type: 'option',
                     id: 'option-3',
                     text: 'Option 3'
                   }
                 ]
               },
               {
                 type: 'dropdown',
                 id: 'dropdown-3',
                 label: 'Saved Options',
                 save_state: 'saved',
                 options: [
                   {
                     type: 'option',
                     id: 'option-1',
                     text: 'Option 1'
                   },
                   {
                     type: 'option',
                     id: 'option-2',
                     text: 'Option 2'
                   },
                   {
                     type: 'option',
                     id: 'option-3',
                     text: 'Option 3'
                   }
                 ]
               },
               {
                 type: 'dropdown',
                 id: 'dropdown-4',
                 label: 'Failed Options',
                 save_state: 'failed',
                 options: [
                   {
                     type: 'option',
                     id: 'option-1',
                     text: 'Option 1'
                   },
                   {
                     type: 'option',
                     id: 'option-2',
                     text: 'Option 2'
                   },
                   {
                     type: 'option',
                     id: 'option-3',
                     text: 'Option 3'
                   }
                 ]
               },
               {
                 type: 'dropdown',
                 id: 'dropdown-5',
                 label: 'Disabled Options',
                 disabled: true,
                 options: [
                   {
                     type: 'option',
                     id: 'option-1',
                     text: 'Option 1'
                   },
                   {
                     type: 'option',
                     id: 'option-2',
                     text: 'Option 2'
                   },
                   {
                     type: 'option',
                     id: 'option-3',
                     text: 'Option 3'
                   }
                 ]
               },
               {
                 type: 'dropdown',
                 id: 'dropdown-6',
                 label: 'Disabled Option',
                 options: [
                   {
                     type: 'option',
                     id: 'option-1',
                     text: 'Disabled',
                     disabled: true
                   },
                   {
                     type: 'option',
                     id: 'option-2',
                     text: 'Option 2'
                   },
                   {
                     type: 'option',
                     id: 'option-3',
                     text: 'Option 3'
                   }
                 ]
               }
             ]
           )).to be_valid
  end

  it 'checkbox' do
    expect(
      contract.new(
        [
          {
            type: 'checkbox',
            id: 'checkbox-1',
            label: 'Unsaved Options',
            options: [
              {
                type: 'option',
                id: 'option-1',
                text: 'Option 1'
              },
              {
                type: 'option',
                id: 'option-2',
                text: 'Option 2'
              },
              {
                type: 'option',
                id: 'option-3',
                text: 'Option 3'
              }
            ]
          },
          {
            type: 'checkbox',
            id: 'checkbox-2',
            label: 'Pre-selected Option(s)',
            value: %w[option-1 option-2],
            options: [
              {
                type: 'option',
                id: 'option-1',
                text: 'Option 1'
              },
              {
                type: 'option',
                id: 'option-2',
                text: 'Option 2'
              },
              {
                type: 'option',
                id: 'option-3',
                text: 'Option 3'
              }
            ]
          },
          {
            type: 'checkbox',
            id: 'checkbox-3',
            label: 'Saved Options',
            save_state: 'saved',
            options: [
              {
                type: 'option',
                id: 'option-1',
                text: 'Option 1'
              },
              {
                type: 'option',
                id: 'option-2',
                text: 'Option 2'
              },
              {
                type: 'option',
                id: 'option-3',
                text: 'Option 3'
              }
            ]
          },
          {
            type: 'checkbox',
            id: 'checkbox-4',
            label: 'Failed Options',
            save_state: 'failed',
            options: [
              {
                type: 'option',
                id: 'option-1',
                text: 'Option 1'
              },
              {
                type: 'option',
                id: 'option-2',
                text: 'Option 2'
              },
              {
                type: 'option',
                id: 'option-3',
                text: 'Option 3'
              }
            ]
          },
          {
            type: 'checkbox',
            id: 'checkbox-5',
            label: 'Disabled Options',
            disabled: true,
            options: [
              {
                type: 'option',
                id: 'option-1',
                text: 'Option 1'
              },
              {
                type: 'option',
                id: 'option-2',
                text: 'Option 2'
              },
              {
                type: 'option',
                id: 'option-3',
                text: 'Option 3'
              }
            ]
          },
          {
            type: 'checkbox',
            id: 'checkbox-6',
            label: 'Disabled Option',
            options: [
              {
                type: 'option',
                id: 'option-1',
                text: 'Option 1',
                disabled: true
              },
              {
                type: 'option',
                id: 'option-2',
                text: 'Option 2'
              },
              {
                type: 'option',
                id: 'option-3',
                text: 'Option 3'
              }
            ]
          }
        ]
      )
    ).to be_valid
  end
end
