import React, { Component } from 'react';

import {
  UserAutoMessage,
  UserAutoMessageStyledFrame,
  UserAutoMessageFlex,
} from './styles/styled';

import MessageContainer from './messageContainer';

type MessageFrameProps = {
  availableMessage?: any;
  events: any;
  availableMessages: any;
  domain: string;
  i18n: any;
  handleClose: (id: Number) => void;
};

type MessageFrameState = {
  isMinimized: boolean;
};
export default class MessageFrame extends Component<
  MessageFrameProps,
  MessageFrameState
> {
  defaultMinized: boolean;
  constructor(props) {
    super(props);
    this.defaultMinized = false;
  }

  handleCloseClick = (ev) => {
    ev.preventDefault();
    this.handleClose(ev);
  };

  handleClose = (message) => {
    this.props.handleClose(message.id);
  };

  render() {
    return (
      <UserAutoMessageStyledFrame
        id="messageFrame"
        title={'chaskiq message frame'}
      >
        <UserAutoMessageFlex>
          {this.props.availableMessages.map((o, i) => {
            return (
              <UserAutoMessage key={`user-auto-message-${o.id}-${i}`}>
                <MessageContainer
                  handleClose={this.handleClose}
                  availableMessage={o}
                  events={this.props.events}
                  domain={this.props.domain}
                  i18n={this.props.i18n}
                />
              </UserAutoMessage>
            );
          })}
        </UserAutoMessageFlex>
      </UserAutoMessageStyledFrame>
    );
  }
}
