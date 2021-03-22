import React, { Component } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'

import Button from '../../../components/Button'
import TextField from '../../../components/forms/Input'

import ContentHeader from '../../../components/PageHeader'

import FormDialog from '../../../components/FormDialog'
import { setCurrentSection, setCurrentPage } from '../../../actions/navigation'
import ScrollableTabsButtonForce from '../../../components/scrollingTabs'
import langs from '../../../shared/langsOptions'

import graphql from '../../../graphql/client'
import {
  ARTICLE_COLLECTION_CREATE,
  ARTICLE_COLLECTION_EDIT,
  ARTICLE_COLLECTION_DELETE,
  ARTICLE_COLLECTION_REORDER,
  CREATE_DIRECT_UPLOAD
} from '../../../graphql/mutations'

import {
  ARTICLE_COLLECTIONS
} from '../../../graphql/queries'
import Table from '../../../components/Table'

import { arrayMove } from 'react-sortable-hoc'
import { errorMessage, successMessage } from '../../../actions/status_messages'
import { getFileMetadata, directUpload } from '../../../shared/fileUploader'

class Collections extends Component {
  state = {
    isOpen: false,
    article_collections: [],
    editCollection: null,
    openConfirm: false,
    languages: [],
    lang: 'en'
  };

  titleRef = null;
  descriptionRef = null;

  componentDidMount () {
    this.getCollections()
    this.props.dispatch(setCurrentSection('HelpCenter'))

    this.props.dispatch(setCurrentPage('Collections'))
  }

  submitAssignment = () => {};

  close = () => {
    this.setState({ isOpen: false })
  };

  displayDialog = (_e) => {
    this.setState({ isOpen: true })
  };

  submitCreate = (_e) => {
    graphql(
      ARTICLE_COLLECTION_CREATE,
      {
        appKey: this.props.app.key,
        title: this.titleRef.value,
        description: this.descriptionRef.value
      },
      {
        success: (data) => {
          const col = data.articleCollectionCreate.collection
          this.setState({
            article_collections: this.state.article_collections.concat(col),
            isOpen: false
          })
        },
        error: () => {
        }
      }
    )
  };

  submitEdit = (_e) => {
    graphql(
      ARTICLE_COLLECTION_EDIT,
      {
        appKey: this.props.app.key,
        title: this.titleRef.value,
        description: this.descriptionRef.value,
        id: this.state.editCollection.id,
        lang: this.state.lang,
        icon: this.state.editCollection.uploadedIcon
      },
      {
        success: (data) => {
          const col = data.articleCollectionEdit.collection
          const newArticleCollection = this.state.article_collections.map(
            (o) => {
              if (o.id === col.id) {
                return col
              } else {
                return o
              }
            }
          )

          this.setState({
            article_collections: newArticleCollection,
            isOpen: false,
            editCollection: null
          })
        },
        error: () => {
        }
      }
    )
  };

  handleRemove = (_item) => {
    // confirm
  };

  getCollections = (_e) => {
    graphql(
      ARTICLE_COLLECTIONS,
      {
        appKey: this.props.app.key,
        lang: this.state.lang
      },
      {
        success: (data) => {
          this.setState({
            article_collections: data.app.collections
          })
        },
        error: () => {}
      }
    )
  };

  openEdit = (collection) => {
    this.setState({
      editCollection: collection,
      isOpen: true
    })
  };

  requestDelete = (item) => {
    this.setState({
      itemToDelete: item
    })
  };

  submitDelete = () => {
    graphql(
      ARTICLE_COLLECTION_DELETE,
      {
        appKey: this.props.app.key,
        id: this.state.itemToDelete.id
      },
      {
        success: (data) => {
          const col = data.articleCollectionDelete.collection
          const newCollection = this.state.article_collections.filter(
            (o) => o.id != col.id
          )

          this.setState({
            openConfirm: false,
            itemToDelete: null,
            article_collections: newCollection
          })
        }
      }
    )
  };

  handleLangChange = (o) => {
    this.setState(
      {
        lang: o
      },
      this.getCollections
    )
  };

  closeItemToDelete = () => {
    this.setState({
      itemToDelete: null
    })
  };

  onSortEnd = (oldIndex, newIndex)=> {
    const op1 = this.state.article_collections[oldIndex]
    const op2 = this.state.article_collections[newIndex]

    graphql(ARTICLE_COLLECTION_REORDER,
      {
        appKey: this.props.app.key,
        id: op1.id + "",
        idAfter: op2.id + ""
      },

      {
        success: (_res) => { this.props.dispatch(successMessage('reordered correctly')) },
        error: (_res) => { 
          this.props.dispatch(errorMessage('reordered error')) 
        }
      }
    )

    this.setState(
      {
        article_collections: arrayMove(
          this.state.article_collections, oldIndex, newIndex
        )
      }
    )

    setTimeout(() => {

    }, 2000)
  }


  uploadHandler = (file) => {
    getFileMetadata(file).then((input) => {
      graphql(CREATE_DIRECT_UPLOAD, input, {
        success: (data) => {
          const {
            signedBlobId,
            headers,
            url,
            //serviceUrl
          } = data.createDirectUpload.directUpload

          directUpload(url, JSON.parse(headers), file).then(() => {
            this.setState({
              editCollection: {...this.state.editCollection, uploadedIcon: signedBlobId }
            }, this.submitEdit )
          })
        },
        error: (error) => {
        }
      })
    })
  };

  render () {
    const { isOpen, editCollection, itemToDelete } = this.state
    const { app } = this.props
    return (
      <React.Fragment>
        <ContentHeader
          title={I18n.t('articles.collections')}
          breadcrumbs={[
            {
              title: I18n.t('articles.help_center'),
              to: `/apps/${app.key}/articles`
            },
            {
              title: I18n.t('articles.collections'),
              to: `/apps/${app.key}/articles/collections`
            }
          ]}
        />

        <div>
          <div className="flex flex-row justify-end items-center mb-4">
            <Button
              variant="flat-dark"
              color="primary"
              onClick={this.displayDialog}
            >
              {I18n.t('articles.new_collection')}
            </Button>
          </div>

          <FormDialog
            open={isOpen}
            handleClose={this.close}
            titleContent={editCollection ? I18n.t('articles.edit_collection') : I18n.t('articles.new_collection')}
            formComponent={
              <form>


                <div className="flex justify-start items-center">
                  {editCollection && editCollection.icon && 
                    <img src={editCollection.icon} className="w-32 mr-2 mt-4"/>
                  }

                  <TextField
                    type="upload"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={(comp)=> this.fileInput = comp }
                    textHelper={'squared images will be optimal resized'}
                    handler={ (file) => this.uploadHandler(file, 'icon') }
                  />
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  square images preferred (min size 200x200px)
                </p>
                
                <TextField
                  id="collection-title"
                  // label="Name"
                  type={'text'}
                  placeholder={I18n.t('articles.create.placeholder')}
                  inputProps={{
                    style: {
                      fontSize: '1.4em'
                    }
                  }}
                  // helperText="Full width!"
                  ref={(ref) => {
                    this.titleRef = ref
                  }}
                  defaultValue={editCollection ? editCollection.title : null}
                  margin="normal"
                />

                <TextField
                  id="collection-description"
                  // label="Description"
                  type={'textarea'}
                  placeholder={I18n.t('articles.create.description')}
                  // helperText="Full width!"
                  multiline
                  ref={(ref) => {
                    this.descriptionRef = ref
                  }}
                  defaultValue={
                    editCollection ? editCollection.description : null
                  }
                  margin="normal"
                />
              </form>
            }
            dialogButtons={
              <React.Fragment>
                <Button onClick={this.close} variant="outlined">
                  {I18n.t('common.cancel')}
                </Button>

                <Button
                  onClick={
                    editCollection
                      ? this.submitEdit.bind(this)
                      : this.submitCreate.bind(this)
                  }
                  className="mr-1"
                >
                  {editCollection ? I18n.t('common.update') : I18n.t('common.create') }
                </Button>
              </React.Fragment>
            }
          />

          {itemToDelete ? (
            <FormDialog
              open={true}
              handleClose={this.closeItemToDelete}
              // contentText={"lipsum"}
              titleContent={I18n.t('common.confirm_deletion')}
              formComponent={<p>are you ready to delete ?</p>}
              dialogButtons={
                <React.Fragment>
                  <Button onClick={this.closeItemToDelete}
                    variant="outlined">
                    {I18n.t('common.cancel')}
                  </Button>

                  <Button onClick={this.submitDelete}
                    className="mr-1">
                    {I18n.t('common.remove')}
                  </Button>
                </React.Fragment>
              }
            />
          ) : null}

          <ScrollableTabsButtonForce
            // tabs={this.props.settings.availableLanguages}
            tabs={this.props.settings.availableLanguages.map((o) =>
              langs.find((lang) => lang.value === o)
            )}
            changeHandler={(index) =>
              this.handleLangChange(
                this.props.settings.availableLanguages[index]
              )
            }
          />

          <div className="py-4">

          {this.state.article_collections.length > 0 && (
            <Table
              meta={{}}
              data={this.state.article_collections}
              title={I18n.t('task_bots.title')}
              defaultHiddenColumnNames={[]}
              search={this.getCollections}
              sortable={true}
              onSort={this.onSortEnd}
              columns={[
                {
                  field: 'name',
                  title: I18n.t('definitions.bot_tasks.name.label'),
                  render: (row) =>
                    row && (
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                        <div className="flex items-center">
                          {row.id && (
                            <div className="flex ">
                              { row.icon && 
                                <img className="w-10 mr-2" src={row.icon} />
                              }
                              <span className="leading-5">
                                
                                <Link
                                  className={'classes.routeLink'}
                                  color={'primary'}
                                  to={`/apps/${this.props.app.key}/articles/collections/${row.id}`}
                                  >
                                  <p className="text-lg font-bold text-md">
                                    {row.title}
                                  </p>
                                  <p className="text-sm text-gray-400">{row.description}</p>
                                </Link>
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    )
                },
                {
                  field: 'actions',
                  title: I18n.t('definitions.bot_tasks.actions.label'),
                  render: (row) => (
                    <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                      <div className="flex items-center">
                        {row.id && (
                          <div>
                            <Button
                              className="mr-2"
                              variant="outlined"
                              color="primary"
                              onClick={() => this.openEdit(row)}>
                              {I18n.t('common.edit')}
                            </Button>
                            <Button
                              variant="danger"
                              color="primary"
                              onClick={() => this.requestDelete(row)}
                            >
                              {I18n.t('common.delete')}
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                  )
                }
              ]}
            ></Table>
          )}
          </div>

        </div>
      </React.Fragment>
    )
  }
}

function mapStateToProps (state) {
  const { auth, app } = state
  const { isAuthenticated } = auth
  // const { sort, filter, collection , meta, loading} = conversations

  return {
    app,
    isAuthenticated
  }
}

// export default withRouter(connect(mapStateToProps)(withStyles(styles)(ArticlesNew)))
// export default withRouter(connect(mapStateToProps)(Collections))
export default withRouter(connect(mapStateToProps)(Collections))
