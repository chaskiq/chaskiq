import { Controller } from '@hotwired/stimulus';
import React from 'react';
import { createRoot } from 'react-dom/client';

import Dante, {
  defaultTheme,
  darkTheme,
  ImageBlockConfig,
  CodeBlockConfig,
  DividerBlockConfig,
  PlaceholderBlockConfig,
  EmbedBlockConfig,
  VideoBlockConfig,
  GiphyBlockConfig,
  VideoRecorderBlockConfig,
  SpeechToTextBlockConfig,
  AddButtonConfig,
} from 'dante3/package/esm';
import { DirectUpload } from '@rails/activestorage';

// import ConversationEditor from '../src/pages/conversations/Editor';
import { post, FetchRequest } from '@rails/request.js';

export default class extends Controller {
  static targets = ['wrapper', 'sendMode'];

  initialize() {
    this.actionPath = this.element.dataset.editorActionPath;

    console.log('INIT EDITOR FOR', this.actionPath);

    /*render(
      <ConversationEditor
        insertNode={this.insertNote.bind(this)}
        insertComment={this.insertComment.bind(this)}
        typingNotifier={this.typingNotifier.bind(this)}
        appendExtensions={extensions}
      />,
      this.element
    );*/

    const root = createRoot(this.wrapperTarget);

    root.render(
      <EditorComponent
        //upload={this.upload}
        //ctx={this}
        //initialValue={null}
        handleAppFunc={this.handleAppFunc.bind(this)}
        handleBotFunc={this.handleBotFunc.bind(this)}
        handleQuickRepliesFunc={this.handleQuickRepliesFunc.bind(this)}
      
        handleReturn={(e, isEmptyDraft, value) => {
          console.log(e);
          try {
            console.log(
              e.currentTarget.pmViewDesc.node.content.content[0].attrs.blockKind
            );
            const blockKind =
              e.currentTarget.pmViewDesc?.node?.content?.content[0]?.attrs
                ?.blockKind?.name;
            if (['EmbedBlock', 'VideoBlock'].includes(blockKind)) {
              return;
            }
          } catch (error) {
            console.error(error);
          }

          if (this.isDocEmpty(value.serialized)) return; //|| this.isDisabled()) return;
          if (this.sendModeTarget.checked) {
            this.handleSubmit(value);
            e.currentTarget.editor.commands.clearContent(true);
            return true;
          }
        }}
        callback={this.updateContent}
      ></EditorComponent>
    );

    setTimeout(() => {
      this.scrollToBottom();
    }, 400);
  }

  handleAppFunc() {
    console.log('open app moadl');
    const url = this.element.dataset.capabilities;
    this.sendPost(url, {}, 'get');
  }

  handleBotFunc() {
    console.log('open bot moadl');
    const url = this.element.dataset.botTasks;
    this.sendPost(url, {}, 'get');
  }

  handleQuickRepliesFunc() {
    console.log('open quick moadl');
    const url = this.element.dataset.quickReplies;
    this.sendPost(url, {}, 'get');
  }


  insertNote(formats, cb) {
    cb && cb();
  }

  isDocEmpty(docJSON) {
    if (!docJSON) return true;
    const { content } = docJSON;

    if (!content || content.length === 0) {
      return true;
    }

    for (const node of content) {
      if (
        node.type !== 'paragraph' ||
        (node.content && node.content.length > 0)
      ) {
        return false;
      }
    }

    return true;
  }

  handleSubmit(value) {
    const { html, serialized } = value;
    this.insertComment({ html, serialized: JSON.stringify(serialized) });
    return true;
  }

  async insertComment(formats, cb) {
    const response = await post(this.actionPath, {
      body: JSON.stringify(formats),
    });

    // Check for redirects (status codes 3xx) and follow if necessary
    if (response.redirected) {
      return window.Turbo.visit(response.response.url);
    }

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

    let response = await req.perform();

    // Check for redirects (status codes 3xx) and follow if necessary
    if (response.redirected) {
      return window.Turbo.visit(response.response.url);
    }

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

class AppPackage extends React.Component {
  render = () => {
    return <span></span>;
  };
}

const AppPackageBlockConfig = (
  options: {}
) => {
  const config = {
    tag: 'AppPackage',
    title: 'add AppPackage',
    type: 'AppPackage',
    icon: ()=> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>,
    block: AppPackage,
    editable: true,
    renderable: true,
    breakOnContinuous: false,
    wrapper_class: 'graf graf--AppPackage',
    selected_class: 'is-selected',
    widget_options: {
      displayOnInlineTooltip: true,
      insertion: 'func',
      funcHandler: options.handleFunc,
      insert_block: 'AppPackage',
    },
  };

  return Object.assign(config, options);
};

class OnDemandTriggers extends React.Component {
  render = () => {
    return <span></span>;
  };
}

const OnDemandTriggersBlockConfig = (
  options: {}
) => {
  const config = {
    tag: 'OnDemandTrigger',
    title: 'Add Trigger',
    type: 'OnDemandTrigger',
    icon: ()=> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
    </svg>,
    block: OnDemandTriggers,
    editable: true,
    renderable: true,
    breakOnContinuous: false,
    wrapper_class: 'graf graf--Trigger',
    selected_class: 'is-selected',
    widget_options: {
      displayOnInlineTooltip: true,
      insertion: 'func',
      funcHandler: options.handleFunc,
      insert_block: 'OnDemandTriggers',
    },
  };

  return Object.assign(config, options);
};

class quickReplyBlock extends React.Component {
  render = () => {
    return <span></span>;
  };
}

const QuickRepliesBlockConfig = (
  options: {}
) => {
  const config = {
    tag: 'QuickReply',
    title: 'Add quick reply',
    type: 'QuickReply',
    icon: ()=> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>,
    block: quickReplyBlock,
    editable: true,
    renderable: true,
    breakOnContinuous: false,
    wrapper_class: 'graf graf--QuickReply',
    selected_class: 'is-selected',
    widget_options: {
      displayOnInlineTooltip: true,
      insertion: 'func',
      funcHandler: options.handleFunc,
      insert_block: 'quickReplyBlock',
    },
  };

  return Object.assign(config, options);
};

function EditorComponent({
  callback,
  ctx,
  upload,
  initialValue,
  handleReturn,
  handleAppFunc,
  handleBotFunc,
  handleQuickRepliesFunc
}) {
  const [val, setValue] = React.useState(null);
  const valRef = React.useRef(val); // Add this ref
  const editorRef = React.useRef(null);

  const widgets = [
    ImageBlockConfig({
      options: {
        upload_handler: (file, ctx) => {
          upload(file, (blob) => {
            console.log(blob);
            console.log(ctx);
            ctx.updateAttributes({
              url: blob.service_url,
            });
          });
        },
      },
    }),
    CodeBlockConfig(),
    DividerBlockConfig(),
    PlaceholderBlockConfig(),
    EmbedBlockConfig({
      options: {
        endpoint: '/oembed?url=',
        placeholder:
          'Paste a link to embed content from another site (e.g. Twitter) and press Enter',
      },
    }),
    VideoBlockConfig({
      options: {
        endpoint: '/oembed?url=',
        placeholder:
          'Paste a YouTube, Vine, Vimeo, or other video link, and press Enter',
        caption: 'Type caption for embed (optional)',
      },
    }),
    GiphyBlockConfig(),
    VideoRecorderBlockConfig({
      options: {
        upload_handler: (file, ctx) => {
          console.log('UPLOADED VIDEO FILE!!!!', file);

          upload(file, (blob) => {
            console.log(blob);
            console.log(ctx);
            ctx.updateAttributes({
              url: blob.service_url,
            });
          });
        },
      },
    }),
    SpeechToTextBlockConfig(),
  ]

  React.useEffect(() => {
    valRef.current = val; // Update the ref whenever `val` changes
  }, [val]);

  function manageReturn(event) {
    console.log('handle return');
    console.log(valRef.current);
    return handleReturn(event, false, valRef.current);
  }

  function extraWidgets() {

    //if (this.allowedEditorFeature('app_packages')) {
      widgets.push(
        AppPackageBlockConfig({
          handleFunc: handleAppFunc,
        })
      );
    //}

    //if (this.allowedEditorFeature('bot_triggers')) {
      widgets.push(
        OnDemandTriggersBlockConfig({
          handleFunc: handleBotFunc,
        })
      );
    //}

    //if (this.allowedEditorFeature('quick_replies')) {
      widgets.push(
        QuickRepliesBlockConfig({
          handleFunc: handleQuickRepliesFunc,
        })
      );
    //}

    return widgets;
  };

  return (
    <Dante
      //theme={darkTheme}
      theme={defaultTheme}
      content={val}
      tooltips={[
        AddButtonConfig({
          fixed: true,
        }),
      ]}
      widgets={extraWidgets()}
      editorProps={{
        handleKeyDown: (view, event) => {
          if (event.key === 'Enter') {
            editorRef.current?.commands?.clearContent(true);
            return handleReturn && manageReturn(event, false);
          }
        },
      }}
      onUpdate={(editor) => {
        editorRef.current = editor;
        setValue({
          serialized: editor.getJSON(),
          html: editor.view.dom.innerText,
        });
        // this.pushEvent("update-content", {content: editor.getJSON() } )
      }}
    />
  );
}
