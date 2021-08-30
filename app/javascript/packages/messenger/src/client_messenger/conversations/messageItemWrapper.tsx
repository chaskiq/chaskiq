import React, { Component, Fragment } from 'react';

type MessageItemWrapperProps = {
  visible?: boolean;
  data: any;
  stepId?: string;
  conversation: any;
  triggerId?: string;
  email?: string;
  pushEvent: (path: string, data: any) => void;
};
export default class MessageItemWrapper extends Component<MessageItemWrapperProps> {
  componentDidMount() {
    // mark as read on first render if not read & from admin
    setTimeout(() => {
      this.sendEvent();
    }, 300);
  }

  componentDidUpdate(prevProps, _prevState) {
    if (
      prevProps &&
      prevProps.visible != this.props.visible &&
      this.props.visible
    ) {
      this.sendEvent();
    }
  }

  sendEvent = () => {
    if (
      this.props.visible &&
      !this.props.data.volatile &&
      !this.props.data.readAt &&
      this.props.data.appUser.kind === 'agent'
    ) {
      this.props.pushEvent(
        'receive_conversation_part',
        Object.assign(
          {},
          {
            conversation_key: this.props.conversation.key,
            message_key: this.props.data.key,
            step: this.props.stepId,
            trigger: this.props.triggerId,
          },
          { email: this.props.email }
        )
      );
    }
  };

  render() {
    return <Fragment>{this.props.children}</Fragment>;
  }
}
