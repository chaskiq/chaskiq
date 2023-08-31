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

  connect() {
    const serializedContent = this.element.dataset.content;

    console.log(serializedContent);

    const root = createRoot(this.containerTarget);

    root.render(
      <EditorComponent
        upload={this.upload}
        ctx={this}
        initialValue={serializedContent ? JSON.parse(serializedContent) : null}
        callback={this.updateContent}
      ></EditorComponent>
    );
  }

  updateContent(a, ctx) {
    if (!a) return;
    ctx.serializedInputTarget.value = JSON.stringify(a.serialized);
    console.log('UPLOADER HANDLER MISSING', a);
  }
}

function EditorComponent({ ctx, callback, upload, initialValue }) {
  const [val, setValue] = React.useState(initialValue);
  const valRef = React.useRef(null);
  const editorRef = React.useRef(null);

  React.useEffect(() => {
    valRef.current = val;
    callback(val, ctx); // Update the ref whenever `val` changes
  }, [val]);

  return (
    <Dante
      //theme={darkTheme}
      theme={defaultTheme}
      content={initialValue}
      tooltips={[
        AddButtonConfig({
          fixed: true,
        }),
        MenuBarConfig({
          placement: 'up',
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
