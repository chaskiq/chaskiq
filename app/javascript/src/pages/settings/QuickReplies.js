import React, { Component } from 'react'

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Hints from '../../shared/Hints'
import graphql from '../../graphql/client'
import EmptyView from '../../components/EmptyView'
import DeleteDialog from '../../components/DeleteDialog'
import Tabs from '../../components/Tabs'
import { successMessage, errorMessage } from '../../actions/status_messages'

import {
  QUICK_REPLIES,
  QUICK_REPLY
} from '../../graphql/queries'

import {
  QUICK_REPLY_CREATE,
  QUICK_REPLY_UPDATE,
  QUICK_REPLY_DELETE
} from '../../graphql/mutations'

import TextEditor from '../../components/textEditor'
import Button from '../../components/Button'

function QuickReplies ({ app, _update, dispatch }) {
  const [quickReplies, setQuickReplies] = React.useState([])
  const [quickReply, setQuickReply] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false)
  const [lang, setLang] = React.useState(app.availableLanguages[0] || 'en')

  const inputRef = React.useRef(null)

  React.useEffect(() => {
    getQuickReplies()
  }, [])

  React.useEffect(() => {
    if (quickReply) getQuickReply(quickReply)
  }, [lang])

  function getQuickReplies () {
    graphql(QUICK_REPLIES, {
      appKey: app.key,
      lang: lang
    }, {
      success: (data) => {
        setQuickReplies(data.app.quickReplies)
      },
      error: () => { 

      }
    })
  }

  function createQuickReply () {
    graphql(QUICK_REPLY_CREATE, {
      appKey: app.key,
      title: quickReply.title,
      content: quickReply.content,
      lang: lang
    }, {
      success: (data) => {
        setQuickReply(data.createQuickReply.quickReply)
        getQuickReplies()
        dispatch(successMessage(I18n.t('quick_replies.create.success')))
      },
      error: (_err) => {
        dispatch(errorMessage(I18n.t('quick_replies.create.success')))
      }
    })
  }

  function updateQuickReply () {
    graphql(QUICK_REPLY_UPDATE, {
      appKey: app.key,
      id: quickReply.id,
      title: quickReply.title,
      content: quickReply.content,
      lang: lang
    }, {
      success: (data) => {
        setQuickReply(data.updateQuickReply.quickReply)
        getQuickReplies()
        dispatch(successMessage(I18n.t('quick_replies.update.success')))
      },
      error: (_err) => {
        dispatch(errorMessage(I18n.t('quick_replies.update.error')))
      }
    })
  }

  function getQuickReply (o) {
    setLoading(true)
    graphql(QUICK_REPLY, {
      appKey: app.key,
      id: o.id,
      lang: lang
    }, {
      success: (data) => {
        setQuickReply(data.app.quickReply)
        setLoading(false)
      },
      error: (_err) => {
        setLoading(false)
        dispatch(errorMessage(I18n.t('quick_replies.update.error')))
      }
    })
  }

  function availableLanguages () {
    return app.availableLanguages || ['en']
  }

  function deleteBotTask () {
    graphql(QUICK_REPLY_DELETE, {
      appKey: app.key,
      id: quickReply.id
    }, {
      success: (_data) => {
        setQuickReply(null)
        getQuickReplies()
        setOpenDeleteDialog(false)
        dispatch(successMessage('quick reply deleted successfully'))
      },
      error: (_err) => {
        setOpenDeleteDialog(false)
        dispatch(errorMessage('error deleting quick reply'))
      }
    })
  }

  function createNewQuickReply () {
    setQuickReply(null)
    setTimeout(() => {
      setQuickReply({
        id: null,
        title: null,
        content: null
      })
    }, 400)
  }

  function updateState (data) {
    setQuickReply(
      {
        ...quickReply,
        content: data.content.serialized,
        title: inputRef.current.value,
        lang: lang
      }
    )
  }

  function updateStateFromInput () {
    setQuickReply(
      {
        ...quickReply,
        title: inputRef.current.value
      }
    )
  }

  function handleSave () {
    createQuickReply()
  }

  function isSelected (o) {
    if (!quickReply) return ''
    return o.id === quickReply.id ? 'bg-blue-100' : ''
  }

  function uploadHandler ({ serviceUrl, _signedBlobId, imageBlock }) {
    imageBlock.uploadCompleted(serviceUrl)
  }

  function renderEditor ({ lang }) {
    if (!quickReply) return

    console.log()

    return <div className="py-2">
      <div>
        <div className="relative rounded-md shadow-sm">
          {
            !loading &&
                <input
                  ref={inputRef}
                  defaultValue={quickReply.title}
                  className="outline-none my-2 p-2 border-b form-input block w-full sm:text-sm sm:leading-5"
                  placeholder="Quick reply title"
                  onChange={updateStateFromInput}
                />
          }
        </div>
      </div>
      <div className="border-2 p-4 border-blue-200 rounded">
        {
          !loading && <ArticleEditor
            article={{
              serialized_content: quickReply.content
            }}
            // data={this.props.data}
            app={app}
            updateState={ (data) => updateState(data, lang) }
            loading={loading}
            uploadHandler={uploadHandler}
          />
        }
      </div>
    </div>
  }

  function tabs () {
    return availableLanguages().map((lang) => (
      {
        label: lang,
        content: quickReply && renderEditor({ lang: lang })
      }
    )
    )
  }

  return (
    <div className="py-4">

      <Hints type="quick_replies" />

      {!loading && quickReplies.length === 0 && !quickReply && (
        <EmptyView
          title={I18n.t('quick_replies.empty.title')}
          subtitle={
            <div>
              <Button
                variant="text"
                color="inherit"
                size="large"
                onClick={createNewQuickReply}
              >
                {I18n.t('quick_replies.empty.create_new')}
              </Button>
            </div>
          }
        />
      )}

      { (quickReply || quickReplies.length > 0) &&
        <div className="flex justify-end">
          <Button variant="outlined"
            className="mr-2 my-4" onClick={createNewQuickReply}>
            {I18n.t('common.create')}
          </Button>
        </div>
      }

      { (quickReply || quickReplies.length > 0) &&
        <div className="flex">

          <div className="w-1/3 bg-white shadow overflow-hidden rounded rounded-r-none">
            <ul>

              {
                quickReplies.map((o, i) => (
                  <li key={`quick-reply-${i}`} className={`border-t hover:bg-gray-100 border-gray-200 ${isSelected(o)}`}>
                    <a href="#"
                      onClick={ () => getQuickReply(o) }
                      className="block focus:outline-none transition duration-150 ease-in-out">
                      <div className="flex items-center px-4 py-4 sm:px-6">
                        <div className="min-w-0 flex-1 flex items-center">

                          <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-1 md:gap-4">
                            <div>
                              <div className="text-sm leading-5 font-medium text-indigo-600 truncate">
                                {o.title}
                              </div>
                            </div>

                          </div>
                        </div>
                        <div>
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      </div>
                    </a>
                  </li>
                ))
              }

            </ul>
          </div>

          <div className="w-2/3 relative z-0 p-6 shadow bg-yellow rounded rounded-l-none">

            {
              quickReply && !quickReply.id &&
              <div className="flex justify-end">
                <Button
                  variant="outlined"
                  className="mr-2"
                  onClick={ handleSave }>
                  {I18n.t('common.save')}
                </Button>
                <Button variant="success">
                  {I18n.t('common.cancel')}
                </Button>
              </div>
            }

            {
              quickReply && quickReply.id &&
              <div className="flex justify-end">
                <Button variant="outlined"
                  className="mr-2"
                  onClick={ updateQuickReply }>
                  Save
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setOpenDeleteDialog(true)}>
                  {I18n.t('common.delete')}
                </Button>
              </div>
            }

            { quickReply && (
              <Tabs
                tabs={tabs()}
                onChange={(tab, _index) => {
                  setLang(availableLanguages()[tab])
                }
                }
              />
            )}

            {openDeleteDialog && (
              <DeleteDialog
                open={openDeleteDialog}
                title={I18n.t('quick_replies.delete.title', { name: openDeleteDialog.title })}
                closeHandler={() => {
                  setOpenDeleteDialog(null)
                }}
                deleteHandler={ deleteBotTask }
              >
                <p variant="subtitle2">
                  {I18n.t('quick_replies.delete.hint')}
                </p>
              </DeleteDialog>
            )}

          </div>

        </div>
      }
    </div>
  )
}

function mapStateToProps (state) {
  const { app } = state
  return {
    app
  }
}

export default withRouter(connect(mapStateToProps)(QuickReplies))

class ArticleEditor extends Component {
  constructor (props) {
    super(props)

    this.state = {
      read_only: false,
      data: {},
      status: '',
      statusButton: 'inprogress'
    }
  }

  saveContent = (content) => {
    this.props.updateState({
      status: 'saving...',
      statusButton: 'success',
      content: {
        html: content.html,
        serialized: content.serialized
      }
    })
  };

  isLoading = () => {
    return this.props.loading
  };

  render () {
    const content = this.props.article

    const serializedContent = content ? content.serialized_content : null

    return (
      <TextEditor
        campaign={true}
        uploadHandler={this.props.uploadHandler}
        loading={this.isLoading()}
        read_only={this.state.read_only}
        toggleEditable={() => {
          this.setState({
            read_only: !this.state.read_only
          })
        }}
        serializedContent={serializedContent}
        data={{
          serialized_content: serializedContent
        }}
        styles={{
          lineHeight: '2em',
          fontSize: '1.2em'
        }}
        updateState={({ _status, _statusButton, content }) => {
          console.log('get content', content)
          this.saveContent(content)
        }}
      />
    )
  }
}
