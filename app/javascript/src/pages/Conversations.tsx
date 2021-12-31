import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';

import { connect } from 'react-redux';
import { isEmpty } from 'lodash';

import FilterMenu from '@chaskiq/components/src/components/FilterMenu';
import Progress from '@chaskiq/components/src/components/Progress';
import EmptyView from '@chaskiq/components/src/components/EmptyView';
import Button from '@chaskiq/components/src/components/Button';

import ConversationSearch from './conversations/Search';
import ConversationItemList from './conversations/ItemList';
import AssignmentRules from './conversations/AssignmentRules';
import Conversation from './conversations/Conversation';
import ConversationSidebar from './conversations/Sidebar';
import AccessDenied from '@chaskiq/components/src/components/AccessDenied';

import emptyImage from '../images/empty-icon8.png';
import I18n from '../shared/FakeI18n';

import {
  getConversations,
  updateConversationsData,
  clearConversations,
} from '@chaskiq/store/src/actions/conversations';

import {
  setCurrentSection,
  setCurrentPage,
} from '@chaskiq/store/src/actions/navigation';

function Conversations({
  dispatch,
  conversations,
  conversation,
  app,
  events,
  app_user,
}) {
  const [fetching, setFetching] = React.useState(false);
  const [fixedSidebarOpen, setFixedSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    dispatch(clearConversations([]));
    setFetching(true);
    fetchConversations({ page: 1 }, () => {
      setFetching(false);
    });

    dispatch(setCurrentPage('Conversations'));
    dispatch(setCurrentSection('Conversations'));
  }, []);

  const fetchConversations = (options, cb = null) => {
    dispatch(
      getConversations(options, () => {
        cb && cb();
      })
    );
  };

  const handleScroll = (e) => {
    const element = e.target;
    const scrollDiff = Math.round(element.scrollHeight - element.scrollTop);
    if (scrollDiff === element.clientHeight) {
      if (conversations.meta.next_page && !fetching) {
        setFetching(true);
        fetchConversations(
          {
            page: conversations.meta.next_page,
          },
          () => {
            setFetching(false);
          }
        );
      }
    }
  };

  const filterButton = (handleClick) => {
    return (
      <Button
        aria-label="More"
        aria-controls="long-menu"
        aria-haspopup="true"
        variant={'outlined'}
        onClick={handleClick}
        size="small"
      >
        {/* <MoreVertIcon /> */}
        {I18n.t('conversations.states.' + conversations.filter)}
      </Button>
    );
  };

  const sortButton = (handleClick) => {
    return (
      <Button
        aria-label="More"
        aria-controls="long-menu"
        aria-haspopup="true"
        variant={'outlined'}
        onClick={handleClick}
        size="small"
      >
        {/* <MoreVertIcon /> */}
        {I18n.t('conversations.sorts.' + conversations.sort)}
      </Button>
    );
  };

  const filterConversations = (options, cb) => {
    dispatch(
      updateConversationsData(
        {
          filter: options.id,
          collection: [],
        },
        () => {
          fetchConversations({ page: 1 }, cb);
          // getConversations({page: 1}, cb)
        }
      )
    );
  };

  const sortConversations = (options, _cb) => {
    dispatch(
      updateConversationsData(
        {
          sort: options.id,
          collection: [],
        },
        () => {
          fetchConversations({ page: 1 });
          // getConversations({page: 1}, cb)
        }
      )
    );
  };

  /*const clearSearchTerm = () => {
    dispatch(
      updateConversationsData({
        term: null
      }, () => {
        fetchConversations({ page: 1 })
      })
    )
  }*/

  const renderConversations = () => {
    const filters = [
      {
        id: 'opened',
        name: I18n.t('conversations.states.opened'),
        count: 1,
        icon: null,
      },
      {
        id: 'closed',
        name: I18n.t('conversations.states.closed'),
        count: 2,
        icon: null,
      },
    ];

    const sorts = [
      {
        id: 'newest',
        name: I18n.t('conversations.sorts.newest'),
        count: 1,
        selected: true,
      },
      {
        id: 'oldest',
        name: I18n.t('conversations.sorts.oldest'),
        count: 1,
      },
      {
        id: 'waiting',
        name: I18n.t('conversations.sorts.waiting'),
        count: 1,
      },
      {
        id: 'priority_first',
        name: I18n.t('conversations.sorts.priority_first'),
        count: 1,
      },
      {
        id: 'unfiltered',
        name: I18n.t('conversations.sorts.all'),
        count: 1,
      },
    ];

    return (
      <React.Fragment>
        <div className="items-center bg-white dark:bg-gray-800 px-3 py-4 border-b border-gray-200 dark:border-gray-700 sm:px-3 flex justify-between">
          <FilterMenu
            options={filters}
            value={conversations.filter}
            filterHandler={filterConversations}
            triggerButton={filterButton}
          />

          <ConversationSearch />

          {/*
            conversations.term &&
            <span className="ml-3 text-sm leading-5 text-gray-700 flex items-center">
              {conversations.term}
              <button className="focus:outline-none" onClick={ clearSearchTerm }>
                <svg className="w-5 h-5 text-indigo-400 hover:text-indigo-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </span>
          */}

          <FilterMenu
            options={sorts}
            position={'right'}
            value={conversations.sort}
            filterHandler={sortConversations}
            triggerButton={sortButton}
          />
        </div>

        <div
          className="overflow-scroll"
          onScroll={handleScroll}
          style={{ height: 'calc(100vh - 60px)' }}
        >
          {conversations.collection.map((o) => {
            const user = o.mainParticipant;
            return (
              <ConversationItemList key={o.key} app={app} conversation={o} />
            );
          })}

          {conversations.meta.total_pages === 0 && (
            <EmptyView
              title={I18n.t('conversations.empty.title')}
              shadowless
              h2Classes={`text-2xl tracking-tight
              font-extrabold text-gray-900 sm:text-3xl
              sm:leading-none md:text-2xl`}
            />
          )}

          {(fetching || conversations.loading) && (
            <div className="m-2">
              <Progress size={conversations.collection.length === 0 ? 16 : 4} />
            </div>
          )}
        </div>
      </React.Fragment>
    );
  };

  const toggleFixedSidebar = () => {
    setFixedSidebarOpen(!fixedSidebarOpen);
  };

  return (
    <div className="flex">
      <Switch>
        <Route exact path={`/apps/${app.key}/conversations`}>
          <div className={'w-full md:w-1/4 h-screen md:border-r sm:hidden'}>
            {renderConversations()}
          </div>
        </Route>
      </Switch>

      <div
        className={
          'w-full md:w-4/12 h-screen md:border-r hidden sm:block border-gray-200 dark:border-gray-800'
        }
      >
        {renderConversations()}
      </div>

      <Switch>
        <Route exact path={`/apps/${app.key}/conversations`}>
          <div className="hidden sm:block flex-grow bg-gray-50 dark:bg-gray-800 h-screen border-r-0 w-1/12">
            <EmptyView
              title={I18n.t('conversations.empty.title')}
              shadowless
              image={
                <img
                  src={emptyImage}
                  className="h-56 w-56"
                  alt={I18n.t('conversations.empty.title')}
                />
              }
              subtitle={I18n.t('conversations.empty.text')}
            />
          </div>
        </Route>

        <Route exact path={`/apps/${app.key}/conversations/assignment_rules`}>
          <div className="flex-grow bg-gray-50 dark:bg-gray-800 h-screen border-r w-1/12 dark:border-black">
            <AccessDenied section="assign_rules">
              <AssignmentRules />
            </AccessDenied>
          </div>
        </Route>

        <Route exact path={`/apps/${app.key}/conversations/:id`}>
          <div
            className={`${
              fixedSidebarOpen ? 'md:w-5/12' : 'md:w-0 md:flex-grow'
            } w-full bg-gray-200 dark:bg-gray-900 h-screen border-r dark:border-black`}
          >
            <Conversation
              events={events}
              fixedSidebarOpen={fixedSidebarOpen}
              toggleFixedSidebar={toggleFixedSidebar}
            />
          </div>
        </Route>
      </Switch>

      {!isEmpty(conversation) && fixedSidebarOpen && (
        <div className="bg-gray-100 dark:bg-gray-800 h-screen overflow-scroll fixed sm:relative right-0 sm:block sm:w-4/12 ">
          {app_user && app_user.id ? (
            <ConversationSidebar toggleFixedSidebar={toggleFixedSidebar} />
          ) : (
            <Progress />
          )}
        </div>
      )}
    </div>
  );
}

function mapStateToProps(state) {
  const { auth, app, conversations, conversation, app_user } = state;
  const { isAuthenticated } = auth;
  // const { sort, filter, collection , meta, loading} = conversations

  return {
    conversations,
    conversation,
    app_user,
    app,
    isAuthenticated,
  };
}

export default withRouter(connect(mapStateToProps)(Conversations));
