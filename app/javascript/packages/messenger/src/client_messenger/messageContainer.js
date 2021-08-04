
import React, {Component} from 'react'
import { ThemeProvider } from 'emotion-theming'
import DanteContainer from './textEditor/editorStyles'
import DraftRenderer from './textEditor/draftRenderer'

import {
  MessageCloseBtn,
} from './styles/styled'
import Quest from './messageWindow'

export default class MessageContainer extends Component {
  componentDidMount() {
    App.events &&
      App.events.perform('track_open', {
        trackable_id: this.props.availableMessage.id,
      })
  }

  render() {
    const { t } = this.props
    const editorTheme = theme

    return (
      <Quest {...this.props}>
        <MessageCloseBtn
          href="#"
          onClick={() => this.props.handleClose(this.props.availableMessage)}
        >
          {t('dismiss')}
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