import React, { Component, CSSProperties } from 'react';

import { convertToHTML } from 'draft-convert';

import { CompositeDecorator, EditorState, convertFromRaw } from 'draft-js';
import MultiDecorator from 'draft-js-multidecorators';

import DanteEditor from 'Dante2/package/esm/editor/components/core/editor';
import { DanteImagePopoverConfig } from 'Dante2/package/esm/editor/components/popovers/image.js';
import { DanteAnchorPopoverConfig } from 'Dante2/package/esm/editor/components/popovers/link.js';
import { DanteInlineTooltipConfig } from 'Dante2/package/esm/editor/components/popovers/addButton.js';
import { DanteTooltipConfig } from 'Dante2/package/esm/editor/components/popovers/toolTip.js';

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

//import Link from "Dante2/package/es/components/decorators/link";
//import findEntities from "Dante2/package/es/utils/find_entities";
import { ThemeProvider } from 'emotion-theming';
//import EditorStyles from "Dante2/package/es/styled/base";

import { ImageBlockConfig } from './blocks/image';
import { FileBlockConfig } from './blocks/fileBlock';

import Prism from 'prismjs';
//import { PrismDraftDecorator } from "Dante2/package/es/components/decorators/prism";

import { GiphyBlockConfig } from './blocks/giphyBlock';
//import { SpeechToTextBlockConfig } from '../campaigns/article/speechToTextBlock'
//import { DanteMarkdownConfig } from './article/markdown'

import theme from './theme';
import styled from '@emotion/styled';

import { getFileMetadata, directUpload } from '../fileUploader';

import graphql from '@chaskiq/store/src/graphql/client';

import CircularProgress from '../Progress';

import I18n from '../../../../../src/shared/FakeI18n';

import {
  CREATE_URL_UPLOAD,
  CREATE_DIRECT_UPLOAD,
} from '@chaskiq/store/src/graphql/mutations';

const EditorStylesExtend = styled(EditorContainer)`
  line-height: ${(props) => props.styles.lineHeight || '2em'};
  font-size: ${(props) => props.styles.fontSize || '1.2em'};
  color: inherit;
  .graf--p {
    line-height: ${(props) => props.styles.lineHeight || '2em'};
    font-size: ${(props) => props.styles.fontSize || '1.2em'};
    margin-bottom: 0px;
  }
  .dante-menu {
    z-index: 2000;
  }
  blockquote {
    margin-left: 20px;
  }
  .dante-menu-input {
    background: #333333;
  }

  .dante-menu-buttons {
    overflow-x: auto;
  }

  .inlineTooltip-button {
    background: white !important;
  }
  ${(props) =>
    !props.inlineMenu
      ? `.tooltip-icon{
      display: inline-block;
    }
  
    .inlineTooltip-menu {
      display: inline-block;
      margin-left: 41px !important;
    }`
      : ''}
`;

const defaultProps = {
  content: null,
  //read_only: false,
  spellcheck: false,
  title_placeholder: 'Title',
  body_placeholder: '',

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

type UploadeHandlerType = {
  signedBlobId: any;
  headers: any;
  url: any;
  serviceUrl: any;
  imageBlock: any;
};

type ArticleEditorProps = {
  forwardedRef?: any;
  serializedContent: string;
  setDisabled?: (val: any) => void;
  uploadHandler: (props: UploadeHandlerType) => void;
  toggleEditable: (val: any) => void;
  videoless?: boolean;
  appendWidgets?: Array<any>;
  updateState: (val: any) => void;
  widgetsConfig?: any;
  data: any;
  campaign?: boolean;
  loading?: boolean;
  read_only?: boolean;
  styles: CSSProperties;
  theme?: any;
  inlineMenu?: boolean;
  tooltipsConfig?: any;
  inlineTooltipConfig?: any;
  handleReturn?: (e: any, isEmptyDraft: boolean, ctx?: any) => void;
  saveHandler?: (_html3: any, _plain: any, _serialized: any) => void;
};

type ArticleEditorState = {
  incomingSelectionPosition: any;
};
class ArticleEditor extends Component<ArticleEditorProps, ArticleEditorState> {
  initialContent: () => void;
  dante_editor: any;
  constructor(props) {
    super(props);
    this.initialContent = this.defaultContent();
  }

  isEmptyDraftJs = () => {
    if (!this.props.serializedContent) {
      // filter undefined and {}
      return true;
    }
    const raw = JSON.parse(this.props.serializedContent);
    const contentState = convertFromRaw(raw);

    if (raw.blocks.filter((o) => o.type != 'unstyled').length > 0) return false;

    return !(
      contentState.hasText() && contentState.getPlainText().trim() !== ''
    );
  };

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

    const menuConfig = Object.assign(
      {},
      DanteTooltipConfig(this.props.inlineTooltipConfig),
      inlineMenu
    );

    return [
      DanteImagePopoverConfig(),
      DanteAnchorPopoverConfig(),
      DanteInlineTooltipConfig(),
      menuConfig,
      //DanteMarkdownConfig()
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
      //generateDecorator("hello")
    ]);
    //};
  };

  /*
  generateDecorator = (_highlightTerm) => {
    //const regex = new RegExp(highlightTerm, "g");
    return new CompositeDecorator([
      {
        strategy: (_contentBlock, _callback) => {
          console.info(
            'processing entity!',
            this.state.incomingSelectionPosition.length
          );
          if (this.state.incomingSelectionPosition.length > 0) {
          findSelectedBlockFromRemote(
            this.state.incomingSelectionPosition,
            contentBlock,
            callback
          )
        }
          if (highlightTerm !== '') {
          findWithRegex(regex, contentBlock, callback);
        }
        },
        component: this.searchHighlight,
      },
    ]);
  };*/

  setDisabled = (val) => {
    this.props.setDisabled && this.props.setDisabled(val);
  };

  uploadHandler = (file, imageBlock) => {
    if (!file) {
      if (imageBlock.file && imageBlock.file.constructor.name === 'Blob') {
        let blob = imageBlock.file;
        //A Blob() is almost a File() - it's just missing the two properties below which we will add
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
    graphql(
      CREATE_URL_UPLOAD,
      { url: url },
      {
        success: (data) => {
          const {
            signedBlobId,
            headers,
            url,
            serviceUrl,
          } = data.createUrlUpload.directUpload;
          this.props.uploadHandler({
            signedBlobId,
            headers,
            url,
            serviceUrl,
            imageBlock,
          });
          this.setDisabled(false);
        },
        error: () => {},
      }
    );
  };

  uploadFromFile = (file, imageBlock) => {
    this.setDisabled(true);
    getFileMetadata(file).then((input) => {
      graphql(CREATE_DIRECT_UPLOAD, input, {
        success: (data) => {
          const {
            signedBlobId,
            headers,
            url,
            serviceUrl,
          } = data.createDirectUpload.directUpload;

          directUpload(url, JSON.parse(headers), file).then(() => {
            this.props.uploadHandler({
              signedBlobId,
              headers,
              url,
              serviceUrl,
              imageBlock,
            });
          });
        },
        error: (error) => {
          this.setDisabled(false);
          console.log('error on signing blob', error);
        },
      });
    });
  };

  widgetsConfig = () => {
    let widgets = [
      CodeBlockConfig(),
      ImageBlockConfig({
        options: {
          //upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
          upload_handler: this.uploadHandler,
          image_caption_placeholder: 'type a caption (optional)',
        },
      }),
      FileBlockConfig({
        options: {
          //upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
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
          endpoint: `/oembed?url=`,
        },
      }),
      PlaceholderBlockConfig(),
      GiphyBlockConfig(),
      //SpeechToTextBlockConfig(),
      //ButtonBlockConfig()
    ];

    if (!this.props.videoless) {
      widgets = widgets.concat([
        VideoBlockConfig({
          breakOnContinuous: true,
          options: {
            placeholder:
              'put embed link ie: youtube, vimeo, spotify, codepen, gist, etc..',
            endpoint: `/oembed?url=`,
            caption: 'optional caption',
          },
        }),
        VideoRecorderBlockConfig({
          options: {
            seconds_to_record: 20000,
            upload_handler: this.uploadHandler,
            //upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
          },
        }),
      ]);
    }

    if (this.props.appendWidgets)
      widgets = widgets.concat(this.props.appendWidgets);

    return widgets;
  };

  saveHandler = (context, content, cb) => {
    const exportedStyles = context.editor.styleExporter(
      context.editor.getEditorState()
    );

    let convertOptions = {
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
        /*if (block.type === "button" || block.type === "unsubscribe_button") {
          const { href, buttonStyle, containerStyle, label } = block.data
          const containerS = containerStyle ? styleString(containerStyle.toJS ? containerStyle.toJS() : containerStyle) : ''
          const buttonS = containerStyle ? styleString(buttonStyle.toJS ? buttonStyle.toJS() : buttonStyle) : ''
          return {
            start: `<div style="width: 100%; margin: 18px 0px 47px 0px">
                        <div 
                          style="${containerS}">
                          <a href="${href}"
                            className="btn"
                            target="_blank"
                            ref="btn"
                            style="${buttonS}">`,
            end: `</a>
                  </div>
                </div>`}
        }*/
        if (block.type === 'card') {
          return (
            <div className="graf graf--figure">
              <div
                style={{
                  width: '100%',
                  height: '100px',
                  margin: '18px 0px 47px',
                }}
              >
                <div className="signature">
                  <div>
                    <a href="#" contentEditable={false}>
                      <img src={block.data.image} />
                      <div></div>
                    </a>
                  </div>
                  <div
                    className="text"
                    style={{
                      color: 'rgb(153, 153, 153)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  ></div>
                </div>
                <div className="dante-clearfix" />
              </div>
            </div>
          );
        }
        if (block.type === 'jumbo') {
          return (
            <div className="graf graf--jumbo">
              <div className="jumbotron">
                <h1></h1>
              </div>
            </div>
          );
        }
        if (block.type === 'image') {
          const { ratio } = block.data.aspect_ratio.toJS
            ? block.data.aspect_ratio.toJS()
            : block.data.aspect_ratio;
          const { url } = block.data;

          return (
            <figure className="graf graf--figure">
              <div>
                <div className="aspectRatioPlaceholder is-locked">
                  <div
                    className="aspect-ratio-fill"
                    style={{ paddingBottom: `${ratio}%` }}
                  ></div>

                  <img
                    src={url}
                    className="graf-image"
                    contentEditable={false}
                  />
                </div>
              </div>

              <figcaption className="imageCaption">
                <span>
                  <span data-text="true">{block.text}</span>
                </span>
              </figcaption>
            </figure>
          );
        }
        if (block.type === 'column') {
          return (
            <div className={`graf graf--column ${block.data.className}`} />
          );
        }
        if (block.type === 'footer') {
          return (
            <div className="graf graf--figure">
              <div>
                <hr />
                <p></p>
              </div>
            </div>
          );
        }

        if (block.type === 'embed') {
          if (!block.data.embed_data) return;

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
            return <p />;
          }
        }

        if (block.type === 'video') {
          if (!block.data.embed_data) return;

          let data = null;

          // due to a bug in empbed component
          if (typeof block.data.embed_data.toJS === 'function') {
            data = block.data.embed_data.toJS();
          } else {
            data = block.data.embed_data;
          }

          return (
            <figure className="graf--figure graf--iframe graf--first">
              <div className="iframeContainer">{data.html}</div>
              <figcaption className="imageCaption">
                <div className="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
                  <span>
                    <span>{block.data.provisory_text}</span>
                  </span>
                </div>
              </figcaption>
            </figure>
          );
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

        if ('atomic') {
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

    let html = convertToHTML(convertOptions)(currentContent);
    //let html = null
    const serialized = JSON.stringify(content);
    const plain = context.getTextFromEditor(content);

    if (this.props.data.serialized_content === serialized) return;

    this.props.updateState &&
      this.props.updateState({
        status: 'saving...',
        statusButton: 'success',
        content: {
          html: html,
          serialized: serialized,
        },
      });

    if (cb) cb(html, plain, serialized);
  };

  decodeEditorContent = (raw_as_json) => {
    const new_content = convertFromRaw(raw_as_json);
    return EditorState.createWithContent(new_content);
  };

  render() {
    //const {forwardedRef, ...rest} = this.props;
    const { forwardedRef }: any = this.props;

    return (
      <ThemeProvider theme={theme}>
        <EditorStylesExtend
          campaign={true}
          inlineMenu={this.props.inlineMenu}
          styles={this.props.styles}
        >
          {!this.props.loading ? (
            <DanteEditor
              {...{
                ...defaultProps,
                body_placeholder: I18n.t('common.type_message'),
              }}
              read_only={this.props.read_only}
              toggleEditable={this.props.toggleEditable}
              ref={forwardedRef}
              debug={false}
              data_storage={{
                url: '/',
                save_handler: this.saveHandler,
              }}
              handleReturn={(e) => {
                return (
                  this.props.handleReturn &&
                  this.props.handleReturn(e, this.isEmptyDraftJs(), this)
                );
              }}
              onChange={(e) => {
                this.dante_editor = e;
              }}
              content={this.initialContent}
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

const WrappedComponent = React.forwardRef(function myFunction(
  props: ArticleEditorProps,
  ref
) {
  return <ArticleEditor {...props} forwardedRef={ref} />;
});

export default WrappedComponent;
