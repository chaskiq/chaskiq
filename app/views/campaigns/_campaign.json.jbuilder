json.extract! campaign, *[:id,
:config_fields, 
:stats_fields,
:reply_email, 
:html_content,  
:serialized_content,  
:state, 
:app_id, 
:created_at, 
:updated_at, 
:segments
].concat(campaign.config_fields.map{|o| o[:name]})
