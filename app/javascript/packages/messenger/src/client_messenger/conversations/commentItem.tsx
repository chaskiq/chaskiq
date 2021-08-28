import React from 'react';
import Moment from 'react-moment';
import ErrorBoundary from '@chaskiq/components/src/components/ErrorBoundary';

import {
  CommentsItem,
  ReadIndicator,
  ConversationSummary,
  ConversationSummaryAvatar,
  ConversationSummaryBody,
  ConversationSummaryBodyMeta,
  ConversationSummaryBodyContent,
  ConversationSummaryBodyItems,
  Autor,
} from '../styles/styled';

export function CommentsItemComp({ displayConversation, message, o, i18n }) {
  const [display, setDisplay] = React.useState(false);

  function renderEventBlock(o) {
    const { data, action } = o.message;
    return (
      <span>
        <i>{i18n.t(`messenger.conversations.events.${action}`, data)}</i>
      </span>
    );
  }

  function renderItemPackage(message) {
    switch (message.message.blocks.type) {
      case 'app_package':
        let namespace = 'app_package_wait_reply';
        const pkg = message.message.blocks.app_package;
        if (pkg.wait_for_input === false || pkg.waitForInput === false) {
          namespace = 'app_package_non_wait';
        }

        return i18n.t(`messenger.conversations.message_blocks.${namespace}`);
      // falls through

      // return <span>{message.message.blocks.app_package}</span>
      case 'ask_option':
        return i18n.t('messenger.conversations.message_blocks.ask_option');
      case 'data_retrieval':
        return i18n.t('messenger.conversations.message_blocks.data_retrieval');
      default:
        return message.message.blocks.type;
    }
  }

  function renderMessage(message) {
    var length = 80;
    const d = JSON.parse(message.message.serializedContent);
    let string = '';
    if (!d) {
      string = message.message.htmlContent;
    } else {
      string = d.blocks.map((block) => block.text).join('\n');
    }

    if (!string) return '';

    var trimmedString =
      string.length > length ? string.substring(0, length - 3) + '...' : string;
    return trimmedString;
  }

  function renderMessages(message) {
    if (message.message.blocks) return renderItemPackage(message);
    if (message.message.action) return renderEventBlock(message);
    return renderMessage(message);
  }

  React.useEffect(() => {
    const timeout = setTimeout(() => setDisplay(true), 400); // + (index * 100))

    // this cancell effect
    return function () {
      clearTimeout(timeout);
    };
  }, []);

  function renderAgentAvatar() {
    const a = agent();
    return a.avatarUrl;
  }

  function agent() {
    if (message && message.appUser.kind === 'agent') return message.appUser;
    if (o.assignee) return o.assignee;
  }

  return (
    <CommentsItem
      displayOpacity={display}
      key={`comments-item-${o.id}`}
      onClick={(e) => {
        displayConversation(e, o);
      }}
    >
      {message && (
        <ConversationSummary>
          <ConversationSummaryAvatar>
            {agent() && <img src={renderAgentAvatar()} />}
          </ConversationSummaryAvatar>

          <ConversationSummaryBody>
            <ConversationSummaryBodyMeta>
              {!message.readAt && message.appUser.kind != 'app_user' ? (
                <ReadIndicator />
              ) : null}
              <Autor>{agent() && agent().displayName}</Autor>

              <Moment
                fromNow
                style={{
                  float: 'right',
                  color: '#ccc',
                  width: '115px',
                  margin: '0px 10px',
                  fontSize: '.8em',
                  textTransform: 'unset',
                  textAlign: 'right',
                  fontWeight: 100,
                }}
              >
                {message.createdAt}
              </Moment>
            </ConversationSummaryBodyMeta>

            <ConversationSummaryBodyItems>
              {message.appUser && message.appUser.kind != 'agent' ? (
                <div className="you">{i18n.t('messenger.you')}:</div>
              ) : null}

              <ConversationSummaryBodyContent>
                {
                  // dangerouslySetInnerHTML={
                  //  { __html: sanitizeMessageSummary(message.message.htmlContent) }
                  // }
                }

                <ErrorBoundary>{renderMessages(message)}</ErrorBoundary>
              </ConversationSummaryBodyContent>
            </ConversationSummaryBodyItems>
          </ConversationSummaryBody>
        </ConversationSummary>
      )}
    </CommentsItem>
  );
}
