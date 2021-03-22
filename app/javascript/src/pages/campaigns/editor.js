import React, { Component } from 'react'
import graphql from '../../graphql/client'
import { UPDATE_CAMPAIGN, DELIVER_CAMPAIGN } from '../../graphql/mutations'
import { AGENTS } from '../../graphql/queries'
import TextEditor from '../../components/textEditor'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import styled from '@emotion/styled'

import {
  VisibilityRounded
} from '../../components/icons'

import Input from '../../components/forms/Input'
import BrowserSimulator from '../../components/BrowserSimulator'

import {
  BannerRenderer
} from '../../../client_messenger/Banner'

import serialize from 'form-serialize'

const EditorContentWrapper = styled.div``

export default class CampaignEditor extends Component {
  constructor (props) {
    super(props)
    this.ChannelEvents = null
    this.conn = null
    this.menuResizeFunc = null
    this.state = {
      loading: true,
      currentContent: null,
      diff: '',
      videoSession: false,
      selectionPosition: null,
      incomingSelectionPosition: [],
      data: {},
      status: null,
      read_only: false,
      preview: false,
      bannerData: this.props.data.bannerData
    }
  }

  saveContent = (content) => {
    if (this.props.data.serializedContent === content.serialized) return

    this.setState({
      status: 'saving...'
    })

    const campaignParams = {
      html_content: content.html,
      serialized_content: content.serialized
    }

    // if(!isEmpty(this.state.bannerData))
    //  campaignParams = { ...campaignParams, ...this.state.bannerData }

    const params = {
      appKey: this.props.app.key,
      id: this.props.data.id,
      campaignParams: campaignParams
    }

    graphql(UPDATE_CAMPAIGN, params, {
      success: (data) => {
        this.props.updateData(data.campaignUpdate.campaign, null)
        this.setState({ status: null })
      },
      error: () => {
        this.setState({ status: 'error' })
      }
    })
  };

  updateFromBanner = (data) => {
    const params = {
      appKey: this.props.app.key,
      id: this.props.data.id,
      campaignParams: {
        serialized_content: this.props.data.serializedContent,
        ...data
      }
    }

    graphql(UPDATE_CAMPAIGN, params, {
      success: (data) => {
        this.props.updateData(data.campaignUpdate.campaign, null)
        this.setState({ status: null })
      },
      error: () => {
        this.setState({ status: 'error' })
      }
    })
  }

  saveHandler = (_html3, _plain, _serialized) => {
  };

  uploadHandler = ({ serviceUrl, imageBlock }) => {
    imageBlock.uploadCompleted(serviceUrl)
  };

  handleSend = (_e) => {
    const params = {
      appKey: this.props.app.key,
      id: this.props.data.id
    }

    graphql(DELIVER_CAMPAIGN, params, {
      success: (data) => {
        this.props.updateData(data.campaignDeliver.campaign, null)
        this.setState({ status: 'saved' })
      },
      error: () => {}
    })
  };

  togglePreview = () => {
    this.setState({ preview: !this.state.preview })
  }

  placementOption = () => {
    if (this.props.data.bannerData.placement === 'top' &&
    this.props.data.bannerData.mode === 'floating') return { top: 8 }

    if (this.props.data.bannerData.placement === 'top') return { top: 0 }

    if (this.props.data.bannerData.placement === 'bottom' &&
    this.props.data.bannerData.mode === 'floating') return { bottom: 8 }

    if (this.props.data.bannerData.placement === 'bottom') return { bottom: 0 }
  }

  render () {
    return (
      <EditorContentWrapper mode={this.props.mode}>

        <div className="h-12 flex flex-col justify-between w-full float-right m-4">
          <div className="w-full flex justify-end my-2">
            { this.state.status &&
              <Badge
                className="mr-2"
                variant={
                  this.state.status === 'error' ? 'red' : 'green'
                }>
                {this.state.status}
              </Badge>
            }
            { this.props.mode === 'campaigns' && <Button
              variant={ this.state.preview ? 'contained' : 'outlined' }
              size="small"
              onClick={this.togglePreview}>
              <VisibilityRounded/>
              {' '}
              {I18n.t('common.preview')}
            </Button>}
          </div>
        </div>

        {
          this.props.mode !== 'banners' &&
            <BrowserSimulator mode={this.props.mode}>
              <React.Fragment>
                {
                  !this.state.preview &&
                    <TextEditor
                      campaign={true}
                      uploadHandler={this.uploadHandler}
                      serializedContent={this.props.data.serializedContent}
                      read_only={this.state.read_only}
                      toggleEditable={() => {
                        this.setState({ read_only: !this.state.read_only })
                      }}
                      data={{
                        serialized_content: this.props.data.serializedContent
                      }}
                      styles={{
                        lineHeight: '2em',
                        fontSize: '1.2em'
                      }}
                      saveHandler={this.saveHandler}
                      updateState={({ _status, _statusButton, content }) => {
                        // console.log("get content", content);
                        this.saveContent(content)
                      }}
                    />
                }

                { this.state.preview &&
                  <Preview
                    app={this.props.app}
                    campaign={this.props.data}
                  />
                }
              </React.Fragment>
            </BrowserSimulator>
        }

        {
          this.props.mode === 'banners' &&
          <BrowserSimulator mode={this.props.mode}>
            <div style={{
              position: 'absolute',
              width: '100%',
              ...this.placementOption()
            }}>
              <BannerRenderer
                {...this.props.data.bannerData}
                textComponent={
                  <TextEditor
                    campaign={true}
                    uploadHandler={this.uploadHandler}
                    serializedContent={this.props.data.serializedContent}
                    read_only={this.state.read_only}
                    toggleEditable={() => {
                      this.setState({ read_only: !this.state.read_only })
                    }}
                    data={{
                      serialized_content: this.props.data.serializedContent
                    }}
                    styles={{
                      lineHeight: '2em',
                      fontSize: '1.2em'
                    }}
                    saveHandler={this.saveHandler}
                    updateState={({ _status, _statusButton, content }) => {
                      // console.log("get content", content);
                      this.saveContent(content)
                    }}
                  />
                }>
              </BannerRenderer>
            </div>
          </BrowserSimulator>
        }

        { this.props.mode === 'banners' &&
          <div className="pt-5 bg-gray-100 p-6 rounded-lg mt-5">
            <StyleBanner
              onChange={(data) => this.updateFromBanner(data) }
              campaign={this.props.data}
              app={this.props.app}
            />
          </div>
        }

      </EditorContentWrapper>
    )
  }
}

function Preview ({ campaign, app }) {
  return (
    <div>

      <div className="rounded-md bg-yellow-100 p-4 border-2 border-yellow-400">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm leading-5 font-medium text-yellow-800">
              {I18n.t('campaign.preview')}
            </h3>
            <div className="mt-2 text-sm leading-5 text-yellow-700">
              <p>
                {I18n.t('campaign.preview_hint')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <iframe height="800px" width="100%"
        src={`/apps/${app.key}/premailer/${campaign.id}?preview=true`} />
    </div>
  )
}

function StyleBanner ({ app, campaign, onChange }) {
  const form = React.useRef(null)
  const hidden = React.useRef(null)

  const [agent, setAgent] = React.useState(agentData(campaign.bannerData.sender_data))
  const [agents, setAgents] = React.useState([])

  React.useEffect(() => {
    fetchAgents()
  }, [])

  React.useEffect(() => {
    handleChange()
  }, [agent])

  function fetchAgents () {
    graphql(AGENTS, { appKey: app.key }, {
      success: (data) => {
        const options = data.app.agents.map((o) => (agentData(o)))
        setAgents(options)
      },
      error: () => {}
    })
  }

  function agentData (data) {
    if (!data) return null
    return {
      name: data.displayName || data.email,
      label: data.displayName || data.email,
      value: data.id
    }
  }

  function handleSubmit (e) {
    e.preventDefault()
    const data = serialize(form.current, { hash: true, empty: true })
    console.log(data)
    onChange(formattedData(data))
  }

  function handleChange () {
    const data = serialize(form.current, { hash: true, empty: true })
    onChange(formattedData(data))
  }

  function formattedData (data) {
    return {
      action_text: data.action_text,
      bg_color: data.bg_color || '#bd10e0',
      dismiss_button: data.dismiss_button,
      mode: data.mode || 'inline',
      sender_id: agent && agent.value,
      placement: data.placement || 'top',
      show_sender: data.show_sender,
      url: data.url
    }
  }

  const bannerData = campaign.bannerData

  return (
    <form onSubmit={handleSubmit} ref={form}>
      <div className="flex">
        <div className="flex flex-col w-1/3 justify-between">
          <h3 className="font-bold leading-1 text-gray-900 mb-4">
            Settings
          </h3>

          <div className="flex flex-col pr-6 justify-between">
            <Input type="checkbox" defaultValue={bannerData.dismiss_button} onChange={handleChange} label="show dismiss button" name="dismiss_button"/>
            <Input type="checkbox" defaultValue={bannerData.show_sender} onChange={handleChange} label="show sender" name="show_sender"/>
            <Input type="select"
              options={agents}
              onChange={(data) => {
                setAgent(data)
              }}
              defaultValue={agent}
              label="sender"
              name="sender_id"
            />
          </div>
        </div>

        <div className="flex flex-col w-1/3 justify-between">
          <h3 className="font-bold leading-1 text-gray-900 mb-4">
            Action
          </h3>
          <div className="flex flex-col pr-6">
            <Input type="text" defaultValue={bannerData.url} label="url" name="url" onChange={handleChange}/>
            <Input type="text" defaultValue={bannerData.action_text} label="link text" name="action_text" onChange={handleChange}/>
          </div>
        </div>

        <div className="flex flex-col w-1/3 justify-between">
          <h3 className="font-bold leading-1 text-gray-900 mb-4">
            Style
          </h3>

          <Input type="color"
            defaultValue={bannerData.bg_color}
            label="color"
            onChange={(color) => {
              hidden.current.value = color
              handleChange()
            }}
          />

          <input type="hidden"
            ref={hidden}
            name="bg_color"
            defaultValue={bannerData.bg_color}
            onChange={handleChange}
          />

          <div className="flex flex-wrap justify-between">
            <Input defaultChecked={bannerData.placement === 'top'} type="radio" value="top" label="top" name="placement" onChange={handleChange}/>
            <Input defaultChecked={bannerData.placement === 'bottom'} type="radio" value="bottom" label="bottom" name="placement" onChange={handleChange}/>
          </div>

          <div className="flex flex-wrap justify-between">
            <Input type="radio" defaultChecked={bannerData.mode === 'inline'} value="inline" label="inline" name="mode" onChange={handleChange}/>
            <Input type="radio" defaultChecked={bannerData.mode === 'floating'} value="floating" label="floating" name="mode" onChange={handleChange}/>
          </div>

        </div>

      </div>
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          variant={'flat-dark'}
          type="button">
          submit
        </Button>
      </div>

    </form>
  )
}
