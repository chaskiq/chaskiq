import React, { Component, CSSProperties } from 'react';

import {
  Dante,
  MenuBarConfig,
  AddButtonConfig,
  ImageBlockConfig,
  CodeBlockConfig,
  DividerBlockConfig,
  FileBlockConfig,
  EmbedBlockConfig,
  PlaceholderBlockConfig,
  VideoBlockConfig,
  GiphyBlockConfig,
  VideoRecorderBlockConfig,
  AudioRecorderBlockConfig,
  SpeechToTextBlockConfig,
} from 'dante3/package/esm';

import EditorStylesExtend from './container';

import { defaultTheme, darkTheme } from 'dante3/package/esm/styled/themes';

//import Link from "Dante2/package/es/components/decorators/link";
//import findEntities from "Dante2/package/es/utils/find_entities";
import { ThemeProvider } from '@emotion/react';
//import EditorStyles from "Dante2/package/es/styled/base";

//import { DanteMarkdownConfig } from './article/markdown'

//import theme from './theme';

import { getFileMetadata, directUpload } from '../fileUploader';

import graphql from '@chaskiq/store/src/graphql/client';

import CircularProgress from '../Progress';

import I18n from '../../../../../src/shared/FakeI18n';

import {
  CREATE_URL_UPLOAD,
  CREATE_DIRECT_UPLOAD,
} from '@chaskiq/store/src/graphql/mutations';

// const theme = darkTheme; // defaultTheme

/*
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
};*/

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
  allowedEditorFeature: any;
};

type ArticleEditorState = {
  incomingSelectionPosition: any;
};

class ArticleEditor extends Component<ArticleEditorProps, ArticleEditorState> {
  initialContent: () => void;
  dante_editor: any;
  constructor(props) {
    super(props);
    console.log('PROPS', props);
    this.initialContent = this.defaultContent();
  }

  isEmptyDraftJs = () => {
    console.log(this);
  };

  defaultContent = () => {
    try {
      return JSON.parse(this.props.data.serialized_content) || null;
    } catch (error) {
      return null;
    }
  };

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
          const { signedBlobId, headers, url, serviceUrl } =
            data.createUrlUpload.directUpload;
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
          const { signedBlobId, headers, url, serviceUrl } =
            data.createDirectUpload.directUpload;

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
    let widgets = [CodeBlockConfig()];

    if (this.props.allowedEditorFeature('images')) {
      widgets.push(
        ImageBlockConfig({
          options: {
            //upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
            upload_handler: this.uploadHandler,
            image_caption_placeholder: 'type a caption (optional)',
          },
        })
      );
    }

    if (this.props.allowedEditorFeature('attachments')) {
      widgets.push(
        FileBlockConfig({
          options: {
            //upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
            upload_handler: this.uploadHandler,
            image_caption_placeholder: 'type a caption (optional)',
          },
        })
      );
    }

    if (this.props.allowedEditorFeature('divider')) {
      widgets.push(DividerBlockConfig());
    }

    if (this.props.allowedEditorFeature('link_embeds')) {
      widgets.push(
        EmbedBlockConfig({
          breakOnContinuous: true,
          editable: true,
          options: {
            placeholder: 'put an external links',
            endpoint: `/oembed?url=`,
          },
        })
      );
    }

    widgets.push(PlaceholderBlockConfig());

    if (this.props.allowedEditorFeature('giphy')) {
      widgets.push(GiphyBlockConfig());
    }

    if (!this.props.videoless) {
      if (this.props.allowedEditorFeature('embeds')) {
        widgets.push(
          VideoBlockConfig({
            breakOnContinuous: true,
            options: {
              placeholder:
                'put embed link ie: youtube, vimeo, spotify, codepen, gist, etc..',
              endpoint: `/oembed?url=`,
              caption: 'optional caption',
            },
          })
        );
      }

      widgets.push(
        AudioRecorderBlockConfig({
          options: {
            seconds_to_record: 20000,
            upload_handler: this.uploadHandler,
            //upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
          },
        })
      );

      if (this.props.allowedEditorFeature('video_recorder')) {
        widgets.push(
          VideoRecorderBlockConfig({
            options: {
              mediaType: 'video/webm',
              seconds_to_record: 20000,
              upload_handler: this.uploadHandler,
              //upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
            },
          })
        );
      }
    }

    if (this.props.appendWidgets)
      widgets = widgets.concat(this.props.appendWidgets);

    return widgets;
  };

  tooltipsConfig = () => {
    return [AddButtonConfig(), MenuBarConfig(this.props.inlineTooltipConfig)];
  };

  render() {
    //const {forwardedRef, ...rest} = this.props;

    return (
      <ThemeProvider
        theme={this.props.theme === 'dark' ? darkTheme : defaultTheme}
      >
        <EditorStylesExtend
          campaign={true}
          inlineMenu={this.props.inlineMenu}
          styles={this.props.styles}
        >
          {!this.props.loading ? (
            <>
              {/*<DanteEditor
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
            />*/}
              <Dante
                onChange={(e) => {
                  console.log('EEE', e);
                  //this.dante_editor = e;
                }}
                readOnly={this.props.read_only}
                bodyPlaceholder={I18n.t('common.type_message')}
                //handleReturn={(e) => {
                //  console.log("HANDLE RETURN!")
                //return (
                //  this.props.handleReturn &&
                //  this.props.handleReturn(e, this.isEmptyDraftJs(), this)
                //);
                //}}

                editorProps={{
                  handleKeyDown: (view, event) => {
                    if (event.key === 'Enter') {
                      return (
                        this.props.handleReturn &&
                        this.props.handleReturn(event, false, this)
                      );
                      //return this.props.handleReturn && this.props.handleReturn(event, this.isEmptyDraftJs(), this)
                      console.log('YES!!');
                      return false;
                    }
                  },
                  //attributes: {
                  //  class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
                  //},
                  //transformPastedText(text) {
                  //  return text.toUpperCase()
                  //}
                }}
                onUpdate={this.props.updateState}
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
              />
            </>
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
