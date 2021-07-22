export function basic(){
  return `
    [	
      { 
        "type": "text",
        "text": "hello",
        "style": "header" 
      },
      { 
        "type": "text",
        "text": "This is a header",
        "style": "muted",
        "align": "center"
      },
      
      { 
        "type": "text",
        "text": "This is a header",
        "style": "notice-success",
        "align": "right"
      },
      { 
        "type": "text",
        "text": "This is a header",
        "style": "notice",
        "align": "center"
      },
            { 
        "type": "text",
        "text": "This is a header",
        "style": "notice-error",
        "align": "left"
      },
      {
        "type": "checkbox",
        "id": "checkbox-1",
        "label": "Unsaved Options",
        "options": [
        {"type": "option","id": "option-1","text": "Option 1"},
        {"type": "option","id": "option-2","text": "Option 2"}
        ]
      },


      {
        "type": "single-select",
        "id": "checkbox-12",
        "align": "center",
        "variant": "hovered",
        "direction": "column",
        "label": "How would you rate your experience with our service?",
        "options": [
              {
                "type": "option",
                "id": "option-12",
                "text": "😡",
                "action": {
                  "type": "submit"
                }
              },
              {
                "type": "option",
                "id": "option-13",
                "text": "🙁",
                "action": {
                  "type": "submit"
                }
              }
              , {
                "type": "option",
                "id": "option-14",
                "text": "😐",
                "action": {
                  "type": "submit"
                }
              }
              , {
                "type": "option",
                "id": "option-15",
                "text": "🙂",
                "action": {
                  "type": "submit"
                }
              },
              {
                "type": "option",
                "id": "option-16",
                "text": "😍",
                "action": {
                  "type": "submit"
                }
              }
          ]
      },





      {
        "type": "single-select",
        "id": "checkbox-1",
        "label": "Unsaved Options",
        "options": [
              {
                "type": "option",
                "id": "option-1",
                "text": "First",
                "action": {
                  "type": "submit"
                }
              },
              {
                "type": "option",
                "id": "option-2",
                "text": "uno",
                "action": {
                  "type": "submit"
                }
              }
              , {
                "type": "option",
                "id": "option-3",
                "text": "Option 1",
                "action": {
                  "type": "submit"
                }
              }
              , {
                "type": "option",
                "id": "option-4",
                "text": "tres",
                "action": {
                  "type": "submit"
                }
              }
          ]
      },
      {"type": "separator"},
      {
        "type": "image",
        "url": "https://via.placeholder.com/150",
        "height": 64,
        "width": 64,
        "align": "center",
        "rounded": true
      },
      {
        "type": "button", 
        "id": "pick-another", 
        "variant": "outlined", 
        "size": "small", 
        "label": "Pick another template", 
        "action": { 
          "type": "submit"
        }
      },
      { 
        "type": "input", 
        "id": "unsaved-1", 
        "label": "Unsaved", 
        "placeholder": "Enter input here...", 
        "save_state": "unsaved" 
      },
      { 
        "type": "textarea", 
        "id": "textarea-3", 
        "name": "textarea-3", 
        "label": "Error", 
        "placeholder": "Enter text here...", 
        "value": "Value entered in JSON.",
        "errors": {"textarea-3": ["uno error"]
        }
      }
    ]
  `
}