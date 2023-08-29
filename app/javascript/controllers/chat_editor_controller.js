import { Controller } from '@hotwired/stimulus';
import React from 'react';
import { render } from 'react-dom';
import ConversationEditor from '../src/pages/conversations/Editor';
import { post, FetchRequest } from '@rails/request.js';

import { AppPackageBlockConfig } from '@chaskiq/components/src/components/danteEditor/appPackage';
import { OnDemandTriggersBlockConfig } from '@chaskiq/components/src/components/danteEditor/onDemandTriggers';
import { QuickRepliesBlockConfig } from '@chaskiq/components/src/components/danteEditor/quickReplies';

export default class extends Controller {
  //static targets = ['contentframe'];

  connect() {
    this.actionPath = this.element.dataset.editorActionPath;

    console.log('INIT EDITOR FOR', this.actionPath);

    const extensions = [
      AppPackageBlockConfig({
        handleFunc: this.handleAppFunc.bind(this),
      }),
      OnDemandTriggersBlockConfig({
        handleFunc: this.handleBotFunc.bind(this),
      }),
      QuickRepliesBlockConfig({
        handleFunc: this.handleQuickRepliesFunc.bind(this),
      }),
    ];

    render(
      <ConversationEditor
        insertNode={this.insertNote.bind(this)}
        insertComment={this.insertComment.bind(this)}
        typingNotifier={this.typingNotifier.bind(this)}
        appendExtensions={extensions}
      />,
      this.element
    );

    setTimeout(() => {
      this.scrollToBottom();
    }, 400);
  }

  handleAppFunc() {
    console.log('open app moadl');
    const url =
      'http://app.chaskiq.test:3000/apps/XCs_Ph0l-iy5sHpBFULY_g/packages/capabilities?kind=inbox';
    this.sendPost(url, {}, 'get');
  }

  handleBotFunc() {
    console.log('open bot moadl');
  }

  handleQuickRepliesFunc() {
    console.log('open replies moadl');
  }

  insertNote(formats, cb) {
    cb && cb();
  }

  async insertComment(formats, cb) {
    const response = await post(this.actionPath, {
      body: JSON.stringify(formats),
    });
    if (response.ok) {
      cb && cb();
      setTimeout(() => {
        this.scrollToBottom();
      }, 200);
    }
  }

  get modalController() {
    return this.application.getControllerForElementAndIdentifier(
      document.querySelector('#main-page'),
      'modal'
    );
  }

  async sendPost(url, data = {}, method) {
    const req = new FetchRequest(method, url, {
      //body: JSON.stringify(data),
      responseKind: 'turbo-stream',
    });
    const response = await req.perform();
    if (response.ok) {
      console.log('HEY HET HEY');
    }
  }

  scrollToBottom() {
    const overflow = document.getElementById('conversation-overflow');
    overflow.scrollTop = overflow.scrollHeight;
  }

  typingNotifier() {
    console.log('NOTIFY TYPING');
  }
}
