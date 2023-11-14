import { Controller } from '@hotwired/stimulus';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { getTheme } from './dark_mode_controller';
import serialize from 'form-serialize';

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
  static targets = [
    'wrapper',
    'sendMode',
    'submitButton',
    'messageBg',
    'label',
  ];

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

  insertResource(data) {
    console.log('INSERT HERE THE THING', data);
    document.querySelector('#modal').innerHTML = '';

    switch (data.type) {
      case 'quick_reply':
        this.handleSubmit({ serialized: JSON.parse(data.content) });
        break;
      case 'bot_task':
        this.insertComment(data);
        break;
      default:
        break;
    }
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

  submit(e) {
    this.handleSubmit(this.valueNotified);
  }

  handleSubmit(value) {
    const { html, serialized } = value;
    // when conversation is new a form is provided with options
    let data = { conversation: {} };
    if (this.element.dataset.form) {
      data = serialize(document.getElementById('new_conversation'), {
        hash: true,
      });
    }

    this.insertComment({
      html,
      serialized: JSON.stringify(serialized),
      conversation: data.conversation,
    });

    this.editorRef.commands.clearContent(true);
    return true;
  }

  toggleMessageMode(e) {
    if (e.currentTarget.value == 'note') {
      this.messageBgTarget.classList.add('bg-amber-100');
      this.messageBgTarget.classList.remove('bg-gray-50');
    } else {
      this.messageBgTarget.classList.remove('bg-amber-100');
      this.messageBgTarget.classList.add('bg-gray-50');
    }
  }

  async insertComment(formats, cb) {
    const messageMode = document.querySelector(
      'input[name="response_type"]:checked'
    ).value;

    const payload = { ...formats, mode: messageMode };
    const response = await post(this.actionPath, {
      body: JSON.stringify(payload),
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
    if (!overflow) return;
    overflow.scrollTop = overflow.scrollHeight;
  }

  typingNotifier() {
    console.log('NOTIFY TYPING');
  }

  toggleClass() {
    if (this.sendModeTarget.checked) {
      this.submitButtonTarget.classList.add('hidden');
    } else {
      this.submitButtonTarget.classList.remove('hidden');
    }
  }

  uploadHandler(file, imageBlock) {
    const url = '/api/v1/direct_uploads';
    const upload = new DirectUpload(file, url);
    upload.create((error, blob) => {
      if (error) {
      } else {
        imageBlock(blob);
      }
    });
  }

  initialize() {
    this.actionPath = this.element.dataset.editorActionPath;
    this.messageMode = 'public';

    console.log('INIT EDITOR FOR', this.actionPath);
    const root = createRoot(this.wrapperTarget);

    root.render(
      <EditorComponent
        //upload={this.upload}
        //ctx={this}
        //initialValue={null}
        upload={this.uploadHandler}
        handleAppFunc={this.handleAppFunc.bind(this)}
        handleBotFunc={this.handleBotFunc.bind(this)}
        handleQuickRepliesFunc={this.handleQuickRepliesFunc.bind(this)}
        notifyValue={(val, editorRef) => {
          this.valueNotified = val;
          this.editorRef = editorRef;
          console.log(this.valueNotified);
        }}
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
}

class AppPackage extends React.Component {
  render = () => {
    return <span></span>;
  };
}

const AppPackageBlockConfig = (options: {}) => {
  const config = {
    tag: 'AppPackage',
    title: 'add AppPackage',
    type: 'AppPackage',
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
        />
      </svg>
    ),
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

const OnDemandTriggersBlockConfig = (options: {}) => {
  const config = {
    tag: 'OnDemandTrigger',
    title: 'Add Trigger',
    type: 'OnDemandTrigger',
    icon: () => (
      <svg
        viewBox="0 0 15 18"
        className="w-4 h-4"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
      >
        <path
          d="M7.5 2.5a5 5 0 015 5v6a1 1 0 01-1 1h-8a1 1 0 01-1-1v-6a5 5 0 015-5zm0 0V0M4 11.5h7M.5 8v4m14-4v4m-9-2.5a1 1 0 110-2 1 1 0 010 2zm4 0a1 1 0 110-2 1 1 0 010 2z"
          stroke="currentColor"
        ></path>
      </svg>
    ),
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

const QuickRepliesBlockConfig = (options: {}) => {
  const config = {
    tag: 'QuickReply',
    title: 'Add quick reply',
    type: 'QuickReply',
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
        />
      </svg>
    ),
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
  initialValue,
  upload,
  handleReturn,
  handleAppFunc,
  handleBotFunc,
  notifyValue,
  handleQuickRepliesFunc,
}) {
  const [val, setValue] = React.useState(null);
  const valRef = React.useRef(val); // Add this ref
  const editorRef = React.useRef(null);
  const [theme, setTheme] = React.useState(
    getTheme() == 'dark' ? darkTheme : defaultTheme
  );

  const widgets = [
    ImageBlockConfig({
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
          />
        </svg>
      ),
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
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
          />
        </svg>
      ),
      options: {
        endpoint: '/oembed?url=',
        placeholder:
          'Paste a link to embed content from another site (e.g. Twitter) and press Enter',
      },
    }),
    VideoBlockConfig({
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5"
          />
        </svg>
      ),
      options: {
        endpoint: '/oembed?url=',
        placeholder:
          'Paste a YouTube, Vine, Vimeo, or other video link, and press Enter',
        caption: 'Type caption for embed (optional)',
      },
    }),
    GiphyBlockConfig({
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12.75 8.25v7.5m6-7.5h-3V12m0 0v3.75m0-3.75H18M9.75 9.348c-1.03-1.464-2.698-1.464-3.728 0-1.03 1.465-1.03 3.84 0 5.304 1.03 1.464 2.699 1.464 3.728 0V12h-1.5M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
          />
        </svg>
      ),
    }),
    VideoRecorderBlockConfig({
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      ),
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
    SpeechToTextBlockConfig({
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
          />
        </svg>
      ),
    }),
  ];

  React.useEffect(() => {
    valRef.current = val; // Update the ref whenever `val` changes
    notifyValue(val, editorRef.current);
  }, [val]);

  React.useEffect(() => {
    console.log('CHANGED THEME', theme); // Update the ref whenever `val` changes
  }, [theme]);

  React.useEffect(() => {
    // Function to handle the custom event
    const handleThemeChanged = (event) => {
      console.log('New theme is:', event.detail.theme);
      setTheme(event.detail.theme == 'dark' ? darkTheme : defaultTheme);
    };

    // Add custom event listener
    window.addEventListener('themeChanged', handleThemeChanged);

    // Cleanup: Remove custom event listener
    return () => {
      window.removeEventListener('themeChanged', handleThemeChanged);
    };
  }, []);

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
  }

  return (
    <Dante
      //theme={darkTheme}
      theme={{ ...theme, dante_editor_font_size: '1em' }}
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
            // editorRef.current?.commands?.clearContent(true);
            return handleReturn && manageReturn(event, false);
          }
        },
      }}
      onUpdate={(editor) => {
        editorRef.current = editor;
        console.log('AAAAAA SE SALVOOOOO');
        setValue({
          serialized: editor.getJSON(),
          html: editor.view.dom.innerText,
        });
        // this.pushEvent("update-content", {content: editor.getJSON() } )
      }}
    />
  );
}
