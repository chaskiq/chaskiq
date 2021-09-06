import React from 'react';

import { MessengerContext } from '../context';

import { CommentsWrapper, Hint, ConversationsFooter } from '../styles/styled';

import Loader from '../loader';

import sanitizeHtml from '@chaskiq/components/src/utils/htmlSanitize';
import { CommentsItemComp } from './commentItem';
import NewConversationBlock from './newConversationBlock';

export default function Conversations() {
  const [loading, setLoading] = React.useState(false);
  const {
    value: {
      i18n,
      conversations,
      clearAndGetConversations,
      updateHeader,
      conversationsMeta,
      getConversations,
      isMobile,
      displayConversation,
      appData,
    },
  } = React.useContext<any>(MessengerContext);

  React.useEffect(() => {
    clearAndGetConversations({}, () => {
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    updateHeader({
      translateY: 0,
      opacity: 1,
      height: '0',
    });
  }, []);

  // TODO: skip on xhr progress
  function handleConversationsScroll(e) {
    const element = e.target;
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      if (conversationsMeta.next_page) {
        getConversations({ append: true });
      }
    }
  }

  function sanitizeMessageSummary(message) {
    if (!message) {
      return;
    }

    const sanitized = sanitizeHtml(message);
    return sanitized.length > 100
      ? `${sanitized.substring(0, 100)} ...`
      : sanitized;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '0',
        bottom: '0',
        left: '0',
        right: '0',
      }}
    >
      <div
        onScroll={handleConversationsScroll}
        style={{ overflowY: 'auto', height: '100%' }}
      >
        <CommentsWrapper>
          {loading && <Loader sm />}
          {conversations.map((o, _i) => {
            const message = o.lastMessage;

            return (
              <CommentsItemComp
                key={`comments-item-comp-${o.key}`}
                message={message}
                o={o}
                i18n={i18n}
                displayConversation={displayConversation}
              />
            );
          })}
        </CommentsWrapper>

        <ConversationsFooter>
          <Hint>{appData.tagline}</Hint>
          <NewConversationBlock />
        </ConversationsFooter>
      </div>
    </div>
  );
}
