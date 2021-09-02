// frame internals grab
import React, { Component } from 'react';

export default class FrameBridge extends Component<{
  handleAppPackageEvent: (e: any) => void;
}> {
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
        //@ts-ignore
        return React.cloneElement(child, {
          //@ts-ignore
          window: props.window,
          //@ts-ignore
          document: props.document,
        });
      }
    );

    return <React.Fragment>{children}</React.Fragment>;
  }
}
