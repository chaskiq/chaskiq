import React, { Component, CSSProperties } from 'react';

import { convertToHTML } from 'draft-convert';

import { CompositeDecorator, EditorState, convertFromRaw } from 'draft-js';
import MultiDecorator from 'draft-js-multidecorators';

import DanteEditor from 'Dante2/package/esm/editor/components/core/editor';
import { DanteImagePopoverConfig } from 'Dante2/package/esm/editor/components/popovers/image.js';
import { DanteAnchorPopoverConfig } from 'Dante2/package/esm/editor/components/popovers/link.js';
import { DanteInlineTooltipConfig } from 'Dante2/package/esm/editor/components/popovers/addButton.js';
import { DanteTooltipConfig } from 'Dante2/package/esm/editor/components/popovers/toolTip.js';
import { ImageBlockConfig } from 'Dante2/package/esm/editor/components/blocks/image';
import { EmbedBlockConfig } from 'Dante2/package/esm/editor/components/blocks/embed';
import { VideoBlockConfig } from 'Dante2/package/esm/editor/components/blocks/video';
import { PlaceholderBlockConfig } from 'Dante2/package/esm/editor/components/blocks/placeholder.js';
import { VideoRecorderBlockConfig } from 'Dante2/package/esm/editor/components/blocks/videoRecorder/index';
import { CodeBlockConfig } from 'Dante2/package/esm/editor/components/blocks/code';
import { DividerBlockConfig } from 'Dante2/package/esm/editor/components/blocks/divider';
import {
  LinkDecorator as Link,
  PrismDraftDecorator,
} from 'Dante2/package/esm/editor/components/decorators';
import findEntities from 'Dante2/package/esm/editor/utils/find_entities';
import EditorContainer from 'Dante2/package/esm/editor/styled/base';

import Prism from 'prismjs';
import { ThemeProvider } from 'emotion-theming';
import theme from './theme';
import styled from '@emotion/styled';

import CircularProgress from '@chaskiq/components/src/components/Progress';
import { getFileMetadata } from '@chaskiq/components/src/components/fileUploader';

export const EditorStylesExtend = styled(EditorContainer)`
  @import url('https://fonts.googleapis.com/css?family=Inter:100,200,300,400,500,600,700,800,900&display=swap');

  font-family: 'Inter', sans-serif;

  line-height: ${() => '2em'};
  font-size: ${() => '1.2em'};

  .graf--p {
    line-height: ${() => '2em'};
    font-size: ${() => '1.2em'};
    margin-bottom: 0px;
  }

  .dante-menu {
    z-index: 2000;
  }

  blockquote {
    margin-left: 20px;
  }
`;

const defaultProps = {
  content: null,
  read_only: false,
  spellcheck: false,
  title_placeholder: 'Title',
  body_placeholder: 'Write your story',

  default_wrappers: [
    { className: 'graf--p', block: 'unstyled' },
    { className: 'graf--h2', block: 'header-one' },
    { className: 'graf--h3', block: 'header-two' },
    { className: 'graf--h4', block: 'header-three' },
    { className: 'graf--blockquote', block: 'blockquote' },
    {
      className: 'graf--insertunorderedlist',
      block: 'unordered-list-item',
    },
    { className: 'graf--insertorderedlist', block: 'ordered-list-item' },
    { className: 'graf--code', block: 'code-block' },
    { className: 'graf--bold', block: 'BOLD' },
    { className: 'graf--italic', block: 'ITALIC' },
    { className: 'graf--divider', block: 'divider' },
  ],

  continuousBlocks: [
    'unstyled',
    'blockquote',
    'ordered-list',
    'unordered-list',
    'unordered-list-item',
    'ordered-list-item',
    'code-block',
  ],

  key_commands: {
    'alt-shift': [{ key: 65, cmd: 'add-new-block' }],
    'alt-cmd': [
      { key: 49, cmd: 'toggle_block:header-one' },
      { key: 50, cmd: 'toggle_block:header-two' },
      { key: 53, cmd: 'toggle_block:blockquote' },
    ],
    cmd: [
      { key: 66, cmd: 'toggle_inline:BOLD' },
      { key: 73, cmd: 'toggle_inline:ITALIC' },
      { key: 75, cmd: 'insert:link' },
      { key: 13, cmd: 'toggle_block:divider' },
    ],
  },

  character_convert_mapping: {
    '> ': 'blockquote',
    '*.': 'unordered-list-item',
    '* ': 'unordered-list-item',
    '- ': 'unordered-list-item',
    '1.': 'ordered-list-item',
    '# ': 'header-one',
    '##': 'header-two',
    '==': 'unstyled',
    '` ': 'code-block',
  },
};

type ArticleEditorProps = {
  serializedContent: any;
  setDisabled?: (val: any) => void;
  handleUrlUpload: (file: string, imageBlock: any, input?: any) => void;
  handleDirectUpload: (file: string, imageBlock: any, input?: any) => void;
  domain: string;
  updateState: (val: any) => void;
  data: any;
  tooltipsConfig?: any;
  loading: boolean;
  widgetsConfig?: any;
  styles: CSSProperties;
};
export default class ArticleEditor extends Component<ArticleEditorProps> {
  dante_editor: any;
  emptyContent = () => {
    return {
      entityMap: {},
      blocks: [
        {
          key: 'f1qmb',
          text: '',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: {},
        },
      ],
    };

    // this.initialContent = this.defaultContent()
  };

  defaultContent = () => {
    try {
      return JSON.parse(this.props.serializedContent) || this.emptyContent();
    } catch (error) {
      return this.emptyContent();
    }
  };

  tooltipsConfig = () => {
    const inlineMenu = {
      selectionElements: [
        'unstyled',
        'blockquote',
        'ordered-list',
        'unordered-list',
        'unordered-list-item',
        'ordered-list-item',
        'code-block',
        'header-one',
        'header-two',
        'header-three',
        'header-four',
        'footer',
        'column',
        'jumbo',
        'button',
      ],
    };

    const menuConfig = Object.assign({}, DanteTooltipConfig(), inlineMenu);

    return [
      DanteImagePopoverConfig(),
      DanteAnchorPopoverConfig(),
      DanteInlineTooltipConfig(),
      menuConfig,
      // DanteMarkdownConfig()
    ];
  };

  decorators = (context) => {
    //return (context) => {
    return new MultiDecorator([
      PrismDraftDecorator({
        prism: Prism,
        defaultSyntax: 'javascript',
      }),
      new CompositeDecorator([
        {
          strategy: findEntities.bind(null, 'LINK', context),
          component: Link,
        },
      ]),
    ]);
    //}
  };

  setDisabled = (val) => {
    this.props.setDisabled && this.props.setDisabled(val);
  };

  uploadHandler = (file, imageBlock) => {
    if (!file) {
      if (imageBlock.file && imageBlock.file.constructor.name === 'Blob') {
        const blob = imageBlock.file;
        // A Blob() is almost a File() - it's just missing the two properties below which we will add
        blob.lastModifiedDate = new Date();
        blob.name = 'recorded';
        return this.uploadFromFile(blob, imageBlock);
      }
      this.uploadFromUrl(file, imageBlock);
    } else {
      this.uploadFromFile(file, imageBlock);
    }
  };

  uploadFromUrl = (file, imageBlock) => {
    const url = imageBlock.props.blockProps.data.get('url');
    this.setDisabled(true);
    this.props.handleUrlUpload(url, imageBlock);
  };

  uploadFromFile = (file, imageBlock) => {
    this.setDisabled(true);
    getFileMetadata(file).then((input) => {
      this.props.handleDirectUpload(file, imageBlock, input);
    });
  };

  widgetsConfig = () => {
    return [
      CodeBlockConfig(),
      ImageBlockConfig({
        options: {
          domain: this.props.domain,
          // upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
          upload_handler: this.uploadHandler,
          image_caption_placeholder: 'type a caption (optional)',
        },
      }),
      DividerBlockConfig(),
      EmbedBlockConfig({
        breakOnContinuous: true,
        editable: true,
        options: {
          placeholder: 'put an external links',
          endpoint: '/oembed?url=',
        },
      }),
      VideoBlockConfig({
        breakOnContinuous: true,
        options: {
          placeholder:
            'put embed link ie: youtube, vimeo, spotify, codepen, gist, etc..',
          endpoint: '/oembed?url=',
          caption: 'optional caption',
        },
      }),
      PlaceholderBlockConfig(),
      VideoRecorderBlockConfig({
        options: {
          seconds_to_record: 20000,
          upload_handler: this.uploadHandler,
          // upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
        },
      }),
      // GiphyBlockConfig(),
      // SpeechToTextBlockConfig(),
      // ButtonBlockConfig()
    ];
  };

  saveHandler = (context, content, cb) => {
    const exportedStyles = context.editor.styleExporter(
      context.editor.getEditorState()
    );

    const convertOptions = {
      styleToHTML: (style) => {
        if (style === 'BOLD') {
          return <b />;
        }
        if (style === 'ITALIC') {
          return <i />;
        }
        if (style.includes('CUSTOM')) {
          const s = exportedStyles[style].style;
          return <span style={s} />;
        }
      },
      blockToHTML: (block, _oo) => {
        if (block.type === 'unstyled') {
          return <p className="graf graf--p" />;
        }
        if (block.type === 'header-one') {
          return <h1 className="graf graf--h2" />;
        }
        if (block.type === 'header-two') {
          return <h2 className="graf graf--h3" />;
        }
        if (block.type === 'header-three') {
          return <h3 className="graf graf--h4" />;
        }
        if (block.type === 'blockquote') {
          return <blockquote className="graf graf--blockquote" />;
        }
        if (block.type === 'card') {
          return {
            start: `<div class="graf graf--figure">
                  <div style="width: 100%; height: 100px; margin: 18px 0px 47px">
                    <div class="signature">
                      <div>
                        <a href="#" contenteditable="false">
                          <img src="${block.data.image}">
                          <div></div>
                        </a>
                      </div>
                      <div class="text" 
                        style="color: rgb(153, 153, 153);
                              font-size: 12px; 
                              font-weight: bold">`,
            end: `</div>
                    </div>
                  <div class="dante-clearfix"/>
                </div>
              </div>`,
          };
        }
        if (block.type === 'jumbo') {
          return {
            start: `<div class="graf graf--jumbo">
                  <div class="jumbotron">
                    <h1>`,
            end: `</h1>
                  </div>
                </div>`,
          };
        }
        if (block.type === 'image') {
          const { height, ratio } = block.data.aspect_ratio.toJS
            ? block.data.aspect_ratio.toJS()
            : block.data.aspect_ratio;
          const { url } = block.data;

          return {
            start: `<figure class="graf graf--figure">
                  <div>
                    <div class="aspectRatioPlaceholder is-locked" style="max-width: 1000px; max-height: ${height}px;">
                      <div class="aspect-ratio-fill" 
                          style="padding-bottom: ${ratio}%;">
                      </div>

                      <img src="${url}" 
                        class="graf-image" 
                        contenteditable="false"
                      >
                    <div>
                  </div>

                  </div>
                  <figcaption class="imageCaption">
                    <span>
                      <span data-text="true">`,
            end: `</span>
                    </span>
                  </figcaption>
                  </div>
                </figure>`,
          };
        }
        if (block.type === 'column') {
          return (
            <div className={`graf graf--column ${block.data.className}`} />
          );
        }
        if (block.type === 'footer') {
          return {
            start: '<div class="graf graf--figure"><div ><hr/><p>',
            end: '</p></div></div>',
          };
        }

        if (block.type === 'embed') {
          if (!block.data.embed_data) {
            return;
          }

          let data = null;

          // due to a bug in empbed component
          if (typeof block.data.embed_data.toJS === 'function') {
            data = block.data.embed_data.toJS();
          } else {
            data = block.data.embed_data;
          }

          if (data) {
            return (
              <div className="graf graf--mixtapeEmbed">
                <span>
                  {data.images[0].url ? (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="js-mixtapeImage mixtapeImage"
                      href={block.data.provisory_text}
                      style={{
                        backgroundImage: `url(${data.images[0].url})`,
                      }}
                    ></a>
                  ) : null}
                  <a
                    className="markup--anchor markup--mixtapeEmbed-anchor"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={block.data.provisory_text}
                  >
                    <strong className="markup--strong markup--mixtapeEmbed-strong">
                      {data.title}
                    </strong>
                    <em className="markup--em markup--mixtapeEmbed-em">
                      {data.description}
                    </em>
                  </a>
                  {data.provider_url}
                </span>
              </div>
            );
          } else {
            <p />;
          }
        }

        if (block.type === 'video') {
          if (!block.data.embed_data) {
            return;
          }

          let data = null;

          // due to a bug in empbed component
          if (typeof block.data.embed_data.toJS === 'function') {
            data = block.data.embed_data.toJS();
          } else {
            data = block.data.embed_data;
          }

          return {
            start: `<figure class="graf--figure graf--iframe graf--first" tabindex="0">
                      <div class="iframeContainer">
                        ${data.html}
                      </div>
                      <figcaption class="imageCaption">
                        <div class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
                          <span>
                          <span>
                          ${block.data.provisory_text}
                          </span>
                          </span>
                        </div>
                      </figcaption>
                    `,
            end: '</figure>',
          };
        }

        if (block.type === 'recorded-video') {
          return (
            <figure className="graf--figure graf--iframe graf--first">
              <div className="iframeContainer">
                <video
                  autoPlay={false}
                  style={{ width: '100%' }}
                  controls={true}
                  src={block.data.url}
                ></video>
              </div>
              <figcaption className="imageCaption">
                <div className="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
                  <span>{block.text}</span>
                </div>
              </figcaption>
            </figure>
          );
        }

        if (block.type === 'atomic') {
          return <p />;
        }

        if (block.type === 'PARAGRAPH') {
          return <p />;
        }
      },
      entityToHTML: (entity, originalText) => {
        if (entity.type === 'LINK') {
          return <a href={entity.data.url}>{originalText}</a>;
        }
        return originalText;
      },
    };

    const currentContent = context.editorState().getCurrentContent();
    this.props.setDisabled && this.props.setDisabled(!currentContent.hasText());

    const html = convertToHTML(convertOptions)(currentContent);
    const serialized = JSON.stringify(content);
    const plain = context.getTextFromEditor(content);

    if (this.props.data.serialized_content === serialized) {
      return;
    }

    this.props.updateState &&
      this.props.updateState({
        status: 'saving...',
        statusButton: 'success',
        content: {
          html: html,
          serialized: serialized,
        },
      });

    if (cb) {
      cb(html, plain, serialized);
    }
  };

  decodeEditorContent = (raw_as_json) => {
    const new_content = convertFromRaw(raw_as_json);
    return EditorState.createWithContent(new_content);
  };

  render() {
    return (
      <ThemeProvider theme={theme}>
        <EditorStylesExtend campaign={true} styles={this.props.styles}>
          {!this.props.loading ? (
            <DanteEditor
              {...defaultProps}
              debug={false}
              data_storage={{
                url: '/',
                save_handler: this.saveHandler,
              }}
              onChange={(e) => {
                this.dante_editor = e;
              }}
              content={this.defaultContent()}
              tooltips={
                this.props.tooltipsConfig
                  ? this.props.tooltipsConfig()
                  : this.tooltipsConfig()
              }
              widgets={
                this.props.widgetsConfig
                  ? this.props.widgetsConfig()
                  : this.widgetsConfig()
              }
              decorators={(context) => {
                return new MultiDecorator([
                  PrismDraftDecorator({ prism: Prism }),
                  new CompositeDecorator([
                    {
                      strategy: findEntities.bind(null, 'LINK', context),
                      component: Link,
                    },
                  ]),
                ]);
              }}
            />
          ) : (
            <CircularProgress />
          )}
        </EditorStylesExtend>
      </ThemeProvider>
    );
  }
}
