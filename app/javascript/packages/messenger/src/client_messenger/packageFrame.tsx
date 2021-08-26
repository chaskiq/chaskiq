import React, { Component } from 'react';
import { toCamelCase } from '@chaskiq/components/src/utils/caseConverter';

type AppBlockPackageFrameProps = {
  appBlock: any;
  conversation: any;
  enc_data?: string;
  app_id: string;
  domain: string;
};
export default class AppBlockPackageFrame extends Component<AppBlockPackageFrameProps> {
  componentDidMount() {}

  render() {
    const { data } = this.props.appBlock;
    const { message } = this.props.appBlock.message;
    const { conversation } = this.props;
    let src = null;
    let params = {};
    const newData = {
      ...data,
      enc_data: this.props.enc_data,
      app_id: this.props.app_id,
    };

    if (conversation.key && message) {
      params = JSON.stringify({ data: newData });
      const blocks = toCamelCase(message.blocks);
      const url = `${
        this.props.domain
      }/package_iframe/${blocks.appPackage.toLowerCase()}`;
      src = new URL(url);
    } else {
      params = JSON.stringify({ data: newData });
      const url = `${this.props.domain}/package_iframe/${data.id}`;
      src = new URL(url);
    }

    src.searchParams.set('data', params);

    return (
      <div>
        <iframe
          id="package-frame"
          // sandbox="allow-top-navigation allow-same-origin allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads"
          src={src.href}
          style={{
            width: '100%',
            height: 'calc(100vh - 75px)',
            border: '0px',
          }}
        />
      </div>
    );
  }
}
