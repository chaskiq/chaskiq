import React from 'react'

class Debug extends React.Component {

  constructor() {
    super()

    this.handleToggleReadOnly = this.handleToggleReadOnly.bind(this)
    this.handleTestEmitAndDecode = this.handleTestEmitAndDecode.bind(this)
    this.handleTestEmitTEXT = this.handleTestEmitTEXT.bind(this)
    this.testEmitAndDecode = this.testEmitAndDecode.bind(this)
    this.testEmitTEXT = this.testEmitTEXT.bind(this)
    this.logState = this.logState.bind(this)
    this.toggleDisplay = this.toggleDisplay.bind(this)
    this.open = this.open.bind(this)
    this.render = this.render.bind(this)
    this.state = {
      output: "",
      display: "none"
    }
  }

  handleToggleReadOnly(e) {
    e.preventDefault()
    this.props.editor.toggleEditable()
    return false
  }

  handleTestEmitAndDecode(e) {
    e.preventDefault()
    return this.testEmitAndDecode()
  }

  handleTestEmitTEXT(e) {
    e.preventDefault()
    return this.testEmitTEXT()
  }

  testEmitAndDecode(e) {
    const raw_as_json = this.props.editor.emitSerializedOutput()
    this.props.editor.setState({ 
      editorState: this.props.editor.decodeEditorContent(raw_as_json) }, 
      this.logState(JSON.stringify(raw_as_json)))
    return false
  }

  testEmitTEXT() {
    const text = this.props.editor.getTextFromEditor()
    return this.logState(text)
  }

  logState(raw) {
    return this.setState({ output: raw }, this.open)
  }

  toggleDisplay(e) {
    e.preventDefault()
    const d = this.state.display === "block" ? "none" : this.state.display
    return this.setState({
      display: d })
  }

  open() {
    return this.setState({
      display: "block" })
  }

  render() {
    return (
      <div>
        <div className="debugControls">
          <ul>
            <li> LOCKS: { this.props.editor.state.locks } </li>
            <li>
              <a href="#" onClick={ this.handleToggleReadOnly }>
                EDITABLE: { this.props.editor.state.read_only ? 'NO' : 'YES' }
              </a>
            </li>
            <li>
              <a href="#" onClick={ this.handleTestEmitTEXT }>EDITOR TEXT</a>
            </li>
            <li>
              <a href="#" onClick={ this.handleTestEmitAndDecode }>EDITOR STATE</a>
            </li>
          </ul>
        </div>
        <div className="debugZone" style={ { display: this.state.display } }>
          <a href="#" className="dante-debug-close close" onClick={ this.toggleDisplay } />
          <div className="debugOutput">
            <h2>EDITOR OUTPUT</h2>
            {
              this.state.output.length > 0
              ? <pre>{ this.state.output }</pre>
              : undefined
            }
          </div>
        </div>
      </div>
    )
  }
}

export default Debug

