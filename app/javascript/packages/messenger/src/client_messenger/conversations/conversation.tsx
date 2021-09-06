import React from 'react';
import { ThemeProvider } from 'emotion-theming';

import theme from '../textEditor/theme';
import themeDark from '../textEditor/darkTheme';
import DraftRenderer from '../textEditor/draftRenderer';
import DanteContainer from '../textEditor/editorStyles';
import styled from '@emotion/styled';
import Moment from 'react-moment';
import UnicornEditor from '../textEditor';
import { isEmpty } from 'lodash';
import {
  EditorSection,
  CommentsWrapper,
  Footer,
  MessageItem,
  UserAutoChatAvatar,
  ConversationSummaryAvatar,
  MessageSpinner,
  ConversationEventContainer,
  InlineConversationWrapper,
  FooterAckInline,
} from '../styles/styled';

import NewConversationBlock from './newConversationBlock';
import { MessengerContext } from '../context';
import AppPackageBlock from './appPackageBlock';
import MessageItemWrapper from './messageItemWrapper';

const DanteStylesExtend = styled(DanteContainer)`
  .graf--code {
    width: 242px;
    overflow: auto;
  }
`;
export function Conversation(props) {
  let wait_for_input = React.useRef(null);
  const {
    value: {
      kind,
      domain,
      i18n,
      updateHeader,
      conversation,
      setConversation,
      displayAppBlockFrame,
      insertComment,
      pushEvent,
      appData,
      setOverflow,
      setInlineOverflow,
      isMobile,
      inline_conversation,
      agent_typing,
      submitAppUserData,
      updatePackage,
      getPackage,
      visible,
      email,
      isUserAutoMessage,
    },
  } = React.useContext<any>(MessengerContext);

  const { footerClassName } = props;

  React.useEffect(() => {
    updateHeader({
      translateY: 0,
      opacity: 1,
      height: '0',
    });
  }, []);

  // TODO: skip on xhr progress
  function handleConversationScroll(e) {
    if (props.disablePagination) return;

    const element = e.target;
    if (element.scrollTop === 0) {
      // on top
      const meta = conversation.messages.meta;
      if (meta && meta.next_page) {
        setConversation(conversation.key);
      }
    } else {
      updateHeader({
        translateY: 0,
        opacity: 1,
        height: 0,
      });
    }
  }

  function appPackageBlockDisplay(message) {
    displayAppBlockFrame(message);
  }

  function appPackageClickHandler(item, message) {
    // for new_conversation blocks
    if (
      message.message.blocks.type === 'ask_option' &&
      conversation.key === 'volatile'
    ) {
      return insertComment(
        {
          conversation_key: conversation.key,
          message_key: message.key,
          trigger: message.message.triggerId,
          reply: item,
        },
        {
          before: () => {
            console.log('init conversation with ', item);
          },
          sent: () => {
            console.log('sent conversation', item);
          },
        }
      );
    }

    if (message.message.blocks.type === 'app_package') {
      return appPackageBlockDisplay(message);
    }

    pushEvent('trigger_step', {
      conversation_key: conversation.key,
      message_key: message.key,
      trigger: message.triggerId,
      step: item.nextStepUuid || item.next_step_uuid,
      reply: item,
    });
  }

  function appPackageSubmitHandler(data, message) {
    pushEvent('receive_conversation_part', {
      conversation_key: conversation.key,
      message_key: message.key,
      step: message.stepId,
      trigger: message.triggerId,
      ...data,
    });
  }

  function renderTyping() {
    return (
      <MessageItem>
        <div className="message-content-wrapper">
          <MessageSpinner>
            <div className={'bounce1'} />
            <div className={'bounce2'} />
            <div className={'bounce3'} />
          </MessageSpinner>
          <span
            style={{
              fontSize: '0.7rem',
              color: '#afabb3',
            }}
          >
            {i18n.t('messenger.is_typing', {
              name: agent_typing.author.name || 'agent',
            })}
          </span>
        </div>
      </MessageItem>
    );
  }

  function isInboundRepliesClosed() {
    const namespace = kind === 'AppUser' ? 'users' : 'visitors';

    const inboundSettings = appData.inboundSettings[namespace];

    // if this option is not enabled then replies are allowed
    if (!inboundSettings.close_conversations_enabled) return;

    // if this is not a number asume closed
    if (isNaN(inboundSettings.close_conversations_after)) return true;

    // if zero we asume closed
    if (inboundSettings.close_conversations_after === 0) return true;

    const now = new Date();
    const closedAtDate = new Date(conversation.closedAt);
    //@ts-ignore
    const diff = (now - new Date(closedAtDate)) / (1000 * 3600 * 24);

    // if diff is greather than setting assume closed
    if (Math.round(diff) >= inboundSettings.close_conversations_after)
      return true;
  }

  function isInputEnabled() {
    if (conversation.state === 'closed') {
      if (isInboundRepliesClosed()) {
        return false;
      }
    }

    if (isEmpty(conversation.messages)) return true;

    const messages = conversation.messages.collection;
    if (messages.length === 0) return true;

    const message = messages[0].message;
    if (isEmpty(message.blocks)) return true;
    if (message.blocks && message.blocks.type === 'wait_for_reply') return true;

    // strict comparison of false
    if (message.blocks && message.blocks.wait_for_input === false) return true;
    if (message.blocks && message.blocks.waitForInput === false) return true;

    return message.state === 'replied';
  }

  function renderInlineCommentWrapper() {
    return (
      <div
        ref={(comp) => setOverflow(comp)}
        onScroll={handleConversationScroll}
        style={{
          overflowY: 'auto',
          height: '86vh',
          position: 'absolute',
          width: '100%',
          zIndex: 20,
        }}
      >
        <CommentsWrapper
          isReverse={true}
          isInline={inline_conversation}
          ref={(comp) => setInlineOverflow(comp)}
        >
          {renderMessages()}
        </CommentsWrapper>
      </div>
    );
  }

  function renderCommentWrapper() {
    return (
      <CommentsWrapper isReverse={true}>{renderMessages()}</CommentsWrapper>
    );
  }

  function renderMessage(o, _i) {
    const userClass = o.appUser.kind === 'agent' ? 'admin' : 'user';
    const isAgent = o.appUser.kind === 'agent';
    const themeforMessage = o.privateNote || isAgent ? theme : themeDark;

    return (
      <MessageItemWrapper
        visible={visible}
        email={email}
        key={`conversation-${conversation.key}-item-${o.key}`}
        conversation={conversation}
        pushEvent={pushEvent}
        data={o}
      >
        <MessageItem
          className={userClass}
          messageSourceType={o.messageSource ? o.messageSource.type : ''}
          isInline={inline_conversation}
        >
          {!isUserAutoMessage(o) && isAgent && (
            <ConversationSummaryAvatar>
              <img src={o.appUser.avatarUrl} />
            </ConversationSummaryAvatar>
          )}

          <div className="message-content-wrapper">
            {isUserAutoMessage(o) && (
              <UserAutoChatAvatar>
                <img src={o.appUser.avatarUrl} />
                <span>{o.appUser.name || '^'}</span>
              </UserAutoChatAvatar>
            )}

            {/* render light theme on user or private note */}

            <ThemeProvider theme={themeforMessage}>
              <DanteStylesExtend>
                <DraftRenderer
                  message={o}
                  domain={domain}
                  raw={JSON.parse(o.message.serializedContent)}
                />

                <span className="status">
                  {o.readAt ? (
                    <Moment fromNow>{o.readAt}</Moment>
                  ) : (
                    <span>{i18n.t('messenger.not_seen')}</span>
                  )}
                </span>
              </DanteStylesExtend>
            </ThemeProvider>
          </div>
        </MessageItem>
      </MessageItemWrapper>
    );
  }

  function renderItemPackage(o, i) {
    return (
      <AppPackageBlock
        key={`package-${o.key}-${i}`}
        message={o}
        conversation={conversation}
        clickHandler={appPackageClickHandler}
        appPackageSubmitHandler={appPackageSubmitHandler}
        i18n={i18n}
        searcheableFields={appData.searcheableFields}
        displayAppBlockFrame={displayAppBlockFrame}
        getPackage={getPackage}
        // {...o}
      />
    );
  }

  function renderEventBlock(o, _i) {
    const { data, action } = o.message;
    return (
      <ConversationEventContainer isInline={inline_conversation}>
        <span>{i18n.t(`messenger.conversations.events.${action}`, data)}</span>
      </ConversationEventContainer>
    );
  }

  function renderMessages() {
    return (
      <React.Fragment>
        {agent_typing && renderTyping()}
        {isInputEnabled() &&
          conversation.messages &&
          conversation.messages.collection.length >= 3 && (
            <FooterAckInline>
              <a href="https://chaskiq.io" target="blank">
                <img src={`${domain}/logo-gray.png`} />{' '}
                {i18n.t('messenger.runon')}
              </a>
            </FooterAckInline>
          )}

        {conversation.messages &&
          conversation.messages.collection.map((o, i) => {
            if (o.message.blocks) return renderItemPackage(o, i);
            if (o.message.action) return renderEventBlock(o, i);
            return renderMessage(o, i);
          })}
      </React.Fragment>
    );
  }

  function renderReplyAbove() {
    if (inline_conversation) return null;
    return i18n.t('messenger.reply_above');
  }

  function renderNewConversationButton() {
    return (
      <NewConversationBlock
        styles={{
          bottom: '-8px',
          height: '93px',
          background: '#ffffff',
          boxShadow: '-2px 1px 9px 0px #a0a0a0',
        }}
      >
        <p style={{ margin: '0 0 9px 0px' }}>
          {i18n.t('messenger.closed_conversation')}
        </p>
      </NewConversationBlock>
    );
  }

  function handleBeforeSubmit() {
    const { messages } = conversation;
    if (isEmpty(messages)) return;
    const message = messages.collection[0];
    if (!message) return;
    if (!message.message) return;
    if (
      message.message.blocks &&
      message.message.blocks.type === 'wait_for_reply'
    ) {
      wait_for_input.current = message;
    }
  }

  function handleSent() {
    if (!wait_for_input.current) return;

    const message = wait_for_input.current;

    pushEvent('receive_conversation_part', {
      conversation_key: conversation.key,
      message_key: message.key,
      step: message.stepId,
      trigger: message.triggerId,
      // submit: data
    });

    wait_for_input.current = null;
  }

  function footerReplyIndicator() {
    if (conversation.state === 'closed') return renderNewConversationButton();
    return renderReplyAbove();
  }

  function renderFooter() {
    return (
      <Footer
        isInputEnabled={isInputEnabled()}
        className={footerClassName || ''}
      >
        {!isInputEnabled() ? (
          footerReplyIndicator()
        ) : (
          <UnicornEditor
            i18n={i18n}
            beforeSubmit={(data) => handleBeforeSubmit()}
            onSent={(data) => handleSent()}
            domain={domain}
            footerClassName={footerClassName}
            insertComment={insertComment}
          />
        )}
      </Footer>
    );
  }

  function renderInline() {
    return (
      <div>
        <EditorSection isInline={true}>
          {renderInlineCommentWrapper()}
          {renderFooter()}
        </EditorSection>
      </div>
    );
  }

  function renderDefault() {
    return (
      <div
        ref={(comp) => setOverflow(comp)}
        onScroll={handleConversationScroll}
        style={{ overflowY: 'auto', height: '100%' }}
      >
        <EditorSection>
          {renderCommentWrapper()}
          {renderFooter()}
        </EditorSection>
      </div>
    );
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
      {inline_conversation ? renderInline() : renderDefault()}
    </div>
  );
}

export function InlineConversation({ conversation }) {
  return (
    <InlineConversationWrapper>
      hola {conversation.key}
    </InlineConversationWrapper>
  );
}
