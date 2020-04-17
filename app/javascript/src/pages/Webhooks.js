import React, { useState, useEffect, useRef } from 'react'
import { isEmpty } from 'lodash'
import { Switch, Route, Link, withRouter } from 'react-router-dom'

import { connect } from 'react-redux'
import Content from '../components/Content'
import { errorMessage, successMessage } from '../actions/status_messages'

import { setCurrentPage, setCurrentSection } from '../actions/navigation'

import { camelizeKeys } from '../actions/conversation'

import PageHeader from '../components/PageHeader'
import Tabs from '../components/Tabs'
import Panel from '../components/Panel'
import DeleteDialog from '../components/DeleteDialog'
import EmptyView from '../components/EmptyView'

import { EditIcon, AddIcon, DeleteIcon, HomeIcon } from '../components/icons'
import FormDialog from '../components/FormDialog'
import Button from '../components/Button'
import Badge from '../components/Badge'
import FieldRenderer, {gridClasses} from '../components/forms/FieldRenderer'
import graphql from '../graphql/client'

import { EVENT_TYPES, OUTGOING_WEBHOOKS } from '../graphql/queries'
import {
  WEBHOOK_CREATE,
  WEBHOOK_UPDATE,
  WEBHOOK_DELETE
} from '../graphql/mutations'

import List, {
  ListItem,
  ListItemText,
  ItemListPrimaryContent,
  ItemListSecondaryContent
} from '../components/List'

import serialize from 'form-serialize'

function Settings ({ app, dispatch }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [eventTypes, setEventTypes] = useState([])
  const [errors, setErrors] = useState([])
  const [webhooks, setWebhooks] = useState([])
  const [tabValue, setTabValue] = useState(0)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const form = useRef(null)

  useEffect(() => {
    dispatch(setCurrentSection('Settings'))
    dispatch(setCurrentPage('webhooks'))
    getEventTypes()
    getWebhooks()
  }, [])

  function getEventTypes () {
    graphql(
      EVENT_TYPES,
      { appKey: app.key },
      {
        success: (data) => {
          const types = data.app.eventTypes.map((o) => ({
            label: o.identifier,
            value: o.name
          }))
          setEventTypes(types)
        },
        error: (data) => {
          debugger
        }
      }
    )
  }

  function getWebhooks () {
    setLoading(true)

    setWebhooks([])

    graphql(
      OUTGOING_WEBHOOKS,
      {
        appKey: app.key
      },
      {
        success: (data) => {
          setWebhooks(data.app.outgoingWebhooks)
          setLoading(false)
        },
        error: () => {
          setLoading(false)
        }
      }
    )
  }

  function handleOpen (service) {
    setOpen(service)
  }

  function close () {
    setOpen(false)
  }

  function submit () {
    const serializedData = serialize(form.current, {
      hash: true,
      empty: true
    })

    open.id ? updateWebhook(serializedData) : createWebhook(serializedData)
  }

  function definitions () {
    return [
      {
        name: 'url',
        type: 'string',
        label: 'url for outgoing webhook',
        hint: "we'll send POST requests",
        placeholder: 'https://mysite.com',
        grid: { xs: 'w-full', sm: 'w-full' }
      },
      {
        name: 'enabled',
        type: 'bool',
        label: 'enable webhook',
        grid: { xs: 'w-full', sm: 'w-1/2' }
      },
      {
        name: 'tag_list',
        type: 'select',
        label: 'events to send',
        hint: 'chaskiq will deliver this events to configured endpoint',
        multiple: true,
        options: eventTypes,
        grid: { xs: 'w-full', sm: 'w-full' }
      }
    ]
  }

  function newWebhook () {
    setOpen({
      name: 'webhook',
      tag_list: [],
      description: 'Outgoing webhook',
      state: 'disabled',
      enabled: false,
      definitions: definitions()
    })
  }

  function createWebhook (serializedData) {
    const { url, tag_list, enabled } = serializedData.app
    graphql(
      WEBHOOK_CREATE,
      {
        appKey: app.key,
        url: url,
        state: enabled,
        tags: tag_list
      },
      {
        success: (data) => {
          setTabValue(0)
          const webhook = data.createWebhook.webhook
          const errors = data.createWebhook.errors
          if (!isEmpty(errors)) {
            setErrors(errors)
            return
          }

          const newIntegrations = webhooks.concat(webhook)

          setWebhooks(newIntegrations)

          setOpen(null)
          dispatch(successMessage('webhook created'))
        },
        error: () => {
          dispatch(errorMessage('error adding webhook'))
        }
      }
    )
  }

  function updateWebhook (serializedData) {
    const { url, tag_list, enabled } = serializedData.app
    graphql(
      WEBHOOK_UPDATE,
      {
        appKey: app.key,
        appPackage: open.name,
        id: parseInt(open.id),
        url: url,
        state: enabled,
        tags: tag_list
      },
      {
        success: (data) => {
          setTabValue(0)
          const webhook = data.updateWebhook.webhook
          const errors = data.updateWebhook.errors
          if (!isEmpty(errors)) {
            setErrors(errors)
            return
          }
          const newIntegrations = webhooks.map((o) =>
            o.id === webhook.id ? webhook : o
          )
          setWebhooks(newIntegrations)
          // getAppPackageIntegration()
          setOpen(null)
          dispatch(successMessage('webhook updated'))
        },
        error: () => {
          dispatch(errorMessage('error updating webhook'))
        }
      }
    )
  }

  function removeWebhook () {
    graphql(
      WEBHOOK_DELETE,
      {
        appKey: app.key,
        id: parseInt(openDeleteDialog.id)
      },
      {
        success: (data) => {
          setTabValue(0)
          const webhook = data.deleteWebhook.webhook
          const newIntegrations = webhooks.filter((o) => o.id != webhook.id)
          const errors = data.deleteWebhook.errors
          if (!isEmpty(errors)) {
            setErrors(errors)
            return
          }
          setWebhooks(newIntegrations)
          setOpen(null)
          setOpenDeleteDialog(null)
          dispatch(successMessage('webhook removed correctly'))
        },
        error: () => {
          dispatch(errorMessage('error removing webhook'))
        }
      }
    )
  }

  function handleTabChange (e, i) {
    setTabValue(i)
  }

  function activeWebhooks () {
    return webhooks.filter((o) => o.enabled)
  }

  function disabledWebhooks () {
    return webhooks.filter((o) => !o.enabled)
  }

  return (
    <Content>
      <PageHeader
        title={'Outgoing Webhooks'}
        actions={
          <Button
            className={'transition duration-150 ease-in-out'}
            variant={'main'}
            color={'primary'}
            onClick={newWebhook}
          >
            New webhook
          </Button>
        }
      />

      <Tabs
        currentTab={tabValue}
        tabs={[
          {
            label: 'Active Webhooks',
            icon: <HomeIcon />,
            content: (
              <React.Fragment>
                <div className="pb-2 pt-2">
                  <Panel
                    title={'Active Webhooks'}
                    text={'lorem bobob'}
                    variant="shadowless"
                  />
                </div>

                {activeWebhooks().length > 0 && (
                  <List>
                    {activeWebhooks().map((o) => (
                      <WebhookItem
                        webhook={o}
                        key={`webhook-${o.id}`}
                        handleEdit={(o) => setOpen(o)}
                        handleDelete={(o) => setOpenDeleteDialog(o)}
                      />
                    ))}
                  </List>
                )}

                {activeWebhooks().length === 0 && !loading && (
                  <EmptyView
                    title={"You don't have any active webhooks yet"}
                    subtitle={
                      <span>
                        search for your webhooks in
                        <a href="#" onClick={() => setTabValue(1)}>
                          disabled webhooks
                        </a>{' '}
                        Tab
                      </span>
                    }
                  />
                )}
              </React.Fragment>
            )
          },
          {
            label: 'Disabled Webhooks',
            content: (
              <React.Fragment>
                <div className="pb-2 pt-2">
                  <Panel
                    title={'Disabled Webhooks'}
                    // text={'lorem bobob'}
                    variant="shadowless"
                  />
                </div>

                {disabledWebhooks().length > 0 && (
                  <List>
                    {disabledWebhooks().map((o) => (
                      <WebhookItem
                        webhook={o}
                        key={`webhook-${o.id}`}
                        handleEdit={(o) => setOpen(o)}
                        handleDelete={(o) => setOpenDeleteDialog(o)}
                      />
                    ))}
                  </List>
                )}
              </React.Fragment>
            )
          }
        ]}
      />

      {open && (
        <FormDialog
          open={open}
          handleClose={close}
          titleContent={`${open.id ? 'Update' : 'Add'} webhook`}
          formComponent={
            <form ref={form}>
              {definitions().map((field) => {
                return (
                  <div 
                    className={`${gridClasses(field)} py-2 pr-2`}

                    key={field.name} 
                    xs={field.grid.xs} 
                    sm={field.grid.sm}>
                    <FieldRenderer
                      namespace={'app'}
                      type={field.type}
                      data={camelizeKeys(field)}
                      props={{
                        data: camelizeKeys(open)
                      }}
                      errors={errors}
                    />
                  </div>
                )
              })}
            </form>
          }
          dialogButtons={
            <React.Fragment>
              <Button onClick={close} color="secondary">
                Cancel
              </Button>

              <Button onClick={submit} color="primary">
                {open ? 'Update' : 'Create'}
              </Button>
            </React.Fragment>
          }
        ></FormDialog>
      )}

      {openDeleteDialog && (
        <DeleteDialog
          open={openDeleteDialog}
          title={'Delete webhook ?'}
          closeHandler={() => {
            setOpenDeleteDialog(null)
          }}
          deleteHandler={() => {
            removeWebhook(openDeleteDialog)
          }}
        >
          <p variant="subtitle2">
            The webhook with {openDeleteDialog.dialog} service will be disabled
            immediately
          </p>
        </DeleteDialog>
      )}
    </Content>
  )
}

function WebhookItem ({ webhook, handleEdit, handleDelete }) {
  return (
    <ListItem>
      <ListItemText
        primary={
          <ItemListPrimaryContent variant="h5">
            {webhook.url}
          </ItemListPrimaryContent>
        }
        secondary={
          <ItemListSecondaryContent>
            {webhook.tag_list.map((o) => (
              <Badge
                key={`chip-${o}`}
                size="small"
                style={{ margin: '0 0.2em .2em 0px' }}
              >
                {o}
              </Badge>
            ))}
          </ItemListSecondaryContent>
        }
        terciary={
          <React.Fragment>
            <div className="text-sm leading-5 text-gray-900">
              <Badge>{webhook.state}</Badge>
            </div>

            <div className="mt-2 flex items-center text-sm leading-5 text-gray-500">
              <Button
                onClick={() => handleEdit(webhook)}
                edge="end"
                aria-label="add"
              >
                {webhook.id ? <EditIcon /> : <AddIcon />}
              </Button>

              {webhook.id && (
                <Button
                  onClick={() => handleDelete(webhook)}
                  edge="end"
                  aria-label="add"
                >
                  <DeleteIcon />
                </Button>
              )}
            </div>
          </React.Fragment>
        }
      />
    </ListItem>
  )
}

function mapStateToProps (state) {
  const { auth, app, segment, app_users, current_user, navigation } = state
  const { loading, isAuthenticated } = auth
  const { current_section } = navigation
  return {
    segment,
    app_users,
    current_user,
    app,
    loading,
    isAuthenticated,
    current_section
  }
}

export default withRouter(connect(mapStateToProps)(Settings))
