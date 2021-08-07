import React, { Component } from 'react'

import {
  UserAutoMessage,
  UserAutoMessageStyledFrame,
  UserAutoMessageFlex,
} from './styles/styled'

import MessageContainer from './messageContainer'
export default class MessageFrame extends Component {
  constructor(props) {
    super(props)
    this.defaultMinized = false
    this.state = {
      isMinimized: this.fetchMinizedCache(),
    }
  }

  toggleMinimize = () => {
    const val = !this.state.isMinimized
    // console.log("toggle, ", val, "old ", this.state.isMinimized)
    this.cacheMinized(val)
    this.setState({ isMinimized: val })
  }

  messageCacheKey = (id) => {
    return `hermes-message-${id}`
  }

  cacheMinized = (val) => {
    const key = this.messageCacheKey(this.props.availableMessage.id)
    // console.log("minimize", key, val)
    // if (this.localStorageEnabled)
    localStorage.setItem(key, val)
  }

  fetchMinizedCache = () => {
    if (!this.props.availableMessage) {
      return false
    }

    const key = this.messageCacheKey(this.props.availableMessage.id)

    const val = localStorage.getItem(key)

    switch (val) {
      case 'false':
        return false
      case 'true':
        return true
      default:
        return this.defaultMinized
    }
  }

  handleMinus = (ev) => {
    ev.preventDefault()
    this.toggleMinimize(ev)
  }

  handleCloseClick = (ev) => {
    ev.preventDefault()
    this.handleClose(ev)
  }

  handleClose = (message) => {
    this.props.events &&
      this.props.events.perform('track_close', {
        trackable_id: message.id,
      })
  }

  render() {
    return (
      <UserAutoMessageStyledFrame
        id="messageFrame"
        isMinimized={this.fetchMinizedCache()}
      >
        <UserAutoMessageFlex isMinimized={this.fetchMinizedCache()}>
          {this.props.availableMessages.map((o, i) => {
            return (
              <UserAutoMessage
                open={true}
                key={`user-auto-message-${o.id}-${i}`}
              >
                <MessageContainer
                  isMinimized={this.state.isMinimized}
                  toggleMinimize={this.toggleMinimize}
                  handleClose={this.handleClose}
                  availableMessage={o}
                  events={this.props.events}
                  domain={this.props.domain}
                  i18n={this.props.i18n}
                />
              </UserAutoMessage>
            )
          })}
        </UserAutoMessageFlex>
      </UserAutoMessageStyledFrame>
    )
  }
}
