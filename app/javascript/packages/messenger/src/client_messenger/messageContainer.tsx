import React, { Component } from 'react';
import { ThemeProvider } from '@emotion/react';
import DanteContainer from './textEditor/editorStyles';
//import DraftRenderer from './textEditor/draftRenderer';
import { Renderer } from 'dante3/package/esm';

import theme from './textEditor/theme';

import { MessageCloseBtn } from './styles/styled';
import Quest from './messageWindow';

type MessageContainerProps = {
  events: any;
  availableMessage: any;
  domain: string;
  handleClose: (value: any) => void;
  i18n: any;
};
export default class MessageContainer extends Component<MessageContainerProps> {
  componentDidMount() {
    this.props.events &&
      this.props.events.perform('track_open', {
        trackable_id: this.props.availableMessage.id,
      });
  }

  render() {
    const editorTheme = theme;

    return (
      <Quest {...this.props}>
        <MessageCloseBtn
          href="#"
          onClick={() => this.props.handleClose(this.props.availableMessage)}
        >
          {this.props.i18n.t('messenger.dismiss')}
        </MessageCloseBtn>

        <Renderer
          theme={editorTheme}
          domain={this.props.domain}
          raw={JSON.parse(this.props.availableMessage.serialized_content)}
        />
      </Quest>
    );
  }
}
