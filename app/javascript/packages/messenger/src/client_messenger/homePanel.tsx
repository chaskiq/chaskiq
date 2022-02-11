import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import tw from 'twin.macro';
import {
  AnchorButton,
  FadeRightAnimation,
  CountBadge,
  ThemeProps,
  TransitionProps,
} from './styles/styled';
import { CommentsItemComp } from './conversations/commentItem';

import Loader from './loader';
import { DefinitionRenderer } from '@chaskiq/components/src/components/packageBlocks/components';

import { MessengerContext } from './context';
// import graphql from './graphql/client'

import { lighten } from 'polished';

import sanitizeHtml from '@chaskiq/components/src/utils/htmlSanitize';

const HomePanel = () => {
  const [loading, _setLoading] = useState(false);

  const {
    value: {
      i18n,
      viewConversations,
      displayNewConversation,
      updateHeader,
      transition,
      appData,
      agents,
      displayAppBlockFrame,
      displayConversation,
      conversations,
      conversationsMeta,
      getConversations,
      newMessages,
      getPackage,
      homeHeaderRef,
    },
  } = React.useContext<any>(MessengerContext);

  const [conversationLoading, setConversationLoading] = useState(false);

  useEffect(() => {
    updateHeader({
      translateY: -8,
      opacity: 1,
      height: homeHeaderRef.current.offsetHeight,
    });
  }, []);

  useEffect(() => {
    // if(!appData.inboundSettings.enabled )
    setConversationLoading(true);

    getConversations({ page: 1, per: 3 }, () => {
      setConversationLoading(false);
    });
  }, []);

  const handleScroll = (e) => {
    const target = e.target;
    const opacity =
      1 - normalize(target.scrollTop, target.offsetHeight * 0.26, 0);
    const pge = percentage(target.scrollTop, target.offsetHeight * 0.7);
    // console.log("AAAA", val)
    updateHeader({
      translateY: -pge - 8,
      opacity: opacity,
      height: homeHeaderRef.current.offsetHeight,
    });
  };

  const normalize = (val, max, min) => {
    return (val - min) / (max - min);
  };

  const percentage = (partialValue, totalValue) => {
    return (100 * partialValue) / totalValue;
  };

  function renderAvailability() {
    if (!appData.inBusinessHours) {
      return <React.Fragment>{appData.businessBackIn && aa()}</React.Fragment>;
    } else {
      return <p />;
    }
  }

  function aa() {
    const val = Math.floor(appData.businessBackIn.days);
    const at = new Date(appData.businessBackIn.at);
    const nextDay = at.getDay();
    const today = new Date(Date.now()).getDay();

    // @ts-ignore
    const TzDiff = Math.ceil((at - Date.now()) / (1000 * 3600 * 24));

    const sameDay = nextDay === today;
    const nextWeek = TzDiff >= 6 && sameDay;

    if (nextWeek)
      return (
        <Availability>
          <p>{i18n.t('messenger.availability.next_week')}</p>
        </Availability>
      );
    if (sameDay)
      return (
        <Availability>
          <p>
            {i18n.t('messenger.availability.aprox', { time: at.getHours() })}
          </p>
        </Availability>
      );

    const out = text(val, sameDay, at);

    return <Availability>{out}</Availability>;
  }

  function text(val, sameDay, at) {
    switch (val) {
      case 1:
        return <p>{i18n.t('messenger.availability.tomorrow')}</p>;
      case 2:
      case 3:
      case 4:
      case 5:
        return <p>{i18n.t('messenger.availability.days', { val: val })}</p>;
      case 6:
        return <p>{i18n.t('messenger.availability.next_week')}</p>;
      default:
        if (val === 0) {
          if (sameDay) {
            return (
              <p>
                {i18n.t('messenger.availability.back_from', {
                  hours: at.getHours(),
                })}
              </p>
            );
          } else {
            return (
              <p>
                {i18n.t('messenger.availability.tomorrow_from', {
                  hours: at.getHours(),
                })}
              </p>
            );
          }
        }
        return null;
    }
  }

  function replyTimeMessage() {
    return (
      appData.replyTime && (
        <ReplyTime>
          {i18n.t(`messenger.reply_time.${appData.replyTime.replace(' ', '')}`)}
        </ReplyTime>
      )
    );
  }

  function sanitizeMessageSummary(message) {
    if (!message) return;
    const sanitized = sanitizeHtml(message);
    return sanitized.length > 100
      ? `${sanitized.substring(0, 100)} ...`
      : sanitized;
  }

  function renderLastConversation() {
    return (
      <CardContent>
        {conversationLoading && <Loader xs={true} />}
        {!conversationLoading &&
          conversations.map((o, i) => {
            const message = o.lastMessage;
            return (
              <CommentsItemComp
                key={`comments-item-comp-${o.key}`}
                message={message}
                o={o}
                i18n={i18n}
                displayConversation={displayConversation}
                // sanitizeMessageSummary={sanitizeMessageSummary}
              />
            );
          })}

        {conversationsMeta.next_page && (
          <CardFooterLinks>
            <button onClick={viewConversations}>
              {i18n.t('messenger.view_all_conversations')}
            </button>
          </CardFooterLinks>
        )}
      </CardContent>
    );
  }

  function offsetHeight() {
    if (!homeHeaderRef.current) return 0;
    return homeHeaderRef.current.offsetHeight - 35;
  }

  return (
    <Panel onScroll={handleScroll}>
      {conversations.length > 0 && (
        <ConversationInitiator
          style={{
            marginTop: offsetHeight(),
          }}
          in={transition}
        >
          <CardPadder>
            <h2>{i18n.t('messenger.continue_conversation')}</h2>
          </CardPadder>
          {renderLastConversation()}
        </ConversationInitiator>
      )}

      {appData.inboundSettings.enabled && (
        <ConversationInitiator
          style={{
            marginTop: conversations.length > 0 ? 0 : offsetHeight(),
          }}
          in={transition}
        >
          <CardPadder>
            <h2>{i18n.t('messenger.start_conversation')}</h2>

            {renderAvailability()}

            {replyTimeMessage()}

            <CardContent>
              <ConnectedPeople>
                {agents.map((agent, i) => (
                  <Avatar key={`home-agent-${i}-${agent.id}`}>
                    <img
                      alt={agent.name}
                      src={agent.avatarUrl}
                      title={agent.name}
                    />
                  </Avatar>
                ))}
              </ConnectedPeople>

              <CardButtonsGroup>
                {/*
                  conversations.length > 0 ?
                  <h2>{t("conversations")}</h2> :
                  <AnchorButton href="#" onClick={displayNewConversation}>
                    {t("start_conversation")}
                  </AnchorButton>
                */}

                <AnchorButton href="#" onClick={displayNewConversation}>
                  {i18n.t('messenger.start_conversation')}
                </AnchorButton>

                <a
                  href="#"
                  className="see_previous"
                  onClick={viewConversations}
                >
                  {i18n.t('messenger.see_previous')}
                </a>
              </CardButtonsGroup>
            </CardContent>
          </CardPadder>

          {/* conversations.length > 0 &&
            <React.Fragment>
             {renderLastConversation()}
            </React.Fragment>
          */}
        </ConversationInitiator>
      )}

      {loading && <Loader xs></Loader>}

      {appData.homeApps &&
        appData.homeApps.map((o, i) => (
          <AppPackageRenderer
            pkg={o}
            key={`package-renderer-${o.name}-${i}`}
            app={appData}
            displayAppBlockFrame={displayAppBlockFrame}
            transition={transition}
            getPackage={getPackage}
          />
        ))}
    </Panel>
  );
};

function AppPackageRenderer({
  app,
  pkg,
  getPackage,
  transition,
  displayAppBlockFrame,
}) {
  const [definitions, setDefinitions] = React.useState(pkg.definitions);

  function updatePackage(packageParams, cb) {
    if (packageParams.field.action.type === 'frame') {
      return displayAppBlockFrame({
        message: {},
        data: {
          field: packageParams.field,
          location: packageParams.location,
          id: pkg.name,
          appKey: app.key,
          values: { ...pkg.values, ...packageParams.values },
        },
      });
    }

    if (packageParams.field.action.type === 'url') {
      return window.open(packageParams.field.action.url);
    }

    const params = {
      id: pkg.name,
      appKey: app.key,
      hooKind: packageParams.field.action.type,
      ctx: {
        field: packageParams.field,
        location: packageParams.location,
        value: packageParams.values,
      },
    };
    getPackage(params, (data) => {
      const defs = data.messenger.app.appPackage.callHook.definitions;
      setDefinitions(defs);
      cb && cb();
    });
  }

  return (
    <Card in={transition} key={`definition-${pkg.id}`}>
      <DefinitionRenderer schema={definitions} updatePackage={updatePackage} />
    </Card>
  );
}

const Panel = styled.div`
  position: fixed;
  //top: 34px;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  overflow: scroll;
  width: 100%;
  height: 94%;
  z-index: 1000;
`;

const Availability = styled.div`
  //background: #ecf94c;
  //padding: .5em;
  border-radius: 7px;
  font-weight: 300;
  p {
    margin: 0px;
  }
`;

const ReplyTime = styled.p`
  color: #969696;
  font-weight: 300;
  font-size: 0.8rem;
`;

const CardButtonsGroup = styled.div<{ theme: ThemeProps }>`
  margin-top: 1em;
  align-items: center;
  justify-content: space-between;
  display: flex;
  a,
  a:link,
  a:visited,
  a:focus,
  a:hover,
  a:active {
    color: ${(props) => props.theme.palette.secondary};
    text-decoration: none;
    //cursor: crosshair;
    &.see_previous {
      &:hover {
        text-decoration: underline;
      }
      font-weight: bold;
    }
  }
`;

const Avatar = styled.div`
  -webkit-box-flex: 0;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
  align-self: center;
  img {
    width: 50px;
    height: 50px;
    text-align: center;
    border-radius: 50%;
    border: 3px solid white;
  }
`;

//@ts-ignore
const Card = styled.div<
  { padding?: boolean; theme: ThemeProps } & TransitionProps
>`
  margin-bottom: 17px;
  background-color: #fff;
  border-radius: 3px;
  font-size: 14px;
  line-height: 1.4;
  color: #000;
  overflow: hidden;
  position: relative;
  //-webkit-box-shadow: 0 4px 15px 0 rgba(0,0,0,.1), 0 1px 2px 0 rgba(0,0,0,.1), inset 0 2px 0 0 rgba(48, 71, 236, 0.5);
  box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.1);
    inset 0 2px 0 0
      ${(props) => {
        lighten(0.1, props.theme.palette.secondary);
      }};

  margin: 1em;
  ${(props) => (props.padding ? 'padding: 2em;' : '')}

`;

const ConversationInitiator = styled(Card)`
  //margin-top: 10em;
  padding: 0;
  h2 {
    font-size: 1.2em;
    font-weight: 500;
    //margin: .4em 0 0.4em 0em;
  }
`;

const CardPadder = styled.div`
  ${() => tw`space-y-2 p-5`}
`;

const CardFooterLinks = styled.div`
  ${() => tw`px-4 py-2`}
  button {
    ${() => tw`text-xs font-medium`}
  }
`;

const ConversationsBlock = styled(Card)`
  margin-top: 10em;
  padding: 0px;
  h2 {
    margin: 0.4em 0 0.4em 0em;
  }
`;

const CardContent = styled.div``;

const ConnectedPeople = styled.div`
  display: flex;
  div {
    margin-right: -10px;
  }
`;

export default HomePanel;
