import React from 'react';
import { render } from 'react-dom';

import TextEditor from '@chaskiq/components/src/components/textEditor';

import { Controller } from 'stimulus';

export default class extends Controller {
  static targets = ['serializedInput', 'htmlInput', 'container'];

  connect() {
    const serializedContent = this.element.dataset.content;

    console.log(serializedContent);
    render(
      <TextEditor
        //campaign={true}
        uploadHandler={this.uploadHandler.bind(this)}
        //loading={this.isLoading()}
        //read_only={this.state.read_only}
        toggleEditable={() => {
          //this.setState({
          //	read_only: !this.state.read_only,
          //})
        }}
        serializedContent={serializedContent}
        data={{
          serialized_content: serializedContent,
        }}
        styles={{
          lineHeight: '2em',
          fontSize: '1.2em',
        }}
        updateState={({ _status, _statusButton, content }) => {
          //console.log("copy to seialized input", this.serializedInputTarget)
          //console.log("copy to html input", this.htmlInputTarget)
          const { html, serialized } = content;
          this.serializedInputTarget.value = serialized;
          //console.log('get content', content)
          //this.saveContent(content)
        }}
      />,
      this.containerTarget
    );
  }

  uploadHandler(a) {
    console.log('UPLOADER HANDLER MISSING', a);
  }
}
