import React, { Component } from 'react';
import I18n from '../../shared/FakeI18n';

import { MenuBarConfig, AddButtonConfig, Icons } from 'dante3/package/esm';

//import Icons from 'Dante2/package/esm/editor/components/icons';

import TextEditor from '@chaskiq/components/src/components/danteEditor';
import styled from '@emotion/styled';
import { AppPackageBlockConfig } from '@chaskiq/components/src/components/danteEditor/appPackage';
import { OnDemandTriggersBlockConfig } from '@chaskiq/components/src/components/danteEditor/onDemandTriggers';
import { QuickRepliesBlockConfig } from '@chaskiq/components/src/components/danteEditor/quickReplies';
import { SendIcon } from '@chaskiq/components/src/components/icons';

import AppPackagePanel from './appPackagePanel';
import TriggersPanel from './triggersPanel';
import QuickReplyPanel from './quickRepliesPanel';

export const ArticlePad = styled.div`
  @media (max-width: 640px) {
    margin: 1rem !important;
    margin-top: 5px !important;
    padding: 1rem;
  }

  @media only screen and (min-width: 1200px) {
    margin: 9rem !important;
    margin-top: 18px !important;
  }

  /*background: white;*/

  padding: 2rem;
  margin: 2rem !important;
  margin-top: 18px !important;

  border: 1px solid #dde1eb;
  -webkit-box-shadow: 0 4px 8px 0 hsla(212, 9%, 64%, 0.16),
    0 1px 2px 0 rgba(39, 45, 52, 0.08);
  box-shadow: 0 4px 8px 0 hsla(212, 9%, 64%, 0.16),
    0 1px 2px 0 rgba(39, 45, 52, 0.08);
  .debugControls {
    position: relative;
  }
`;

export const SelectionIndicator = styled.span`
  position: relative;
  background-color: red;
  }
`;

export const ChatEditorInput = styled.div`
  @media (min-width: 320px) and (max-width: 480px) {
    width: 60%;
  }
`;

const Input = styled.textarea<any>`
  margin: 0px;
  width: 100%;
  height: 73px;
  outline: none;
  border: none;
  padding-left: 10px;
  padding-top: 10px;
  font-size: 1em;
  resize: none;
  background: transparent;
`;

const FallbackNotice = styled.span`
  font-size: 0.7em;
  padding: 12px;
`;

type SubmitButtonType = {
  onClick: (e: React.SyntheticEvent) => void;
  disabled?: boolean;
};
const SubmitButton = function (props: SubmitButtonType) {
  return (
    <button
      className={`flex w-1/6 justify-center
        bg-white hover:bg-gray-100 
        text-gray-800 font-semibold py-2 
        px-3 border-l border-gray-400 shadow items-center m-2 
        rounded border`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      <SendIcon />
    </button>
  );
};

type ChatEditorProps = {
  submitData: (val: any) => void;
  insertAppBlockComment: (data: any, cb: any) => void;
  loading?: boolean;
  sendMode: 'enter' | '';
  insertComment: (val: any, cb: any) => void;
  saveContentCallback: (val: any) => void;
  app: any;
  theme: any;
};

type ChatEditorState = {
  loading: boolean;
  data: any;
  status: string;
  plain: string;
  serialized: string;
  html: string;
  text: string;
  statusButton: 'inprogress' | 'success' | null;
  openPackagePanel: boolean;
  openTriggersPanel: boolean;
  openQuickReplyPanel: boolean;
  disabled: boolean;
  openGiphy: boolean;
  read_only: boolean;
};
export default class ChatEditor extends Component<
  ChatEditorProps,
  ChatEditorState
> {
  fallbackEditor: boolean;
  editorRef: React.RefObject<HTMLInputElement>;

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: {},
      status: '',
      plain: null,
      serialized: null,
      html: null,
      text: null,
      statusButton: 'inprogress',
      openPackagePanel: false,
      openTriggersPanel: false,
      openQuickReplyPanel: false,
      disabled: true,
      openGiphy: false,
      read_only: false,
    };

    this.fallbackEditor = this.isMobile();
    this.editorRef = React.createRef();
  }

  isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  tooltipsConfig = () => {
    const inlineMenu = {
      selectionElements: [
        'text',
        'blockquote',
        'ordered-list',
        'unordered-list',
        'unordered-list-item',
        'ordered-list-item',
        'code-block',
        'heading',
        'paragraph',
      ],

      widget_options: {
        placeholder: 'type a url',

        block_types: [
          { label: 'p', style: 'unstyled', icon: Icons.bold },
          {
            label: 'h2',
            style: 'header-one',
            type: 'block',
            icon: Icons.h1,
          },
          {
            label: 'h3',
            style: 'header-two',
            type: 'block',
            icon: Icons.h2,
          },

          { type: 'separator' },
          { type: 'link' },

          {
            label: 'blockquote',
            style: 'blockquote',
            type: 'block',
            icon: Icons.blockquote,
          },

          { type: 'separator' },

          {
            label: 'code',
            style: 'code-block',
            type: 'block',
            icon: Icons.code,
          },
          {
            label: 'bold',
            style: 'BOLD',
            type: 'inline',
            icon: Icons.bold,
          },
          {
            label: 'italic',
            style: 'ITALIC',
            type: 'inline',
            icon: Icons.italic,
          },
        ],
      },
    };

    const menuConfig = Object.assign({}, MenuBarConfig(), inlineMenu);

    return [
      AddButtonConfig({
        fixed: true,
      }),
      //DanteAnchorPopoverConfig(),
      //DanteInlineTooltipConfig({ fixed: true }),
      menuConfig,
      // DanteMarkdownConfig()
    ];
  };

  uploadHandler = ({ serviceUrl, imageBlock }) => {
    imageBlock.updateAttributes({
      url: serviceUrl,
    });
    //imageBlock.uploadCompleted(serviceUrl, () => {
    //  this.setDisabled(false);
    //});
  };

  componentDidMount() {
    // this breaks anchors render on editor
    //this.editorRef.current &&
    //this.editorRef.current.refs.editor &&
    //this.editorRef.current.refs.editor.focus()
  }

  saveContent = (content) => {
    this.setState(
      {
        status: 'saving...',
        statusButton: 'success',
        html: content.html,
        serialized: content.serialized,
      },
      () =>
        this.props.saveContentCallback &&
        this.props.saveContentCallback(content)
    );
  };

  handleSubmit = () => {
    const { html, serialized } = this.state;
    this.props.submitData({ html, serialized: JSON.stringify(serialized) });
    // this.editorRef.editor.commands.clearContent(true)
    //@ts-ignore
    this.editorRef?.commands?.clearContent(true);
    return true;
  };

  saveHandler = (_html3, _plain, _serialized) => {};

  setDisabled = (val) => {
    this.setState({ disabled: val });
  };

  isDisabled = () => {
    return (
      this.state.html === '<p className="graf graf--p"></p>' ||
      this.state.disabled
    );
  };

  handleAppFunc = () => {
    this.setState({ openPackagePanel: true });
  };

  handleBotFunc = () => {
    this.setState({ openTriggersPanel: true });
  };

  handleQuickRepliesFunc = () => {
    this.setState({ openQuickReplyPanel: true });
  };

  allowedEditorFeature = (feature_type) => {
    return this.resolveEditorSetting(
      this.props.app.agentEditorSettings,
      feature_type
    );
  };

  resolveEditorSetting = (setting, feature_type) => {
    return !setting ? true : setting[feature_type];
  };

  extraWidgets = () => {
    const widgets = [];

    if (this.allowedEditorFeature('app_packages')) {
      widgets.push(
        AppPackageBlockConfig({
          handleFunc: this.handleAppFunc,
        })
      );
    }

    if (this.allowedEditorFeature('bot_triggers')) {
      widgets.push(
        OnDemandTriggersBlockConfig({
          handleFunc: this.handleBotFunc,
        })
      );
    }

    if (this.allowedEditorFeature('quick_replies')) {
      widgets.push(
        QuickRepliesBlockConfig({
          handleFunc: this.handleQuickRepliesFunc,
        })
      );
    }

    return widgets;
  };

  isDocEmpty = (docJSON) => {
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
  };

  render() {
    const serializedContent = this.state.serialized
      ? this.state.serialized
      : null;
    return (
      <div
        //themeType={this.props.theme}
        className="flex bg-gray-50 dark:bg-gray-800 dark:text-white text-black shadow-inner p-2"
      >
        {this.state.openPackagePanel && (
          <AppPackagePanel
            kind={'conversations'}
            open={this.state.openPackagePanel}
            close={() => {
              this.setState({ openPackagePanel: false });
            }}
            insertComment={(data) => {
              this.props.insertAppBlockComment(data, () => {
                this.setState({
                  openPackagePanel: false,
                });
              });
            }}
          />
        )}

        {this.state.openQuickReplyPanel && (
          <QuickReplyPanel
            theme={this.props.theme}
            open={this.state.openQuickReplyPanel}
            close={() => {
              this.setState({ openQuickReplyPanel: false });
            }}
            insertComment={(data) => {
              this.props.insertComment(data, () => {
                this.setState({
                  openQuickReplyPanel: false,
                });
              });
            }}
          />
        )}

        {this.state.openTriggersPanel && (
          <TriggersPanel
            open={this.state.openTriggersPanel}
            close={() => {
              this.setState({ openTriggersPanel: false });
            }}
            insertComment={(data) => {
              this.props.insertAppBlockComment(data, () => {
                this.setState({
                  openTriggersPanel: false,
                });
              });
            }}
          />
        )}

        <ChatEditorInput style={{ flexGrow: 3 }}>
          <>
            {/*<TextEditor
                allowedEditorFeature={this.allowedEditorFeature}
                theme={editorTheme}
                inlineMenu={true}
                tooltipsConfig={this.tooltipsConfig}
                campaign={true}
                uploadHandler={this.uploadHandler}
                serializedContent={serializedContent}
                loading={this.props.loading}
                setDisabled={this.setDisabled}
                read_only={this.state.read_only}
                //ref={this.editorRef} // this breaks the anchors on editor
                handleReturn={(e, isEmptyDraft) => {
                  if (isEmptyDraft || this.isDisabled()) return;
                  if (
                    this.props.sendMode == 'enter' &&
                    !e.nativeEvent.shiftKey
                  ) {
                    return this.handleSubmit();
                  }
                }}
                toggleEditable={() => {
                  this.setState({
                    read_only: !this.state.read_only,
                  });
                }}
                appendWidgets={this.extraWidgets()}
                data={{
                  serialized_content: serializedContent,
                }}
                styles={{
                  lineHeight: '2em',
                  fontSize: '1.2em',
                }}
                saveHandler={this.saveHandler}
                updateState={({ _status, _statusButton, content }) => {
                  this.saveContent(content);
                }}
              />*/}

            <TextEditor
              //widgets={defaultPlugins}
              theme={this.props.theme}
              //theme={editorTheme}
              //fixed={fixed}
              styles={{
                lineHeight: '1.2em',
                fontSize: '1em',
              }}
              uploadHandler={this.uploadHandler}
              allowedEditorFeature={this.allowedEditorFeature}
              inlineMenu={true}
              tooltipsConfig={this.tooltipsConfig}
              appendWidgets={this.extraWidgets()}
              content={''}
              serializedContent={serializedContent}
              handleReturn={(e, isEmptyDraft, ctx) => {
                ///console.log("IS EMOT", this.isDocEmpty(this.state.serialized))
                ///console.log("DIDIDI", this.isDisabled())
                try {
                  console.log(
                    e.currentTarget.pmViewDesc.node.content.content[0].attrs
                      .blockKind
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

                if (this.isDocEmpty(this.state.serialized)) return; //|| this.isDisabled()) return;
                if (
                  this.props.sendMode == 'enter'
                  //&&
                  //!e.nativeEvent.shiftKey
                ) {
                  this.handleSubmit();
                  e.currentTarget.editor.commands.clearContent(true);
                  return true;
                }
              }}
              //style={{}}
              readOnly={false}
              updateState={(editor: any) => {
                this.editorRef = editor;
                this.saveContent({
                  html: editor.getHTML(),
                  serialized: editor.getJSON(),
                });

                //console.log("content", editor.getHTML())
                //console.log("content", JSON.stringify(editor.getJSON()));
              }}
              /*data_storage={{
                  interval: 10000,
                  save_handler: (context, content) => {
                    //console.log(context, content)
                  },
                }}*/
            />
          </>
        </ChatEditorInput>

        {this.props.sendMode != 'enter' && (
          <SubmitButton
            onClick={this.handleSubmit}
            disabled={this.isDocEmpty(this.state.serialized)}
            //disabled={this.state.disabled}
          />
        )}
      </div>
    );
  }
}
