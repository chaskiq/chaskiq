app = App.find_by(key: command_options.fetch('app_key'))
default_predicates = [
  {
    type: 'match',
    value: 'and',
    attribute: 'match',
    comparison: 'and'
  }
]

attributes = {
  "title"=>"oother", 
  "state"=>"enabled", 
  "segments"=>[
    {"type"=>"match", "value"=>"and", "attribute"=>"match", "comparison"=>"and"}, 
    {"type"=>"string", "value"=>"Visitor", "attribute"=>"type", "comparison"=>"eq"}], 
  "app_id"=>1, 
  #"settings"=>{}, 
  "paths"=>[
    {"id"=>"a7ca74ba-91a1-490d-9ee4-4f003f8346c3", "steps"=>[{"step_uid"=>"821370d6-ab07-4639-88e0-9189812dc7c0", "type"=>"messages", "messages"=>[{"app_user"=>{"display_name"=>"bot", "email"=>"bot@chasqik.com", "id"=>1, "kind"=>"agent"}, 
    "serialized_content"=>"{\"blocks\":[{\"key\":\"9oe8n\",\"text\":\"one\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}", "html_content"=>"--***--"}]}, 
    {"step_uid"=>"e4e824a5-a044-4470-ae2a-6f4c6873688b", "type"=>"messages", "messages"=>[{"app_user"=>{"display_name"=>"bot", "email"=>"bot@chasqik.com", "id"=>1, "kind"=>"agent"}, 
      "serialized_content"=>"{\"blocks\":[{\"key\":\"9oe8n\",\"text\":\"two\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}", "html_content"=>"--***--"}]}, 
    {"step_uid"=>"65b23057-fd01-41be-a6a6-ad1dad124560", "type"=>"messages", "messages"=>[{"app_user"=>{"display_name"=>"bot", "email"=>"bot@chasqik.com", "id"=>1, "kind"=>"agent"}, 
    "serialized_content"=>"{\"blocks\":[{\"key\":\"9oe8n\",\"text\":\"tree\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}", "html_content"=>"--***--"}]}, 
    {"step_uid"=>"f6aa3e6e-6279-49a2-8234-2953d4f977a9", "type"=>"messages", "messages"=>[], "controls"=>{"type"=>"wait_for_reply", "schema"=>[]}}, 
    {"step_uid"=>"aed55b6e-de26-413f-8fc9-975f8c62a4e7", "type"=>"messages", "messages"=>[{"app_user"=>{"display_name"=>"bot", "email"=>"bot@chasqik.com", "id"=>1, "kind"=>"agent"}, 
    "serialized_content"=>"{\"blocks\":[{\"key\":\"9oe8n\",\"text\":\"four\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}", "html_content"=>"--***--"}]}], 
    "title"=>"oijioj", "follow_actions"=>nil}],
  "bot_type"=>"outbound", 
  #"position"=>3
}

bot = app.bot_tasks.create(attributes)
bot