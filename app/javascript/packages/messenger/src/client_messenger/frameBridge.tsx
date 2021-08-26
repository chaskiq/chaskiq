// frame internals grab
import React, { Component } from 'react';

export default class FrameBridge extends Component {
  constructor(props) {
    super(props);

    props.window.addEventListener(
      'message',
      (e) => {
        if (!e.data.chaskiqMessage) return;
        props.handleAppPackageEvent(e);
      },
      false
    );
  }

  render() {
    const { props } = this;

    const children = React.Children.map(
      this.props.children,
      (child, _index) => {
        return React.cloneElement(child, {
          window: props.window,
          document: props.document,
        });
      }
    );

    return <React.Fragment>{children}</React.Fragment>;
  }
}
