
import React from 'react'
import { Editor } from 'slate-react'
import { Value } from 'slate'
import Plain from 'slate-plain-serializer'
import Html from 'slate-html-serializer'


const rules = [
  {
    deserialize(el, next) {
      if (el.tagName.toLowerCase() == 'p') {
        return {
          object: 'block',
          type: 'paragraph',
          data: {
            className: el.getAttribute('class'),
          },
          nodes: next(el.childNodes),
        }
      }
    },
    // Add a serializing function property to our rule...
    serialize(obj, children) {
      if (obj.object == 'block' && obj.type == 'paragraph') {
        return <p className={obj.data.get('className')}>{children}</p>
      }
    },
  },
]

const html = new Html({ rules })

const initialValue = Value.fromJSON({
  document: {
    nodes: [
      /*{
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            leaves: [
              {
                text: ' ',
              },
            ],
          },
        ],
      },*/
    ],
  },
})

// Define our app...
export default class App extends React.Component {
  // Set the initial value when the app is first constructed.
  state = {
    value: initialValue
  }

  onKeyDown = (event, editor, next) => {
    // Return with no changes if the keypress is not '&'
    
    if (event.key !== 'Enter') 
      return next()

    this.sendContent(event, editor, next)

    /*if (event.key !== '&') return next()
    // Prevent the ampersand character from being inserted.
    event.preventDefault()
    // Change the value by inserting 'and' at the cursor's position.
    editor.insertText('and')*/
  }

  
  sendContent = (event, editor, next) => {
    console.log(Html)
    const content = html.serialize(this.state.value) 

    this.props.insertComment(content, () => {
      this.setState({ value: initialValue })
    })
  }

  // On change, update the app's React state with the new editor value.
  onChange = ({ value }) => {
    console.log(value)
    this.setState({ value })
  }

  // Render the editor.
  render() {
    return <Editor 
              value={this.state.value} 
              onChange={this.onChange} 
              onKeyDown={this.onKeyDown}
              placeholder={'type your shit'}
            />
  }
}