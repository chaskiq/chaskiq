import React from 'react';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import { readableColor } from 'polished';
import sanitizeHtml, {
  escapeHTML,
} from '@chaskiq/components/src/utils/htmlSanitize';
import { LabelIcon } from '@chaskiq/components/src/components/icons';
import Avatar from '@chaskiq/components/src/components/Avatar';

export function textColor(color) {
  const lightReturnColor = '#121212';
  const darkReturnColor = '#f3f3f3';
  return readableColor(color, lightReturnColor, darkReturnColor);
}

export default function ConversationItemList({ app, conversation }) {
  const renderConversationContent = (o) => {
    const message = o.lastMessage.message;
    if (message.htmlContent) {
      return sanitizeHtml(escapeHTML(message.htmlContent)).substring(0, 250);
    }
  };

  const user = conversation.mainParticipant;
  const message = conversation.lastMessage;
  const participant = conversation.mainParticipant;
  const appUser = message.appUser;
  const tags = conversation.tagList;

  function tagColor(tag) {
    const defaultColor = {
      bgColor: '#fed7d7',
      color: textColor('#fed7d7'),
    };

    if (!app.tagList) return defaultColor;

    const findedTag = app.tagList.find((o) => o.name === tag);

    if (!findedTag) return defaultColor;

    let newColor = findedTag.color || '#444';
    newColor = `#${newColor.replace('#', '')}`;

    return {
      bgColor: newColor,
      color: textColor(newColor),
    };
  }

  function renderTag(tag) {
    const color = tagColor(tag);
    return (
      <span
        key={`conversation-${conversation.key}-tag-${tag}`}
        style={{
          backgroundColor: color.bgColor,
          color: color.color,
        }}
        className="mr-0.5 inline-flex items-center px-2.5 py-0.5
        rounded-full text-xs font-light
        bg-gray-100 text-blue-800
        capitalize"
      >
        #{tag}
      </span>
    );
  }

  function stateClass() {
    return conversation.state == 'opened'
      ? 'bg-red-200 dark:bg-red-600'
      : 'bg-green-600';
  }

  return (
    <Link
      to={`/apps/${app.key}/conversations/${conversation.key}`}
      className="flex justify-between hover:bg-gray-50 dark:hover:bg-gray-900 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 transition duration-150 ease-in-out"
      data-cy={`conversation-item`}
    >
      <div className={`block w-2 ${stateClass()}`}></div>
      <div className="w-full px-4 py-4 whitespace-nowrap border-b border-gray-200 dark:border-gray-800 dark:hover:bg-gray-800">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <Avatar src={user.avatarUrl} alt={user.displayName} size="full" />
          </div>

          <div className="ml-4 truncate w-full">
            <div className="flex justify-between">
              <span className="text-md leading-5 font-semibold text-gray-800 dark:text-gray-100 truncate mr-2">
                {user.displayName}
              </span>

              <span className="text-xs leading-5 font-light text-gray-300 dark:text-gray-300">
                <Moment fromNow ago>
                  {message.createdAt}
                </Moment>
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col mt-5 space-y-2">
          <div className="space-x-2 text-sm leading-5 text-gray-500 dark:text-gray-100 flex pb-2 pt-1">
            {appUser && appUser.id !== participant.id && (
              <img
                alt={appUser.displayName}
                className="rounded-full h-5 w-5 self-start"
                src={appUser.avatarUrl}
              />
            )}

            {message.privateNote && (
              <span>
                <LabelIcon />
              </span>
            )}

            <span
              className="truncate"
              dangerouslySetInnerHTML={{
                __html: renderConversationContent(conversation),
              }}
            />
          </div>

          <div className="flex justify-between">
            <div className="flex">
              {conversation.conversationChannels &&
                conversation.conversationChannels.map((o) => (
                  <div
                    key={`${conversation.key}-${o}`}
                    className="mr-0.5 border inline-flex items-center px-2.5 py-0.5 
                    rounded-full text-xs font-medium bg-gray-100 
                    text-blue-800 capitalize dark:bg-gray-900 dark:text-gray-100"
                  >
                    {o}
                  </div>
                ))}
            </div>

            {tags && tags.length > 0 && (
              <div className="flex overflow-auto ml-4 mr-1">
                {tags.map((o) => renderTag(o))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
