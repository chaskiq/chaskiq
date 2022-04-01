import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import graphql from '@chaskiq/store/src/graphql/client';
import I18n from '../shared/FakeI18n';

import Tabs from '@chaskiq/components/src/components/Tabs';
import Button from '@chaskiq/components/src/components/Button';
import Avatar from '@chaskiq/components/src/components/Avatar';
import FilterMenu from '@chaskiq/components/src/components/FilterMenu';
import { EditIcon, MoreIcon } from '@chaskiq/components/src/components/icons';
import {
  directUpload,
  getFileMetadata,
} from '@chaskiq/components/src/components/fileUploader';

import {
  successMessage,
  errorMessage,
} from '@chaskiq/store/src/actions/status_messages';

import UserListItem from './conversations/ItemList';
import SettingsForm from '../pages/settings/form';

import {
  CREATE_DIRECT_UPLOAD,
  START_CONVERSATION,
  APP_USER_UPDATE_STATE,
  UPDATE_AGENT,
} from '@chaskiq/store/src/graphql/mutations';

import {
  APP_USER_CONVERSATIONS,
  AGENT,
} from '@chaskiq/store/src/graphql/queries';

type ProfilePageProps = {
  match: any;
  app: any;
  agent: any;
  history: any;
  dispatch: any;
};
type ProfilePageState = {
  collection: any;
  meta: any;
  startConversationModal: boolean;
  agent: any;
  editName: boolean;
  tabValue: number;
};
class ProfilePage extends Component<ProfilePageProps, ProfilePageState> {
  state = {
    collection: [],
    meta: {},
    startConversationModal: false,
    agent: null,
    editName: false,
    tabValue: 0,
  };

  componentDidMount() {
    this.getAgent();
  }

  getAgent = () => {
    graphql(
      AGENT,
      {
        appKey: this.props.app.key,
        id: parseInt(this.props.match.params.id),
        page: 1,
        per: 20,
      },
      {
        success: (data) => {
          this.setState({ agent: data.app.agent });
        },
        error: () => {},
      }
    );
  };

  fetchUserConversations = () => {
    graphql(
      APP_USER_CONVERSATIONS,
      {
        appKey: this.props.app.key,
        id: this.state.agent.id,
        page: 1,
        per: 20,
      },
      {
        success: (data) => {
          const { collection } = data.app.appUser.conversations;
          this.setState({ collection: collection });
        },
        error: () => {},
      }
    );
  };

  openStartConversationModal = () => {
    this.setState({ startConversationModal: true });
  };

  updateState = (option) => {
    graphql(
      APP_USER_UPDATE_STATE,
      {
        appKey: this.props.app.key,
        id: this.state.agent.id,
        state: option.id,
      },
      {
        success: () => {
          this.props.dispatch(
            successMessage(I18n.t('status_messages.updated_success'))
          );
          this.getAgent();
          // this.props.dispatch(this.getAgent());
          // data.appUserUpdateData.appUser
        },
        error: () => {},
      }
    );
  };

  toggleNameEdit = () => {
    this.setState({ editName: !this.state.editName });
  };

  handleData = (option) => {
    graphql(
      UPDATE_AGENT,
      {
        appKey: this.props.app.key,
        email: this.state.agent.email,
        params: option.app,
      },
      {
        success: (data) => {
          // const id = data.updateAgentRole.agent.agentId;
          // this.props.dispatch(getAppUser(parseInt(id)));
          // data.appUserUpdateData.appUser
          this.props.dispatch(
            successMessage(I18n.t('status_messages.updated_success'))
          );
          this.setState({ editName: false });
          this.getAgent();
        },
        error: (data) => {
          this.props.dispatch(
            errorMessage(I18n.t('status_messages.updated_error'))
          );
        },
      }
    );
  };

  updateAgentLogo = (signedBlobId) => {
    graphql(
      UPDATE_AGENT,
      {
        appKey: this.props.app.key,
        email: this.state.agent.email,
        params: {
          avatar: signedBlobId,
        },
      },
      {
        success: () => {
          this.setState({ editName: false });
          this.getAgent();
        },
        error: () => {
          this.props.dispatch(
            errorMessage(I18n.t('status_messages.updated_error'))
          );
        },
      }
    );
  };

  uploadHandler = (file, kind = null) => {
    getFileMetadata(file).then((input) => {
      graphql(CREATE_DIRECT_UPLOAD, input, {
        success: (data) => {
          const {
            signedBlobId,
            headers,
            url,
            _serviceUrl,
          } = data.createDirectUpload.directUpload;

          directUpload(url, JSON.parse(headers), file).then(() => {
            const params = {};
            params[kind] = signedBlobId;

            this.updateAgentLogo(signedBlobId);
          });
        },
        error: (error) => {
          this.props.dispatch(
            errorMessage(I18n.t('status_messages.updated_error'))
          );
          console.log('error on signing blob', error);
        },
      });
    });
  };

  optionsForFilter = () => {
    const options = [
      {
        title: 'Archive',
        description: 'Archive this person and their conversation history',
        // icon: <ArchiveIcon/>,
        id: 'archive',
        state: 'archived',
      },
      {
        title: 'Block',
        description: 'Blocks them so you won’t get their replies',
        // icon: <BlockIcon/>,
        id: 'block',
        state: 'blocked',
      },

      {
        title: 'Unsubscribe',
        description: 'Removes them from your email list',
        // icon: <UnsubscribeIcon/>,
        id: 'unsubscribe',
        state: 'unsubscribed',
      },
    ];

    return options;
  };

  toggleButton = (clickHandler) => {
    return (
      <div>
        <button
          onClick={clickHandler}
          className="text-xs leading-4 font-medium text-gray-100
          group-hover:text-gray-300 group-focus:underline transition
          ease-in-out duration-150"
        >
          <MoreIcon />
        </button>
      </div>
    );
  };

  nameEditor = () => {
    return (
      <h5 className="text-2xl font-bold text-gray-900 truncate">
        {this.state.agent.name || I18n.t('profile.no_name')}
        <Button variant="icon" onClick={this.toggleNameEdit} color={'inherit'}>
          <EditIcon />
        </Button>
      </h5>
    );
  };

  handleTabChange = (e, i) => {
    this.setState({ tabValue: i });
  };

  agentProperties = () => {
    return [
      { name: I18n.t('profile.name'), value: this.state.agent['name'] },

      //{ name: 'lang', value: this.state.agent['lang'] },
      {
        name: I18n.t('profile.area_of_expertise'),
        value: this.state.agent['areaOfExpertise'],
      },
      {
        name: I18n.t('profile.specialization'),
        value: this.state.agent['specialization'],
      },
      {
        name: I18n.t('profile.phone_number'),
        value: this.state.agent['phoneNumber'],
      },
      { name: I18n.t('profile.address'), value: this.state.agent['address'] },
      {
        name: I18n.t('profile.availability'),
        value: this.state.agent['availability'],
        span: '2',
      },
    ];
  };

  definitionsForSettings = () => {
    return [
      {
        name: 'name',
        type: 'string',
        label: I18n.t('profile.name'),
        grid: { xs: 'w-full', sm: 'w-1/2' },
      },
      {
        name: 'area_of_expertise',
        type: 'string',
        label: I18n.t('profile.area_of_expertise'),
        grid: { xs: 'w-full', sm: 'w-1/2' },
      },
      {
        name: 'specialization',
        type: 'string',
        label: I18n.t('profile.specialization'),
        grid: { xs: 'w-full', sm: 'w-1/2' },
      },
      {
        name: 'phone_number',
        type: 'string',
        label: I18n.t('profile.phone_number'),
        grid: { xs: 'w-full', sm: 'w-1/2' },
      },
      {
        name: 'address',
        type: 'string',
        label: I18n.t('profile.address'),
        grid: { xs: 'w-full', sm: 'w-1/2' },
      },
      {
        name: 'availability',
        type: 'textarea',
        label: I18n.t('profile.availability'),
        grid: { xs: 'w-full', sm: 'w-full' },
      },
    ];
  };

  render() {
    return (
      <div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none xl:order-last">
          <nav
            className="flex items-start px-4 py-3 sm:px-6 lg:px-8 xl:hidden"
            aria-label="Breadcrumb"
          >
            <Link
              to={`/apps/${this.props.app.key}`}
              className="inline-flex items-center space-x-3 text-sm font-medium text-gray-900"
            >
              <svg
                className="-ml-2 h-5 w-5 text-gray-400"
                x-description="Heroicon name: solid/chevron-left"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span>back</span>
            </Link>
          </nav>

          <article>
            <div>
              <div className="h-24 w-full object-cover lg:h-24">
                {/*<img
                  className="h-32 w-full object-cover lg:h-48"
                  src="https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&amp;ixlib=rb-1.2.1&amp;auto=format&amp;fit=crop&amp;w=1950&amp;q=80"
                  alt=""
                />*/}
              </div>

              {this.state.agent && (
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
                    <div className="flex flex-col">
                      {this.state.agent.avatarUrl && (
                        <Avatar
                          size={24}
                          src={this.state.agent.avatarUrl + '&s=120px'}
                        />
                      )}
                      <div>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          // className={classes.input}
                          id={'avatarUpload'}
                          onChange={(e) =>
                            this.uploadHandler(e.currentTarget.files[0])
                          }
                          // multiple
                          type="file"
                        />
                        <label
                          htmlFor={'avatarUpload'}
                          className="hover:cursor-pointer text-sm leading-5 text-gray-500"
                        >
                          Upload avatar
                        </label>
                      </div>
                    </div>
                    <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                      <div className="sm:hidden 2xl:block mt-6 min-w-0 flex-1">
                        {this.nameEditor()}
                      </div>
                      <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                        {this.state.agent && (
                          <div className="controls text-gray-900">
                            <FilterMenu
                              options={this.optionsForFilter()}
                              value={this.state.agent.state}
                              filterHandler={(e) => this.updateState(e.state)}
                              triggerButton={this.toggleButton}
                              position={'right'}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block 2xl:hidden mt-6 min-w-0 flex-1">
                    {/*<h1 className="text-2xl font-bold text-gray-900 truncate">
                      xx
                      </h1>*/}

                    {this.nameEditor()}
                  </div>
                </div>
              )}
            </div>

            <Tabs
              scrollableClasses="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
              currentTab={this.state.tabValue}
              onChange={this.handleTabChange}
              textColor="inherit"
              tabs={[
                {
                  label: 'Profile Details',
                  content: (
                    <div className="mt-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                      {this.state.editName && this.state.agent && (
                        <SettingsForm
                          data={this.state.agent}
                          //classes={this.props.classes}
                          update={this.handleData}
                          definitions={this.definitionsForSettings}
                        />
                      )}

                      {!this.state.editName && (
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 mb-8">
                          {this.state.agent &&
                            this.agentProperties().map((o) => (
                              <div className={`sm:col-span-${o.span || '1'}`}>
                                <dt className="text-sm font-medium text-gray-500">
                                  {o.name}
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {o.value}
                                </dd>
                              </div>
                            ))}
                        </dl>
                      )}
                    </div>
                  ),
                },
                {
                  label: 'Conversations',
                  content: (
                    <div className="mt-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex">
                        <div className="w-full">
                          <div className="m-1">
                            <h5>Conversations</h5>
                          </div>

                          <div>
                            {this.state.agent &&
                              this.state.agent.conversations &&
                              this.state.agent.conversations.collection.map(
                                (o) => {
                                  return (
                                    <div
                                      key={o.id}
                                      onClick={(_e) =>
                                        this.props.history.push(
                                          `/apps/${this.props.app.key}/conversations/${o.key}`
                                        )
                                      }
                                    >
                                      <UserListItem
                                        app={this.props.app}
                                        conversation={o}
                                      />
                                    </div>
                                  );
                                }
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </article>
        </main>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { app_user, app } = state;
  return {
    app_user,
    app,
  };
}

// export default ShowAppContainer

export default withRouter(connect(mapStateToProps)(ProfilePage));
