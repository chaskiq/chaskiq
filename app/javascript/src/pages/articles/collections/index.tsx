import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';

import I18n from '../../../shared/FakeI18n';

import Button from '@chaskiq/components/src/components/Button';
import TextField from '@chaskiq/components/src/components/forms/Input';
import ContentHeader from '@chaskiq/components/src/components/PageHeader';
import FormDialog from '@chaskiq/components/src/components/FormDialog';
import ScrollableTabsButtonForce from '@chaskiq/components/src/components/scrollingTabs';
import Table from '@chaskiq/components/src/components/Table';
import {
  getFileMetadata,
  directUpload,
} from '@chaskiq/components/src/components/fileUploader';

import { arrayMove } from 'react-sortable-hoc';
import langs from '../../../shared/langsOptions';

import graphql from '@chaskiq/store/src/graphql/client';

import {
  setCurrentPage,
  setCurrentSection,
} from '@chaskiq/store/src/actions/navigation';

import {
  errorMessage,
  successMessage,
} from '@chaskiq/store/src/actions/status_messages';

import {
  ARTICLE_COLLECTION_CREATE,
  ARTICLE_COLLECTION_EDIT,
  ARTICLE_COLLECTION_DELETE,
  ARTICLE_COLLECTION_REORDER,
  CREATE_DIRECT_UPLOAD,
} from '@chaskiq/store/src/graphql/mutations';

import { ARTICLE_COLLECTIONS } from '@chaskiq/store/src/graphql/queries';

type CollectionsProps = {
  app: any;
  dispatch: (val: any) => void;
  settings: any;
};
type CollectionsState = {
  isOpen: boolean;
  article_collections: any;
  editCollection: any;
  openConfirm: boolean;
  languages: any;
  lang: string;
  itemToDelete: any;
};
class Collections extends Component<CollectionsProps, CollectionsState> {
  fileInput: any;

  state = {
    isOpen: false,
    article_collections: [],
    editCollection: null,
    openConfirm: false,
    languages: [],
    lang: 'en',
    itemToDelete: null,
  };

  titleRef = null;
  descriptionRef = null;

  componentDidMount() {
    this.getCollections();
    this.props.dispatch(setCurrentSection('HelpCenter'));

    this.props.dispatch(setCurrentPage('Collections'));
  }

  submitAssignment = () => {};

  close = () => {
    this.setState({ isOpen: false, editCollection: null });
  };

  displayDialog = (_e) => {
    this.setState({ isOpen: true });
  };

  submitCreate = (_e) => {
    graphql(
      ARTICLE_COLLECTION_CREATE,
      {
        appKey: this.props.app.key,
        title: this.titleRef.value,
        description: this.descriptionRef.value,
      },
      {
        success: (data) => {
          const col = data.articleCollectionCreate.collection;
          this.setState({
            article_collections: this.state.article_collections.concat(col),
            isOpen: false,
          });
        },
        error: () => {},
      }
    );
  };

  submitEdit = () => {
    graphql(
      ARTICLE_COLLECTION_EDIT,
      {
        appKey: this.props.app.key,
        title: this.titleRef.value,
        description: this.descriptionRef.value,
        id: this.state.editCollection.id,
        lang: this.state.lang,
        icon: this.state.editCollection.uploadedIcon,
      },
      {
        success: (data) => {
          const col = data.articleCollectionEdit.collection;
          const newArticleCollection = this.state.article_collections.map(
            (o) => {
              if (o.id === col.id) {
                return col;
              } else {
                return o;
              }
            }
          );

          this.setState({
            article_collections: newArticleCollection,
            isOpen: false,
            editCollection: null,
          });
        },
        error: () => {},
      }
    );
  };

  handleRemove = (_item) => {
    // confirm
  };

  getCollections = () => {
    graphql(
      ARTICLE_COLLECTIONS,
      {
        appKey: this.props.app.key,
        lang: this.state.lang,
      },
      {
        success: (data) => {
          this.setState({
            article_collections: data.app.collections,
          });
        },
        error: () => {},
      }
    );
  };

  openEdit = (collection) => {
    this.setState({
      editCollection: collection,
      isOpen: true,
    });
  };

  requestDelete = (item) => {
    this.setState({
      itemToDelete: item,
    });
  };

  submitDelete = () => {
    graphql(
      ARTICLE_COLLECTION_DELETE,
      {
        appKey: this.props.app.key,
        id: this.state.itemToDelete.id,
      },
      {
        success: (data) => {
          const col = data.articleCollectionDelete.collection;
          const newCollection = this.state.article_collections.filter(
            (o) => o.id != col.id
          );

          this.setState({
            openConfirm: false,
            itemToDelete: null,
            article_collections: newCollection,
          });
        },
      }
    );
  };

  handleLangChange = (o) => {
    this.setState(
      {
        lang: o,
      },
      this.getCollections
    );
  };

  closeItemToDelete = () => {
    this.setState({
      itemToDelete: null,
    });
  };

  onSortEnd = (oldIndex, newIndex) => {
    const op1 = this.state.article_collections[oldIndex];
    const op2 = this.state.article_collections[newIndex];

    graphql(
      ARTICLE_COLLECTION_REORDER,
      {
        appKey: this.props.app.key,
        id: op1.id + '',
        idAfter: op2.id + '',
      },

      {
        success: (_res) => {
          this.props.dispatch(
            successMessage(I18n.t('articles.reordered_success'))
          );
        },
        error: (_res) => {
          this.props.dispatch(errorMessage(I18n.t('articles.reordered_error')));
        },
      }
    );

    this.setState({
      article_collections: arrayMove(
        this.state.article_collections,
        oldIndex,
        newIndex
      ),
    });

    setTimeout(() => {}, 2000);
  };

  uploadHandler = (file) => {
    getFileMetadata(file).then((input) => {
      graphql(CREATE_DIRECT_UPLOAD, input, {
        success: (data) => {
          const {
            signedBlobId,
            headers,
            url,
            //serviceUrl
          } = data.createDirectUpload.directUpload;

          directUpload(url, JSON.parse(headers), file).then(() => {
            this.setState(
              {
                editCollection: {
                  ...this.state.editCollection,
                  uploadedIcon: signedBlobId,
                },
              },
              this.submitEdit
            );
          });
        },
        error: (_error) => {},
      });
    });
  };

  render() {
    const { isOpen, editCollection, itemToDelete } = this.state;
    const { app } = this.props;
    return (
      <React.Fragment>
        <ContentHeader
          title={I18n.t('articles.collections')}
          breadcrumbs={[
            {
              title: I18n.t('articles.help_center'),
              to: `/apps/${app.key}/articles`,
            },
            {
              title: I18n.t('articles.collections'),
              to: `/apps/${app.key}/articles/collections`,
            },
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
            titleContent={
              editCollection
                ? I18n.t('articles.edit_collection')
                : I18n.t('articles.new_collection')
            }
            formComponent={
              <form>
                <div className="flex justify-start items-start flex-col">
                  {editCollection && editCollection.icon && (
                    <img src={editCollection.icon} className="w-32 mr-2 mt-4" />
                  )}

                  {editCollection && (
                    <>
                      <TextField
                        type="upload"
                        accept="image/*"
                        hideImage={false}
                        label={I18n.t('common.image')}
                        style={{ display: 'none' }}
                        ref={(comp) => (this.fileInput = comp)}
                        helperText={I18n.t('articles.square_preferred_hint')}
                        handler={(file) => this.uploadHandler(file)}
                      />
                      <p className="text-sm text-gray-500 mb-3">
                        {I18n.t('articles.square_preferred')}
                      </p>
                    </>
                  )}
                </div>

                <TextField
                  id="collection-title"
                  // label="Name"
                  type={'text'}
                  placeholder={I18n.t('articles.create.placeholder')}
                  // helperText="Full width!"
                  ref={(ref) => {
                    this.titleRef = ref;
                  }}
                  defaultValue={editCollection ? editCollection.title : null}
                />

                <TextField
                  id="collection-description"
                  type={'textarea'}
                  placeholder={I18n.t('articles.create.description')}
                  ref={(ref) => {
                    this.descriptionRef = ref;
                  }}
                  defaultValue={
                    editCollection ? editCollection.description : null
                  }
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
                  {editCollection
                    ? I18n.t('common.update')
                    : I18n.t('common.create')}
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
              formComponent={<p>{I18n.t('common.confirm_deletion_ready')}</p>}
              dialogButtons={
                <React.Fragment>
                  <Button onClick={this.closeItemToDelete} variant="outlined">
                    {I18n.t('common.cancel')}
                  </Button>

                  <Button onClick={this.submitDelete} className="mr-1">
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
                search={this.getCollections}
                sortable={true}
                onSort={this.onSortEnd}
                columns={[
                  {
                    field: 'name',
                    title: I18n.t('definitions.bot_tasks.name.label'),
                    render: (row) =>
                      row && (
                        <div className="flex items-center">
                          {row.id && (
                            <div className="flex ">
                              {row.icon && (
                                <img className="w-10 mr-2" src={row.icon} />
                              )}
                              <span className="leading-5">
                                <Link
                                  className={'classes.routeLink'}
                                  color={'primary'}
                                  to={`/apps/${this.props.app.key}/articles/collections/${row.id}`}
                                >
                                  <p className="text-lg font-bold text-md">
                                    {row.title}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    {row.description}
                                  </p>
                                </Link>
                              </span>
                            </div>
                          )}
                        </div>
                      ),
                  },
                  {
                    field: 'actions',
                    title: I18n.t('definitions.bot_tasks.actions.label'),
                    render: (row) => (
                      <div className="flex items-center">
                        {row.id && (
                          <div>
                            <Button
                              className="mr-2"
                              variant="outlined"
                              color="primary"
                              onClick={() => this.openEdit(row)}
                            >
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
                    ),
                  },
                ]}
              ></Table>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const { auth, app } = state;
  const { isAuthenticated } = auth;
  // const { sort, filter, collection , meta, loading} = conversations

  return {
    app,
    isAuthenticated,
  };
}

// export default withRouter(connect(mapStateToProps)(withStyles(styles)(ArticlesNew)))
// export default withRouter(connect(mapStateToProps)(Collections))
export default withRouter(connect(mapStateToProps)(Collections));
