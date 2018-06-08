import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema, DOMParser} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
import {addListNodes} from "prosemirror-schema-list"
import {exampleSetup} from "prosemirror-example-setup"
import style from "prosemirror-view/style/prosemirror.css"

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks
})

const Editor = (selector)=> (
    new EditorView(document.querySelector(selector), {
      state: EditorState.create({
        doc: DOMParser.fromSchema(mySchema).parse(`<p>olis</p>`),
        plugins: exampleSetup({schema: mySchema})
      })
    })
)

export default Editor

