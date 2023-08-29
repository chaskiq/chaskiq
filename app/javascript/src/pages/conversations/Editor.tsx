import React, { Component, CSSProperties } from 'react';
import styled from '@emotion/styled';
import Tabs from './tabs';
import NewEditor from './newEditor';
import I18n from '../../shared/FakeI18n';
import Dropdown from '@chaskiq/components/src/components/Dropdown';
import Button from '@chaskiq/components/src/components/Button';
import { DownArrow } from '@chaskiq/components/src/components/icons';

type EditorContainerType = {
  note: boolean;
  style: CSSProperties;
};
const EditorContainer = styled.div<EditorContainerType>`
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  min-width: 272px;
  min-height: 71px;
  max-height: 250px;
  height: auto;
  overflow: auto;
  //background-color: white;
  box-sizing: border-box;
  max-width: inherit;
  word-wrap: break-word;
  border-top: 1px solid rgb(223, 225, 230);
  border-image: initial;
  -webkit-animation: none;
  animation: none;
  //padding: 10px;
  //border: 1px solid #ccc;
  //border-radius: 2px;
  //margin-top: 1px;

  .inlineTooltip-button {
    width: 30px;
    height: 30px;
  }
  .tooltip-icon svg {
    width: 20px;
    height: 20px;
    display: flex;
  }
`;

const EditorWrapper = styled.div`
  width: 100%;
`;

type ConversationEditorProps = {
  insertNote: (formats: any, cb?: any) => void;
  insertComment: (formats: any, cb?: any) => void;
  typingNotifier: (cb?: any) => void;
  insertAppBlockComment: (data: any, cb: any) => void;
  isNew: boolean;
  theme: any;
  initiatorChannels: any;
  initiatorChannel: any;
  setInitiatorChannel: any;
  app: any;
};

type ConversationEditorState = {
  loading: boolean;
  sendMode: 'enter' | '';
};
export default class ConversationEditor extends Component<
  ConversationEditorProps,
  ConversationEditorState
> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      sendMode: 'enter',
    };
  }

  fallbackEditor = false;
  delayTimer = null;

  submitData = (formats, options) => {
    // DANTE does not provide a way to update contentState from outside ?
    // hide and show editor hack
    this.setState(
      {
        loading: true,
      },
      () => {
        options.note
          ? this.props.insertNote(formats, this.enable)
          : this.props.insertComment(formats, this.enable);
      }
    );
  };

  enable = () => {
    this.setState({
      loading: false,
    });
  };

  toggleSendMode = (_e) => {
    this.setState({
      sendMode: this.state.sendMode === 'enter' ? '' : 'enter',
    });
  };

  handleTyping = (content) => {
    // means if content empty
    if (content.html === '<p className="graf graf--p"></p>') return;

    clearTimeout(this.delayTimer);
    this.delayTimer = setTimeout(() => {
      this.props.typingNotifier();
    }, 400);
  };

  renderEditor = (opts) => {
    return (
      <EditorWrapper>
        <EditorContainer
          note={opts.note}
          style={opts.note ? { background: 'lemonchiffon' } : {}}
        >
          {/*!this.state.loading ? // not sure why we hide the text editor when loading. */}
          <NewEditor
            insertAppBlockComment={this.props.insertAppBlockComment}
            submitData={(formats) => this.submitData(formats, opts)}
            saveContentCallback={(content) => this.handleTyping(content)}
            sendMode={this.state.sendMode}
            {...this.props}
          />
        </EditorContainer>
      </EditorWrapper>
    );
  };

  resolvedTabs = () => {
    if (this.props.isNew) {
      return [
        {
          label: 'Email',
          content: this.renderEditor({}),
          render: () => {
            return (
              <EEDropdown
                key="conversation-channel-select"
                items={this.props.initiatorChannels}
                selectedItem={this.props.initiatorChannel}
                setSelectedItem={this.props.setInitiatorChannel}
              />
            );
          },
        },
        {
          label: I18n.t('conversation.messages.note'),
          content: this.renderEditor({ note: true }),
        },
      ];
    }

    return [
      {
        label: I18n.t('conversation.messages.reply'),
        content: this.renderEditor({}),
      },
      {
        label: I18n.t('conversation.messages.note'),
        content: this.renderEditor({ note: true }),
      },
    ];
  };

  render() {
    return (
      <Tabs
        tabs={this.resolvedTabs()}
        buttons={() => (
          <div className="flex flex-grow items-center justify-end pr-3">
            <input
              id="send_mode"
              type="checkbox"
              checked={this.state.sendMode === 'enter'}
              onChange={(e) => {
                this.toggleSendMode(e);
              }}
              className="form-checkbox h-4 w-4 text-brand-600 transition duration-150 ease-in-out"
            />
            <label
              htmlFor="send_mode"
              className="ml-2 block text-xs leading-5 text-gray-900 dark:text-gray-100"
            >
              {I18n.t('common.send_on_enter')}
            </label>
          </div>
        )}
      />
    );
  }
}

function EEDropdown({ items, selectedItem, setSelectedItem }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  function selectItem(o) {
    setSelectedItem(o);
    setDialogOpen(false);
  }

  return (
    <Dropdown
      isOpen={dialogOpen}
      onOpen={(v) => setDialogOpen(v)}
      triggerButton={(cb) => (
        <Button
          variant="clean"
          className="flex flex-wrap"
          color="primary"
          size="sm"
          onClick={cb}
        >
          <DownArrow variant="small" /> {selectedItem.name}
        </Button>
      )}
    >
      <ul
        className="max-h-24 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-800"
        role="listbox"
      >
        {items.map((o) => (
          <li
            key={`channel-item-${o.name}`}
            onClick={() => selectItem(o)}
            className="cursor-pointer select-none px-4 py-2 hover:text-white hover:bg-gray-400 dark:hover:text-black dark:hover:bg-gray-600 dark:text-white"
            role="option"
            tabIndex={-1}
          >
            {o.name}
          </li>
        ))}
      </ul>
    </Dropdown>
  );
}
