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
  MenuBarConfig,
} from 'dante3/package/esm';
import { DirectUpload } from '@rails/activestorage';

//import TextEditor from '@chaskiq/components/src/components/textEditor';

export default class extends Controller {
  static targets = ['serializedInput', 'htmlInput', 'container'];

  initialize() {
    const serializedContent = this.element.dataset.content;
    let editorOptions = this.element.dataset.editorOptions;
    if (editorOptions) {
      editorOptions = JSON.parse(editorOptions);
    } else {
      editorOptions = {};
    }

    let theme = 'light';
    if (this.element.dataset.theme) {
      theme = this.element.dataset.theme;
    }

    console.log(serializedContent);

    const root = createRoot(this.containerTarget);

    root.render(
      <EditorComponent
        upload={this.uploadHandler}
        ctx={this}
        initialValue={serializedContent ? JSON.parse(serializedContent) : null}
        callback={this.updateContent}
        editorOptions={editorOptions}
        theme={theme}
      ></EditorComponent>
    );
  }

  //function uploadHandler({ serviceUrl, _signedBlobId, imageBlock }) {
  //  imageBlock.uploadCompleted(serviceUrl);
  //}

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

  updateContent(a, ctx) {
    if (!a) return;
    ctx.serializedInputTarget.value = JSON.stringify(a.serialized);
    console.log('UPLOADER HANDLER MISSING', a);
  }
}

function EditorComponent({
  ctx,
  callback,
  upload,
  initialValue,
  editorOptions,
  theme,
}) {
  const [val, setValue] = React.useState(initialValue);
  const valRef = React.useRef(null);
  const editorRef = React.useRef(null);

  const defaultOptions = {
    menuPlacement: 'up',
    addButtonFixed: false,
    menuBarFixed: false,
  };

  const editorOptionsConfig = { ...defaultOptions, ...editorOptions };

  React.useEffect(() => {
    valRef.current = val;
    callback(val, ctx); // Update the ref whenever `val` changes
  }, [val]);

  return (
    <Dante
      //theme={darkTheme}
      theme={theme == 'dark' ? darkTheme : defaultTheme}
      content={initialValue}
      tooltips={[
        AddButtonConfig({
          fixed: editorOptionsConfig.addButtonFixed,
        }),
        MenuBarConfig({
          placement: editorOptionsConfig.menuPlacement,
          fixed: editorOptionsConfig.menuBarFixed,
        }),
      ]}
      widgets={[
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
      ]}
      onUpdate={(editor) => {
        editorRef.current = editor;
        setValue({
          serialized: editor.getJSON(),
          html: editor.view.dom.innerText,
        });
      }}
    />
  );
}
