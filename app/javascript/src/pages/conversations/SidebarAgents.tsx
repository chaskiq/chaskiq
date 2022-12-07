import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Avatar from '@chaskiq/components/src/components/Avatar';
import Tooltip from 'rc-tooltip';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import LayoutDefinitions from '../../layout/layoutDefinitions';
import {
  DownArrow,
  FolderIcon,
  IntegrationsIcon,
  LabelIcon,
  UpArrow,
} from '@chaskiq/components/src/components/icons';
import I18n from '../../shared/FakeI18n';

import graphql from '@chaskiq/store/src/graphql/client';

import {
  getConversations,
  updateConversationsData,
  clearConversations,
} from '@chaskiq/store/src/actions/conversations';

import { CONVERSATIONS_COUNTS } from '@chaskiq/store/src/graphql/queries';
import { SORT_AGENTS } from '@chaskiq/store/src/graphql/mutations';
import { allowedAccessTo } from '@chaskiq/components/src/components/AccessDenied';
import { successMessage } from '@chaskiq/store/src/actions/status_messages';
import { getApp } from '@chaskiq/store/src/actions/app';

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  background: isDragging ? 'lightgreen' : 'transparent',
  // styles we need to apply on draggables
  ...draggableStyle,
});

function SidebarAgents({ app, dispatch, conversations, current_user }) {
  const [counts, setCounts] = useState(null);
  const [agents, setAgents] = useState([]);
  const [tagCounts, setTagCounts] = useState(null);
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [conversationsChannelsCounts, setConversationsChannelsCounts] =
    useState(null);

  useEffect(() => {
    getCounts();
  }, []);

  function getCounts() {
    graphql(
      CONVERSATIONS_COUNTS,
      { appKey: app.key },
      {
        success: (data) => {
          setCounts(data.app.conversationsCounts);
          setTagCounts(data.app.conversationsTagCounts);
          setAndReorderAgents(
            data.app.agents.filter((o) => o.id !== current_user.id)
          );
          setConversationsChannelsCounts(data.app.conversationsChannelsCounts);
        },
        error: () => {},
      }
    );
  }

  function setAndReorderAgents(agents) {
    if (!app.sortedAgents) return setAgents(agents);
    const itemOrder = app.sortedAgents.reverse();
    const sortedAgents = mapOrder(agents, itemOrder, 'id');
    setAgents(sortedAgents);
  }

  function findAgent(o) {
    const agent = agents.find((a) => a.id === o);
    if (agent) return agent;
    return null;
  }

  function fetchConversations(options, cb?: () => void) {
    dispatch(
      getConversations(options, () => {
        cb && cb();
      })
    );
  }

  function filterAgent(option) {
    const agentID = option ? option.id : '0';
    dispatch(clearConversations([]));
    dispatch(
      updateConversationsData(
        {
          agentId: agentID,
          sort: 'unfiltered',
        },
        () => {
          fetchConversations({
            page: 1,
            agentId: agentID,
            sort: 'unfiltered',
            filter: 'opened',
            tag: null,
            channelId: null,
          });
        }
      )
    );
  }

  function filterChannel(option) {
    dispatch(clearConversations([]));
    dispatch(
      updateConversationsData(
        {
          channelId: option,
          sort: 'unfiltered',
        },
        () => {
          fetchConversations({
            page: 1,
            channelId: option,
            sort: 'unfiltered',
            filter: 'opened',
            tag: null,
          });
        }
      )
    );
  }

  function handleTagFilter(tag) {
    dispatch(clearConversations([]));
    dispatch(
      updateConversationsData(
        {
          tag: tag,
          sort: 'unfiltered',
        },
        () => {
          fetchConversations({
            page: 1,
            tag: tag,
            sort: 'unfiltered',
            filter: 'opened',
            channelId: null,
          });
        }
      )
    );
  }

  function tagColor(tag) {
    if (!app.tagList) return '#ccc';
    const findedTag = app.tagList.find((o) => o.name === tag);
    if (!findedTag) return '#ccc';
    return findedTag.color;
  }

  const mapOrder = (array, order, key) => {
    array.sort(function (a, b) {
      const A = a[key],
        B = b[key];
      if (
        order.indexOf(A) < order.indexOf(B) ||
        order.indexOf(A) === -1 ||
        order.indexOf(B) === -1
      ) {
        return 1;
      } else {
        return -1;
      }
    });
    return array;
  };

  // a little function to help us with reordering the result
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const newPaths = reorder(
      agents,
      result.source.index,
      result.destination.index
    );

    console.log(
      'PATHS',
      newPaths,
      result.source.index,
      result.destination.index
    );

    graphql(
      SORT_AGENTS,
      { appKey: app.key, list: newPaths.map((o) => o.id) },
      {
        success: (data) => {
          const newObject = Object.assign({}, app, {
            sortedAgents: data.sortAgents.list,
          });

          dispatch(getApp(newObject));

          dispatch(successMessage(I18n.t('status_messages.reordered_success')));
        },
        error: (a) => {
          console.log('errr');
        },
      }
    );

    setAgents(newPaths);
  };

  function isSortDisabled() {
    if (!expandedFilters) return true;
    if (!allowedAccessTo(app, 'conversation_customizations', 'manage'))
      return true;
  }

  const middleIndex = 4;
  const list1 = agents.slice(0, middleIndex);
  const list2 = agents.slice(middleIndex);
  const sortDisabled = isSortDisabled();

  return (
    <div>
      <div className="mt-4 flex items-center flex-shrink-0 px-4 text-md leading-6 font-bold text-gray-900 dark:text-gray-100">
        <h3 className="font-bold">
          {I18n.t('conversations.menu.conversations')}
        </h3>
      </div>

      {counts && [
        <ListItem
          agent={null}
          key="all-conversations-items"
          count={counts['all'] || '0'}
          active={false}
          filterHandler={filterAgent}
          label={I18n.t('conversations.menu.all')}
        />,
        <ListItem
          key={'unnasigned'}
          agent={null}
          count={counts[''] || '0'}
          active={false}
          filterHandler={filterAgent}
          label={I18n.t(`conversations.menu.unassigned`)}
        />,
        <ListItem
          key={'assigned_to_me'}
          agent={current_user}
          count={counts[current_user?.id] || '0'}
          active={current_user.id == counts[current_user?.id]}
          icon={null}
          filterHandler={filterAgent}
          label={I18n.t(`conversations.menu.assigned_to_me`)}
        />,
      ]}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppablePaths">
          {(provided, snapshot) => (
            <div>
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                //style={getPathStyle(snapshot.isDraggingOver)}
              >
                {counts &&
                  agents &&
                  list1.map((o, i) => {
                    return (
                      <Draggable
                        key={`path-list-${o.id}-${i}`}
                        draggableId={`list-1-${o.id}`}
                        index={i}
                        isDragDisabled={sortDisabled}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}
                          >
                            <ListItem
                              key={`agent-list-${i}`}
                              agent={o}
                              count={counts[o.id] || '0'}
                              active={conversations.agentId === o.id}
                              filterHandler={filterAgent}
                              label={
                                o === 'all'
                                  ? I18n.t('conversations.menu.all')
                                  : null
                              }
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                {provided.placeholder}

                {counts && agents && list2 && list2.length > 0 && (
                  <ListItem
                    key={`conversation-filters-collapse`}
                    label={expandedFilters ? 'Less' : 'More'}
                    count={null}
                    active={false}
                    filterHandler={() => setExpandedFilters(!expandedFilters)}
                    icon={
                      expandedFilters ? (
                        <UpArrow className="-ml-1 mr-3" />
                      ) : (
                        <DownArrow className="-ml-1 mr-3" />
                      )
                    }
                  />
                )}

                <div className={`${expandedFilters ? 'block' : 'hidden'}`}>
                  {counts &&
                    agents &&
                    list2.map((o, index) => {
                      const i = index + list1.length;
                      return (
                        <Draggable
                          key={`path-list-2-${o.id}-${i}`}
                          draggableId={o.id}
                          index={i}
                          isDragDisabled={sortDisabled}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                            >
                              <ListItem
                                key={`agent-list-2-${i}`}
                                agent={o}
                                count={counts[o.id] || '0'}
                                active={conversations.agentId === o.id}
                                filterHandler={filterAgent}
                                label={
                                  o === 'all'
                                    ? I18n.t('conversations.menu.all')
                                    : null
                                }
                              />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="mt-4 flex items-center flex-shrink-0 px-4 text-md leading-6 font-bold text-gray-900 dark:text-gray-100">
        <h3 className="font-bold">
          Channels
          {/*I18n.t('conversations.menu.conversations')*/}
        </h3>
      </div>

      {counts &&
        conversationsChannelsCounts &&
        Object.keys(conversationsChannelsCounts).map((o, i) => (
          <ListItem
            key={`conversation-channel-count-list-${i}`}
            agent={findAgent(o)}
            count={conversationsChannelsCounts[o]}
            active={conversations.channelId === o}
            filterHandler={filterChannel}
            label={o}
            icon={<IntegrationsIcon className="-ml-1 mr-3" />}
          />
        ))}

      {tagCounts && (
        <div
          className="mt-4 flex items-center flex-shrink-0 px-4
            text-md leading-6 font-bold text-gray-900 dark:text-gray-200"
        >
          <h3 className="font-bold">{I18n.t('conversations.menu.tags')}</h3>
        </div>
      )}

      {tagCounts &&
        tagCounts.map((o) => (
          <ListItem
            key={`sidebar-agent-tag-${o.tag}`}
            label={o.tag}
            count={o.count}
            active={conversations.tag === o.tag}
            filterHandler={handleTagFilter}
            icon={
              <LabelIcon
                className="-ml-1 mr-3"
                style={{ color: tagColor(o.tag) }}
              />
            }
          />
        ))}
    </div>
  );
}

type AgentLitItemType = {
  agent?: any;
  count: number;
  label: string;
  filterHandler: (option: any) => void;
  icon?: React.ReactElement;
  active: boolean;
};

function ListItem({
  agent,
  count,
  label,
  filterHandler,
  icon,
  active,
}: AgentLitItemType) {
  function toggleFilter() {
    let option = null;
    if (agent) {
      option = active ? null : agent;
    }
    if (label && !agent) {
      option = active ? null : label;
    }
    filterHandler(option);
  }

  const layout = LayoutDefinitions();

  return (
    <a
      href="#"
      onClick={toggleFilter}
      className={`
      ${layout.mainSidebar.buttons.defaultClass}
      ${active ? layout.mainSidebar.buttons.activeClass : ''}`}
    >
      {!agent && icon}

      {agent && icon}

      {!agent && !icon && <FolderIcon className="-ml-1 mr-3" />}

      {agent && !icon && (
        <div className="flex-shrink-0 -ml-1 mr-3 h-6 w-6 text-gray-400 group-focus:text-gray-500 transition ease-in-out duration-150">
          <Avatar size={6} src={agent.avatarUrl} />
        </div>
      )}

      {agent && !label && (
        <Tooltip placement="bottom" overlay={agent.name || agent.email}>
          <span className="truncate">{agent.name || agent.email}</span>
        </Tooltip>
      )}

      {label && (
        <Tooltip placement="bottom" overlay={label}>
          <span className="truncate">{label}</span>
        </Tooltip>
      )}

      {count && (
        <span
          className="ml-auto inline-block py-0.5 px-3 text-xs 
          leading-4 rounded-full
          text-gray-600 bg-gray-200 group-hover:bg-gray-200 
          dark:text-gray-100 dark:bg-gray-800 dark:group-hover:bg-gray-800 
          group-focus:bg-gray-300 transition ease-in-out duration-150"
        >
          {count}
        </span>
      )}
    </a>
  );
}

function mapStateToProps(state) {
  const { app, conversations, current_user } = state;
  return {
    conversations,
    app,
    current_user,
  };
}

export default withRouter(connect(mapStateToProps)(SidebarAgents));
