
import React, {Component} from 'react'
import { ThemeProvider } from 'emotion-theming'
import DanteContainer from './textEditor/editorStyles'
import DraftRenderer from './textEditor/draftRenderer'
import theme from './textEditor/theme'

import {
  MessageCloseBtn,
} from './styles/styled'
import Quest from './messageWindow'

export default class MessageContainer extends Component {
  componentDidMount() {
    this.props.events &&
      this.props.events.perform('track_open', {
        trackable_id: this.props.availableMessage.id,
      })
  }

  render() {
    const editorTheme = theme

    return (
      <Quest {...this.props}>
        <MessageCloseBtn
          href="#"
          onClick={() => this.props.handleClose(this.props.availableMessage)}
        >
          {this.props.i18n.t('dismiss')}
        </MessageCloseBtn>

        <ThemeProvider theme={editorTheme}>
          <DanteContainer>
            <DraftRenderer
              domain={this.props.domain}
              raw={JSON.parse(this.props.availableMessage.serialized_content)}
            />
          </DanteContainer>
        </ThemeProvider>
      </Quest>
    )
  }
}