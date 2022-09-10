import React, { useState, useEffect, useRef } from 'react';

import Tooltip from 'rc-tooltip';
import { isEmpty } from 'lodash';
import I18n from '../shared/FakeI18n';

import Hints from '@chaskiq/components/src/components/Hints';
import Progress from '@chaskiq/components/src/components/Progress';
import Content from '@chaskiq/components/src/components/Content';
import FormDialog from '@chaskiq/components/src/components/FormDialog';
import DeleteDialog from '@chaskiq/components/src/components/DeleteDialog';
import Tabs from '@chaskiq/components/src/components/Tabs';
import PageHeader from '@chaskiq/components/src/components/PageHeader';
import Button from '@chaskiq/components/src/components/Button';
import Badge from '@chaskiq/components/src/components/Badge';
import FieldRenderer from '@chaskiq/components/src/components/forms/FieldRenderer';
import Avatar from '@chaskiq/components/src/components/Avatar';
import List, {
  ListItem,
  ListItemText,
  ItemListPrimaryContent,
  ItemListSecondaryContent,
  ItemAvatar,
} from '@chaskiq/components/src/components/List';
import {
  EditIcon,
  AddIcon,
  DeleteIcon,
} from '@chaskiq/components/src/components/icons';

import logos from '../shared/logos';

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import serialize from 'form-serialize';

import graphql from '@chaskiq/store/src/graphql/client';

import { camelizeKeys } from '@chaskiq/store/src/actions/conversation';

import {
  errorMessage,
  successMessage,
} from '@chaskiq/store/src/actions/status_messages';

import {
  setCurrentSection,
  setCurrentPage,
} from '@chaskiq/store/src/actions/navigation';

import {
  APP_PACKAGES,
  APP_PACKAGE_INTEGRATIONS,
  AGENT_APP_PACKAGES,
  AGENT_APP_PACKAGE,
} from '@chaskiq/store/src/graphql/queries';

import {
  CREATE_INTEGRATION,
  UPDATE_INTEGRATION,
  DELETE_INTEGRATION,
  CREATE_PACKAGE,
  UPDATE_PACKAGE,
  DELETE_PACKAGE,
} from '@chaskiq/store/src/graphql/mutations';

function Integrations({ app, dispatch }) {
  const [open, setOpen] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(null);
  const [openIntegrationDialog, _setOpenIntegrationDialog] = useState(null);
  const [baseErrors, setBaseErrors] = useState(null);
  const [errors, setErrors] = useState(null);

  const form = useRef(null);

  useEffect(() => {
    dispatch(setCurrentSection('Settings'));
    dispatch(setCurrentPage('integrations'));
  }, []);

  function getAppPackages() {
    setLoading(true);
    graphql(
      APP_PACKAGES,
      {
        appKey: app.key,
      },
      {
        success: (data) => {
          setServices(data.app.appPackages);
          setLoading(false);
        },
        error: () => {
          setLoading(false);
        },
      }
    );
  }

  function getAppPackageIntegration() {
    setLoading(true);
    graphql(
      APP_PACKAGE_INTEGRATIONS,
      {
        appKey: app.key,
      },
      {
        success: (data) => {
          setIntegrations(data.app.appPackageIntegrations);
          setLoading(false);
        },
        error: () => {
          setLoading(false);
        },
      }
    );
  }

  function handleOpen(service) {
    setOpen(service);
    setErrors(null);
  }

  function close() {
    setOpen(false);
  }

  function submit() {
    const serializedData = serialize(form.current, {
      hash: true,
      empty: true,
    });

    open.id
      ? updateIntegration(serializedData)
      : createIntegration(serializedData);
  }

  function createIntegration(serializedData) {
    setBaseErrors(null);
    setErrors(null);

    graphql(
      CREATE_INTEGRATION,
      {
        appKey: app.key,
        appPackage: open.name,
        params: serializedData.app || {},
      },
      {
        success: (data) => {
          setTabValue(0);

          if (!isEmpty(data.integrationsCreate.errors)) {
            dispatch(
              errorMessage(I18n.t('settings.integrations.create_error'))
            );
            setErrors(data.integrationsCreate.errors);
            return;
          }

          const integration = data.integrationsCreate.integration;
          const newIntegrations = integrations.map((o) =>
            o.name === integration.name ? integration : o
          );
          setIntegrations(newIntegrations);

          setOpen(null);
          dispatch(
            successMessage(I18n.t('settings.integrations.create_success'))
          );
        },
        error: () => {
          dispatch(errorMessage(I18n.t('settings.integrations.create_error')));
        },
      }
    );
  }

  function updateIntegration(serializedData) {
    setBaseErrors(null);

    graphql(
      UPDATE_INTEGRATION,
      {
        appKey: app.key,
        appPackage: open.name,
        id: open.id,
        params: serializedData.app,
      },
      {
        success: (data) => {
          setTabValue(0);
          const integration = data.integrationsUpdate.integration;
          const newIntegrations = integrations.map((o) =>
            o.name === integration.name ? integration : o
          );

          if (isEmpty(data.integrationsUpdate.errors)) {
            setIntegrations(newIntegrations);
            // getAppPackageIntegration()
            setOpen(null);
            dispatch(
              successMessage(I18n.t('settings.integrations.update_success'))
            );
            return;
          }

          setBaseErrors(data.integrationsUpdate.errors.base);
          dispatch(errorMessage(I18n.t('settings.integrations.update_error')));
        },
        error: () => {
          dispatch(errorMessage(I18n.t('settings.integrations.update_error')));
        },
      }
    );
  }

  function removeIntegration() {
    graphql(
      DELETE_INTEGRATION,
      {
        appKey: app.key,
        id: openDeleteDialog.id,
      },
      {
        success: (data) => {
          setTabValue(0);
          const integration = data.integrationsDelete.integration;
          const newIntegrations = integrations.filter(
            (o) => o.name !== integration.name
          );
          setIntegrations(newIntegrations);
          setOpen(null);
          setOpenDeleteDialog(null);
          dispatch(
            successMessage(I18n.t('settings.integrations.remove_success'))
          );
        },
        error: () => {
          dispatch(errorMessage(I18n.t('settings.integrations.remove_error')));
        },
      }
    );
  }

  return (
    <Content>
      <PageHeader title={I18n.t('settings.integrations.title')} />

      <Tabs
        currentTab={tabValue}
        onChange={(value) => setTabValue(value)}
        tabs={[
          {
            label: I18n.t('settings.integrations.active.title'),
            // icon: <HomeIcon />,
            content: (
              <div className="py-6">
                <p className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 pb-4">
                  {I18n.t('settings.integrations.active.text')}
                </p>

                <Hints type="integrations" />

                {loading && <Progress />}

                {integrations.length === 0 && !loading && (
                  <EmptyCard
                    goTo={() => {
                      setTabValue(1);
                    }}
                  />
                )}

                {
                  <ServiceIntegration
                    services={integrations}
                    handleOpen={handleOpen}
                    getAppPackages={getAppPackageIntegration}
                    setOpenDeleteDialog={setOpenDeleteDialog}
                    kind={'integrations'}
                  />
                }
              </div>
            ),
          },
          {
            label: I18n.t('settings.integrations.available.title'),
            content: (
              <div className="py-6">
                <p className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 pb-4">
                  {I18n.t('settings.integrations.available.text')}
                </p>
                {loading && <Progress />}

                {
                  <APIServices
                    services={services}
                    handleOpen={handleOpen}
                    getAppPackages={getAppPackages}
                    kind={'services'}
                  />
                }
              </div>
            ),
          },
          {
            label: I18n.t('settings.integrations.yours.title'),
            content: (
              <div className="py-6">
                <MyAppPackages
                  app={app}
                  // open={openIntegrationDialog}
                  handleOpen={handleOpen}
                  dispatch={dispatch}
                ></MyAppPackages>
              </div>
            ),
          },
        ]}
      />

      {open && (
        <FormDialog
          open={open}
          handleClose={close}
          titleContent={`${open.id ? 'Update' : 'Add'} ${
            open.name
          } integration`}
          formComponent={
            <form ref={form}>
              <div className="overflow-auto max-h-96">
                {baseErrors && (
                  <p className="p-2 border-red-600 bg-red-500 text-red-100 rounded-md my-2">
                    {baseErrors.join(', ')}
                  </p>
                )}
                {open.definitions.map((field) => {
                  return (
                    <div key={field.name}>
                      <FieldRenderer
                        namespace={'app'}
                        data={camelizeKeys(field)}
                        type={field.type}
                        props={{
                          data: open.settings
                            ? camelizeKeys(open.settings)
                            : {},
                        }}
                        errors={errors || {}}
                      />
                    </div>
                  );
                })}
              </div>

              {open.id && (
                <div>
                  {open.oauthAuthorize && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold leading-7">
                        Authorize App
                      </p>

                      <a
                        href={open.oauthAuthorize}
                        className="p-2 outline-none
                      inline-flex
                      items-center
                      border
                      border-color-gray-500
                      rounded-md text-gray-500
                      focus:outline-none
                      border-1
                      focus:shadow-outline-indigo
                      focus:border-indigo-700
                      active:bg-indigo-700"
                      >
                        <Avatar
                          size={10}
                          classes={'mr-4'}
                          src={logos[open.name.toLocaleLowerCase()]}
                        />
                        Install {open.name}
                      </a>
                    </div>
                  )}

                  <p className="text-sm font-semibold leading-7">
                    {I18n.t('settings.integrations.hints.hook_url')}
                  </p>

                  <p>
                    {/* `${window.location.origin}/api/v1/hooks/${
                      app.key
                    }/${open.name.toLocaleLowerCase()}/${open.id}` */}
                    <input
                      className={`text-xs shadow appearance-none border border-black 
                      rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100
                      leading-tight focus:outline-none focus:shadow-outline bg-yellow-100 dark:bg-gray-900`}
                      type={'text'}
                      defaultValue={open.hookUrl}
                      disabled={true}
                    />
                  </p>
                </div>
              )}
            </form>
          }
          dialogButtons={
            <React.Fragment>
              <Button onClick={close} variant="outlined">
                {I18n.t('common.cancel')}
              </Button>

              <Button onClick={submit} className="mr-1">
                {open ? I18n.t('common.update') : I18n.t('common.create')}
              </Button>
            </React.Fragment>
          }
        ></FormDialog>
      )}

      {openDeleteDialog && (
        <DeleteDialog
          open={openDeleteDialog}
          title={I18n.t('settings.integrations.delete_dialog.title', {
            name: openDeleteDialog.name,
          })}
          closeHandler={() => {
            setOpenDeleteDialog(null);
          }}
          deleteHandler={removeIntegration}
        >
          <p>
            {I18n.t('settings.integrations.delete_dialog.text', {
              name: openDeleteDialog.name,
            })}
          </p>
        </DeleteDialog>
      )}
    </Content>
  );
}

function EmptyCard({ goTo }) {
  return (
    <div style={{ marginTop: '2em' }}>
      <div>
        <p color="textSecondary"></p>
        <p>{I18n.t('settings.integrations.empty.title')}</p>
        <p color="textSecondary">
          {I18n.t('settings.integrations.empty.text')}
          <a href="#" onClick={goTo}>
            API Services Tab
          </a>
        </p>
      </div>
    </div>
  );
}

function ServiceBlock({
  service,
  handleOpen,
  kind,
  setOpenDeleteDialog = null,
}) {
  function available() {
    if (kind === 'services') return service.state === 'enabled';
    if (kind === 'integrations') {
      return service.id && service.state === 'enabled';
    }
  }

  return (
    <ListItem
      avatar={
        logos[service.name.toLocaleLowerCase()] && (
          <ItemAvatar avatar={logos[service.name.toLocaleLowerCase()]} />
        )
      }
    >
      <ListItemText
        primary={
          <ItemListPrimaryContent>
            <div className="flex">
              {service.name}{' '}
              {kind === 'services' && (
                <div className="ml-2">
                  <Badge
                    variant={service.state === 'enabled' ? 'green' : 'gray'}
                  >
                    {service.state}
                  </Badge>
                </div>
              )}
            </div>
          </ItemListPrimaryContent>
        }
        secondary={
          <ItemListSecondaryContent>
            <div className="flex flex-col">
              <span className="mb-2">{service.description}</span>
              <div className="flex">
                {service.capabilities &&
                  service.capabilities.map((o) => (
                    <Badge
                      className="mr-2"
                      key={`cap-${o}`}
                      size="sm"
                      variant="blue"
                    >
                      {o}
                    </Badge>
                  ))}
              </div>
            </div>
          </ItemListSecondaryContent>
        }
        terciary={
          <React.Fragment>
            <div
              className="mt-2 flex items-center
            text-sm leading-5 text-gray-500 justify-end"
            >
              {available() && (
                <React.Fragment>
                  <Button
                    onClick={() => handleOpen(service)}
                    aria-label="add"
                    data-cy={`services-${service.name}-add`}
                    variant="outlined"
                    className="mr-2"
                    border={true}
                  >
                    {service.id ? (
                      <EditIcon />
                    ) : (
                      <Tooltip
                        placement="bottom"
                        overlay={'add app to workspace'}
                      >
                        <AddIcon />
                      </Tooltip>
                    )}
                  </Button>

                  {service.id && (
                    <Button
                      onClick={() =>
                        setOpenDeleteDialog && setOpenDeleteDialog(service)
                      }
                      variant="danger"
                      border={true}
                      aria-label="remove"
                    >
                      <DeleteIcon />
                    </Button>
                  )}
                </React.Fragment>
              )}
            </div>
          </React.Fragment>
        }
      />
    </ListItem>
  );
}

function ServiceIntegration({
  services,
  handleOpen,
  getAppPackages,
  kind,
  setOpenDeleteDialog,
}) {
  useEffect(() => {
    getAppPackages();
  }, []);

  return (
    <List>
      {services.map((o) => (
        <ServiceBlock
          kind={kind}
          key={`services-${o.name}`}
          service={o}
          setOpenDeleteDialog={setOpenDeleteDialog}
          handleOpen={handleOpen}
        />
      ))}
    </List>
  );
}

function APIServices({ services, handleOpen, getAppPackages, kind }) {
  useEffect(() => {
    getAppPackages();
  }, []);

  return (
    <List>
      {services.map((o) => (
        <ServiceBlock
          kind={kind}
          key={`services-${o.name}`}
          service={o}
          handleOpen={handleOpen}
        />
      ))}
    </List>
  );
}

type MyAppPackagesType = {
  app: any;
  dispatch: (val: any) => void;
  handleOpen: (service: any) => void;
};

function MyAppPackages({ app, dispatch, handleOpen }: MyAppPackagesType) {
  const [loading, setLoading] = React.useState(false);
  const [integrations, setIntegrations] = React.useState([]);
  const [integration, setIntegration] = React.useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(null);

  function getAppPackages() {
    setLoading(true);
    graphql(
      AGENT_APP_PACKAGES,
      {
        appKey: app.key,
      },
      {
        success: (data) => {
          setIntegrations(data.app.agentAppPackages);
          setLoading(false);
        },
        error: () => {
          setLoading(false);
        },
      }
    );
  }

  function getAppPackage({ id }) {
    setLoading(true);
    graphql(
      AGENT_APP_PACKAGE,
      {
        appKey: app.key,
        id: id,
      },
      {
        success: (data) => {
          setIntegration(data.app.agentAppPackage);
          setLoading(false);
        },
        error: () => {
          setLoading(false);
        },
      }
    );
  }

  function deleteAppPackage({ id }) {
    setLoading(true);
    graphql(
      DELETE_PACKAGE,
      {
        appKey: app.key,
        id: id,
      },
      {
        success: (_data) => {
          setOpenDeleteDialog(null);
          setIntegration(null);
          // setIntegration(data.app.agentAppPackage)
          setLoading(false);
          dispatch(
            successMessage(I18n.t('settings.integrations.remove_success'))
          );
          getAppPackages();
        },
        error: () => {
          setLoading(false);
          dispatch(errorMessage(I18n.t('settings.integrations.remove_error')));
        },
      }
    );
  }

  React.useEffect(getAppPackages, []);

  return (
    <div>
      <div className="py-4 flex justify-end">
        <Button onClick={() => setIntegration({})}>
          {I18n.t('settings.integrations.create_integration')}
        </Button>
      </div>

      {loading && <Progress />}

      {integration && (
        <AppPackageForm
          app={app}
          open={{}}
          integration={integration}
          onCancel={(e) => {
            e && e.preventDefault();
            setIntegration(null);
            getAppPackages();
          }}
          dispatch={dispatch}
        />
      )}

      {!loading && !integration && (
        <List>
          {integrations.map((service) => (
            <ListItem
              key={`my-apps-${service.id}`}
              // onClick={ () => getAppPackage({ id: service.id }) }
            >
              <ListItemText
                primary={
                  <ItemListPrimaryContent>
                    <div className="flex">
                      {service.name}
                      <div className="ml-2">
                        <Badge
                          variant={
                            service.state === 'enabled' ? 'green' : 'gray'
                          }
                        >
                          {service.state}
                        </Badge>
                      </div>
                    </div>
                  </ItemListPrimaryContent>
                }
                secondary={
                  <ItemListSecondaryContent>
                    <div className="flex flex-col">
                      <span className="mb-2">{service.description}</span>
                      <div className="flex">
                        {service.capabilities &&
                          service.capabilities.map((o) => (
                            <Badge
                              className="mr-2"
                              key={`cap-${o}`}
                              size="sm"
                              variant="blue"
                            >
                              {o}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </ItemListSecondaryContent>
                }
                terciary={
                  <React.Fragment>
                    <div
                      className="mt-2 flex items-center
                  text-sm leading-5 text-gray-500 justify-end"
                    >
                      {
                        <React.Fragment>
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              // TODO: add a new mutation for link agent app package with application/appIntegration
                              // instead of using the old handleOpen
                              handleOpen({
                                name: service.name,
                                definitions: [],
                              });
                            }}
                            aria-label="add"
                            variant="icon"
                            className="mr-2"
                            border={true}
                          >
                            {
                              <Tooltip
                                placement="bottom"
                                overlay={'add app to workspace'}
                              >
                                <AddIcon />
                              </Tooltip>
                            }
                          </Button>

                          <Button
                            // onClick={() => handleOpen(service)}
                            onClick={() =>
                              getAppPackage({
                                id: service.id,
                              })
                            }
                            aria-label="add"
                            variant="icon"
                            className="mr-2"
                            border={true}
                          >
                            {service.id ? (
                              <EditIcon />
                            ) : (
                              <Tooltip
                                placement="bottom"
                                overlay={'add app to workspace'}
                              >
                                <AddIcon />
                              </Tooltip>
                            )}
                          </Button>

                          {service.id && (
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                setOpenDeleteDialog &&
                                  setOpenDeleteDialog(service);
                              }}
                              border={true}
                              aria-label="remove"
                              variant="icon"
                            >
                              <DeleteIcon />
                            </Button>
                          )}
                        </React.Fragment>
                      }
                    </div>
                  </React.Fragment>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {openDeleteDialog && (
        <DeleteDialog
          open={openDeleteDialog}
          title={I18n.t('settings.integrations.delete_dialog.title', {
            name: openDeleteDialog.name,
          })}
          closeHandler={() => {
            setOpenDeleteDialog(null);
          }}
          deleteHandler={() => {
            deleteAppPackage(openDeleteDialog);
          }}
        >
          <p>
            {I18n.t('settings.integrations.delete_dialog.text', {
              name: openDeleteDialog.name,
            })}
          </p>
        </DeleteDialog>
      )}
    </div>
  );
}

// form for my apps packages
function AppPackageForm({ app, open, dispatch, onCancel, integration }) {
  const form = React.useRef();

  const [errors, setErrors] = React.useState({});
  const [appPackage, setAppPackage] = React.useState(integration);

  React.useEffect(() => {
    setAppPackage(integration);
  }, [integration]);

  const capabilitiesTypes = [
    { label: 'Home', value: 'home' },
    { label: 'Conversations', value: 'conversations' },
    { label: 'Bots', value: 'bots' },
    { label: 'Inbox detail', value: 'inbox' },
  ];

  const eventsTypes = [
    { label: 'Dashboard', value: 'dashboard' },
    { label: 'Closed conversations', value: '"conversations.closed"' },
    { label: 'editor', value: 'editor' },
    { label: 'email_changed', value: 'email_changed' },
    { label: 'leads.convert', value: 'leads.convert' },
    {
      label: 'conversation.user.first.comment',
      value: 'conversation.user.first.comment',
    },
    { label: 'conversations.assigned', value: 'conversations.assigned' },
    { label: 'conversations.prioritized', value: 'conversations.prioritized' },
    { label: 'conversations.started', value: 'conversations.started' },
    { label: 'conversations.added', value: 'conversations.added' },
    { label: 'conversations.closed', value: 'conversations.closed' },
    { label: 'conversations.reopened', value: 'conversations.reopened' },
  ];

  function integrationDefinitions() {
    return [
      {
        name: 'name',
        label: I18n.t('definitions.app_packages.name.label'),
        type: 'string',
        grid: { xs: 'w-full', sm: 'w-full' },
      },
      {
        name: 'published',
        label: I18n.t('definitions.app_packages.published.label'),
        type: 'checkbox',
        hint: I18n.t('definitions.app_packages.published.hint'),
        grid: { xs: 'w-full', sm: 'w-full' },
      },
      {
        name: 'capability_list',
        type: 'select',
        label: I18n.t('definitions.app_packages.capability_list.label'),
        hint: I18n.t('definitions.app_packages.capability_list.hint'),
        multiple: true,
        options: capabilitiesTypes,
        grid: { xs: 'w-full', sm: 'w-full' },
      },

      {
        name: 'tag_list',
        type: 'select',
        label: 'Events',
        hint: I18n.t('definitions.app_packages.capability_list.hint'),
        multiple: true,
        options: eventsTypes,
        grid: { xs: 'w-full', sm: 'w-full' },
      },

      {
        name: 'description',
        label: I18n.t('definitions.app_packages.description.label'),
        type: 'textarea',
        hint: I18n.t('definitions.app_packages.description.hint'),
        grid: { xs: 'w-full', sm: 'w-full' },
      },

      {
        name: 'api_url',
        label: 'api webhook url (required)',
        type: 'string',
        hint: '(required) The main input where your app will receive webhooks',
        grid: { xs: 'w-full', sm: 'w-full' },
      },

      {
        name: 'oauth_url',
        label: 'oauth url (Optional)',
        type: 'string',
        hint:
          "(Optional) OAuth is used for publicly-available apps that access other people's Chaskiq data",
        grid: { xs: 'w-full', sm: 'w-full' },
      },

      {
        name: 'initialize_url',
        label: I18n.t('definitions.app_packages.initialize_url.label'),
        type: 'string',
        hint: I18n.t('definitions.app_packages.initialize_url.hint'),
        placeholder: I18n.t(
          'definitions.app_packages.initialize_url.placeholder'
        ),
        grid: { xs: 'w-full', sm: 'w-full' },
      },
      {
        label: I18n.t('definitions.app_packages.configure_url.label'),
        name: 'configure_url',
        type: 'string',
        hint: I18n.t('definitions.app_packages.configure_url.hint'),
        placeholder: I18n.t(
          'definitions.app_packages.configure_url.placeholder'
        ),
        grid: { xs: 'w-full', sm: 'w-full' },
      },
      {
        name: 'submit_url',
        label: I18n.t('definitions.app_packages.submit_url.label'),
        type: 'string',
        hint: I18n.t('definitions.app_packages.submit_url.hint'),
        placeholder: I18n.t('definitions.app_packages.submit_url.placeholder'),
        grid: { xs: 'w-full', sm: 'w-full' },
      },
      {
        name: 'content_url',
        label: I18n.t('definitions.app_packages.content_url.label'),
        type: 'string',
        hint: I18n.t('definitions.app_packages.content_url.hint'),
        placeholder: I18n.t('definitions.app_packages.content_url.placeholder'),
        grid: { xs: 'w-full', sm: 'w-full' },
      },
      {
        label: I18n.t('definitions.app_packages.sheet_url.label'),
        type: 'string',
        name: 'sheet_url',
        hint: I18n.t('definitions.app_packages.sheet_url.hint'),
        placeholder: I18n.t('definitions.app_packages.sheet_url.placeholder'),
        grid: { xs: 'w-full', sm: 'w-full' },
      },
    ];
  }

  function submit(e) {
    e.preventDefault();
    const serializedData = serialize(form.current, {
      hash: true,
      empty: true,
    });

    !appPackage.id
      ? createPackage(serializedData)
      : updatePackage(serializedData);
  }

  function createPackage(serializedData) {
    graphql(
      CREATE_PACKAGE,
      {
        appKey: app.key,
        appPackage: open.name,
        params: serializedData.app || {},
      },
      {
        success: (data) => {
          if (!isEmpty(data.appPackagesCreate.errors)) {
            dispatch(
              errorMessage(I18n.t('settings.app_packages.create_error'))
            );
            setErrors(data.appPackagesCreate.errors);
            return;
          }
          setAppPackage(data.appPackagesCreate.appPackage);
          onCancel();
          dispatch(
            successMessage(I18n.t('settings.app_packages.create_success'))
          );
        },
        error: () => {
          dispatch(errorMessage(I18n.t('settings.app_packages.create_error')));
        },
      }
    );
  }

  function updatePackage(serializedData) {
    graphql(
      UPDATE_PACKAGE,
      {
        appKey: app.key,
        appPackage: open.name,
        params: serializedData.app || {},
        id: appPackage.id,
      },
      {
        success: (data) => {
          if (!isEmpty(data.appPackagesUpdate.errors)) {
            dispatch(
              errorMessage(I18n.t('settings.app_packages.update_error'))
            );
            setErrors(data.appPackagesUpdate.errors);
            return;
          }
          setAppPackage(data.appPackagesUpdate.appPackage);
          dispatch(
            successMessage(I18n.t('settings.app_packages.update_success'))
          );
        },
        error: () => {
          dispatch(errorMessage(I18n.t('settings.app_packages.update_error')));
        },
      }
    );
  }

  return (
    <div className="border bg-white dark:bg-black rounded shadow">
      <div className="flex">
        <div className="w-1/3 bg-gray-100 dark:bg-gray-900 px-4 py-2">
          {/* <ul>
            <li>ijij</li>
            <li>aaa</li>
          </ul> */}
        </div>
        <form ref={form} className="px-4 py-2">
          <div>
            {integrationDefinitions().map((field) => {
              return (
                <div key={field.name}>
                  <FieldRenderer
                    namespace={'app'}
                    data={camelizeKeys(field)}
                    type={field.type}
                    props={{
                      data: appPackage,
                    }}
                    errors={errors}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button onClick={onCancel} variant="outlined">
              {I18n.t('common.cancel')}
            </Button>

            <Button onClick={submit} className="ml-1">
              {open ? I18n.t('common.update') : I18n.t('common.create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  const { app } = state;

  return {
    app,
  };
}

export default withRouter(connect(mapStateToProps)(Integrations));
