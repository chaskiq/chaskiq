# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BotTask, type: :model do
  let(:attr) do
    { 'id' => 1,
      'title' => 'test bot',
      'state' => 'enabled',
      'predicates' => [],
      'app_id' => 1,
      'settings' => { 'scheduling' => 'inside_office' },
      'paths' => [{ 'id' => 835_370,
                    'steps' => [{ 'step_uid' => 'f0fad9aa-eb89-4025-bfd4-682d3e879b6a',
                                  'type' => 'messages',
                                  'messages' => [{ 'app_user' => { 'display_name' => 'miguel michelson',
                                                                   'email' => 'miguelmichelson@gmail.com',
                                                                   'id' => 1,
                                                                   'kind' => 'agent' },
                                                   'serialized_content' => '{"blocks":[{"key":"9oe8n","text":"Hola , ¿cuanto es 2+2?","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}', 'html_content' => 'hola' }] },
                                { 'step_uid' => '7b12dcb7-0d10-429e-8b76-50a54f95db06',
                                  'type' => 'messages', 'messages' => [], 'controls' => { 'type' => 'ask_option',
                                                                                          'schema' => [{ 'id' => '7da501ec-865d-4b65-9a7e-f1c1eaf7009a', 'element' => 'button', 'label' => '1', 'next_step_uuid' => '1abe22fc-90c5-4d29-ac21-80edf26d8739' },
                                                                                                       { 'id' => '8d2928a7-9ee3-41d5-8257-49bef7087720', 'label' => '2', 'element' => 'button', 'next_step_uuid' => 'e93fd8df-b956-42e6-a96d-f59b818ae6ba' }, { 'step_uid' => '7b12dcb7-0d10-429e-8b76-50a54f95db06', 'type' => 'messages', 'messages' => [], 'controls' => { 'type' => 'ask_option', 'schema' => [{ 'id' => '7da501ec-865d-4b65-9a7e-f1c1eaf7009a', 'element' => 'button', 'label' => '1', 'next_step_uuid' => nil }] } },
                                                                                                       { 'id' => 'd08111af-4557-49e5-8e2a-fb97fc24da2c', 'label' => '4', 'element' => 'button', 'next_step_uuid' => '4b65a9cf-4a32-4108-9718-09dbbd01f414' }, { 'step_uid' => '7b12dcb7-0d10-429e-8b76-50a54f95db06', 'type' => 'messages', 'messages' => [], 'controls' => { 'type' => 'ask_option', 'schema' => [{ 'id' => '7da501ec-865d-4b65-9a7e-f1c1eaf7009a', 'element' => 'button', 'label' => '1', 'next_step_uuid' => nil },
                                                                                                                                                                                                                                                                                                                                                                                                                   { 'id' => '8d2928a7-9ee3-41d5-8257-49bef7087720', 'label' => '2', 'element' => 'button', 'next_step_uuid' => nil }, { 'step_uid' => '7b12dcb7-0d10-429e-8b76-50a54f95db06', 'type' => 'messages', 'messages' => [], 'controls' => { 'type' => 'ask_option', 'schema' => [{ 'id' => '7da501ec-865d-4b65-9a7e-f1c1eaf7009a', 'element' => 'button', 'label' => '1', 'next_step_uuid' => nil }] } }], 'wait_for_input' => true } }], 'wait_for_input' => true } }],
                    'title' => 'welcome', 'followActions' => [],
                    'follow_actions' => [] },
                  { 'id' => 0, 'steps' => [{ 'step_uid' => '4b65a9cf-4a32-4108-9718-09dbbd01f414', 'type' => 'messages', 'messages' => [{ 'app_user' => { 'display_name' => 'miguel michelson', 'email' => 'miguelmichelson@gmail.com', 'id' => 1, 'kind' => 'agent' }, 'serialized_content' => '{"blocks":[{"key":"9oe8n","text":"bravooo!","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}', 'html_content' => 'hola' }] }], 'title' => 'cuatro', 'followActions' => [{ 'key' => 'assign', 'name' => 'assign', 'value' => 1 }], 'follow_actions' => [{ 'key' => 'assign', 'name' => 'assign', 'value' => 1 }] }, { 'id' => 19, 'steps' => [{ 'step_uid' => 'e93fd8df-b956-42e6-a96d-f59b818ae6ba', 'type' => 'messages', 'messages' => [{ 'app_user' => { 'display_name' => 'miguel michelson', 'email' => 'miguelmichelson@gmail.com', 'id' => 1, 'kind' => 'agent' }, 'serialized_content' => "{\"blocks\":[{\"key\":\"9oe8n\",\"text\":\"2 ? c'om\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}", 'html_content' => 'hola' }] }], 'title' => 'dos', 'followActions' => [], 'follow_actions' => [] }, { 'id' => 0, 'steps' => [{ 'step_uid' => '4b65a9cf-4a32-4108-9718-09dbbd01f414', 'type' => 'messages', 'messages' => [{ 'app_user' => { 'display_name' => 'miguel michelson', 'email' => 'miguelmichelson@gmail.com', 'id' => 1, 'kind' => 'agent' }, 'serialized_content' => '{"blocks":[{"key":"9oe8n","text":"bravooo!","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}', 'html_content' => 'hola' }] }], 'title' => 'cuatro', 'followActions' => [{ 'key' => 'assign', 'name' => 'assign', 'value' => 1 }],
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                'follow_actions' => [{ 'key' => 'assign', 'name' => 'assign', 'value' => 1 }] }] }
  end

  it 'oijoij' do
  end
end
