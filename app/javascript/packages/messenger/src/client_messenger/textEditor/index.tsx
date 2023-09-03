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

import Styled from 'dante3/package/esm/styled';
import styled from '@emotion/styled';

import { ThemeProvider } from '@emotion/react';
import {
  defaultTheme as theme,
  darkTheme,
} from 'dante3/package/esm/styled/themes';

import CircularProgress from '@chaskiq/components/src/components/Progress';
import { getFileMetadata } from '@chaskiq/components/src/components/fileUploader';

const { EditorContainer } = Styled;
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

    const menuConfig = Object.assign(
      {},
      MenuBarConfig(), //this.props.inlineTooltipConfig),
      inlineMenu
    );

    return [AddButtonConfig(), menuConfig];
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

  render() {
    return (
      <ThemeProvider theme={theme}>
        <EditorStylesExtend campaign={true} styles={this.props.styles}>
          {!this.props.loading ? (
            <Dante
              {...defaultProps}
              debug={false}
              //data_storage={{
              //  url: '/',
              //  save_handler: this.saveHandler,
              //}}
              //onChange={(e) => {
              //  this.dante_editor = e;
              //}}
              onUpdate={(editor: any) => {
                const html = editor.getHTML();
                const serialized = editor.getJSON();

                this.props.updateState &&
                  this.props.updateState({
                    status: 'saving...',
                    statusButton: 'success',
                    content: {
                      html: html,
                      serialized: serialized,
                    },
                  });
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
            />
          ) : (
            <CircularProgress />
          )}
        </EditorStylesExtend>
      </ThemeProvider>
    );
  }
}
