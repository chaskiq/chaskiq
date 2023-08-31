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

import { AppPackageBlockConfig } from '@chaskiq/components/src/components/danteEditor/appPackage';
import { OnDemandTriggersBlockConfig } from '@chaskiq/components/src/components/danteEditor/onDemandTriggers';
import { QuickRepliesBlockConfig } from '@chaskiq/components/src/components/danteEditor/quickReplies';

export default class extends Controller {
  static targets = ['wrapper', 'sendMode'];

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

function EditorComponent({
  callback,
  ctx,
  upload,
  initialValue,
  handleReturn,
}) {
  const [val, setValue] = React.useState(null);
  const valRef = React.useRef(val); // Add this ref
  const editorRef = React.useRef(null);

  React.useEffect(() => {
    valRef.current = val; // Update the ref whenever `val` changes
  }, [val]);

  function manageReturn(event) {
    console.log('handle return');
    console.log(valRef.current);
    return handleReturn(event, false, valRef.current);
  }

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
      widgets={[
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
      ]}
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
