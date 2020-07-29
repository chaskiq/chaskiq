import React, { Component } from "react";
import { withRouter, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";

import Button from "../../../components/Button";
import TextField from "../../../components/forms/Input";
import List, { ListItem, ListItemText } from "../../../components/List";
import CircularProgress from "../../../components/Progress";
import Input from "../../../components/forms/Input";
import ContentHeader from "../../../components/PageHeader";
import { AnchorLink } from "../../../shared/RouterLink";

import FormDialog from "../../../components/FormDialog";
import { setCurrentSection, setCurrentPage } from "../../../actions/navigation";

import ScrollableTabsButtonForce from "../../../components/scrollingTabs";
import langs from "../../../shared/langsOptions";

import graphql from "../../../graphql/client";
import {
  ARTICLE_COLLECTION_CREATE,
  ARTICLE_COLLECTION_EDIT,
  ARTICLE_COLLECTION_DELETE,
  ARTICLE_SECTION_CREATE,
  ARTICLE_SECTION_DELETE,
  REORDER_ARTICLE,
  ADD_ARTICLES_TO_COLLECTION,
  ARTICLE_SECTION_EDIT,
} from "../../../graphql/mutations";

import {
  ARTICLE_COLLECTIONS,
  ARTICLE_COLLECTION,
  ARTICLE_COLLECTION_WITH_SECTIONS,
  ARTICLES_UNCATEGORIZED,
} from "../../../graphql/queries";

import Dnd from "./dnd";

class CollectionDetail extends Component {
  state = {
    isOpen: false,
    addArticlesDialog: false,
    collection: null,
    lang: "en",
    languages: ["es", "en"],
    editSection: null,
  };

  titleRef = null;
  descriptionRef = null;

  componentDidMount() {
    this.getCollection();
    this.props.dispatch(setCurrentSection("HelpCenter"));

    this.props.dispatch(setCurrentPage("Collections"));
  }

  getCollection = () => {
    graphql(
      ARTICLE_COLLECTION_WITH_SECTIONS,
      {
        appKey: this.props.app.key,
        id: this.props.match.params.id,
        lang: this.state.lang,
      },
      {
        success: (data) => {
          this.setState({
            collection: data.app.collection,
            loading: false,
          });
        },
        error: () => {},
      }
    );
  };

  close = () => this.setState({ isOpen: false });

  openNewDialog = () => {
    this.setState({
      isOpen: true,
      editSection: null,
    });
  };

  handleDataUpdate = (data) => {
    this.setState({
      collection: Object.assign({}, this.state.collection, { sections: data }),
    });
  };

  allCollections = () => {
    const { collection } = this.state;
    const baseSection = {
      id: "base",
      title: "base section",
      articles: collection.baseArticles,
    };

    // just concat base section if it's not present
    if (collection.sections.find((o) => o.id === "base")) {
      return collection.sections;
    } else {
      return [baseSection].concat(collection.sections);
    }
  };

  saveOperation = (options) => {
    const params = Object.assign({}, options, { appKey: this.props.app.key });
    graphql(REORDER_ARTICLE, params, {
      success: (data) => {},
      error: () => {},
    });
  };

  addArticlesToSection = (section) => {
    this.setState({
      addArticlesDialog: true,
    });
  };

  requestUpdate = (section) => {
    this.setState({
      isOpen: true,
      editSection: section,
    });
  };

  renderCollection = () => {
    const { collection } = this.state;

    return (
      <div className="py-4">
        {collection && (
          <div className="flex flex-col">
            <h2 className="text-4xl leading-6 font-bold text-gray-900 pb-4">
              {collection.title}
            </h2>

            <p className="max-w-xl text-lg leading-5 text-gray-500 mb-4">
              {collection.description}
            </p>

            <div className="self-end">
              <Button
                variant="contained"
                color={"primary"}
                onClick={this.openNewDialog}>
                {I18n.t("articles.new_section")}
              </Button>
            </div>

            <Dnd
              sections={this.allCollections()}
              handleDataUpdate={this.handleDataUpdate}
              deleteSection={this.deleteSection}
              collectionId={collection.id}
              saveOperation={this.saveOperation}
              requestUpdate={this.requestUpdate}
              addArticlesToSection={this.addArticlesToSection}
            />
          </div>
        )}
      </div>
    );
  };

  deleteSection = (section) => {
    graphql(
      ARTICLE_SECTION_DELETE,
      {
        appKey: this.props.app.key,
        id: `${section.id}`,
      },
      {
        success: (data) => {
          const section = data.articleSectionDelete.section;
          const newSections = this.state.collection.sections.filter(
            (o) => o.id != section.id
          );

          this.setState({
            collection: Object.assign({}, this.state.collection, {
              sections: newSections,
            }),
          });
        },
        error: () => {},
      }
    );
  };

  submitCreate = () => {
    const { collection } = this.state;
    graphql(
      ARTICLE_SECTION_CREATE,
      {
        appKey: this.props.app.key,
        collectionId: collection.id,
        title: this.titleRef.value,
        lang: this.state.lang,
        description: this.descriptionRef.value,
      },
      {
        success: (data) => {
          const section = data.articleSectionCreate.section;
          const sections = this.state.collection.sections.concat(section);

          this.setState({
            collection: Object.assign({}, this.state.collection, {
              sections: sections,
            }),
            isOpen: false,
          });
        },
        error: () => {},
      }
    );
  };

  submitEdit = () => {
    const { collection } = this.state;
    graphql(
      ARTICLE_SECTION_EDIT,
      {
        appKey: this.props.app.key,
        collectionId: collection.id,
        title: this.titleRef.value,
        id: this.state.editSection.id.toString(),
        lang: this.state.lang,
        description: this.descriptionRef.value,
      },
      {
        success: (data) => {
          const section = data.articleSectionEdit.section;
          const sections = this.state.collection.sections.map((o) => {
            if (o.id === section.id) {
              return Object.assign({}, o, section);
            } else {
              return o;
            }
          });

          this.setState({
            collection: Object.assign({}, this.state.collection, {
              sections: sections,
            }),
            isOpen: false,
            submitEdit: null,
          });
        },
        error: () => {},
      }
    );
  };

  renderDialog = () => {
    const { isOpen, editSection } = this.state;
    return (
      <FormDialog
        open={isOpen}
        handleClose={this.close}
        //contentText={"lipsum"}
        titleContent={"New Section"}
        formComponent={
          <form ref="form">
            <TextField
              id="collection-title"
              //label="Name"
              type="text"
              placeholder={I18n.t("articles.title_placeholder")}
              inputProps={{
                style: {
                  fontSize: "1.4em",
                },
              }}
              //helperText="Full width!"
              fullWidth
              ref={(ref) => {
                this.titleRef = ref;
              }}
              defaultValue={editSection ? editSection.title : null}
              margin="normal"
            />

            <TextField
              id="collection-description"
              type="textarea"
              //label="Description"
              placeholder={I18n.t("articles.description_placeholder")}
              //helperText="Full width!"
              fullWidth
              multiline
              ref={(ref) => {
                this.descriptionRef = ref;
              }}
              defaultValue={editSection ? editSection.description : null}
              margin="normal"
            />
          </form>
        }
        dialogButtons={
          <React.Fragment>
            <Button onClick={this.close} variant="outlined">
              {I18n.t("articles.cancel")}
            </Button>

            <Button
              onClick={
                editSection
                  ? this.submitEdit.bind(this)
                  : this.submitCreate.bind(this)
              }
              className="mr-1"
            >
              {I18n.t("common.submit")}
              {/*editCollection ? 'update' : 'create'*/}
            </Button>
          </React.Fragment>
        }
      />
    );
  };

  addArticlesHandlerSubmit = (items) => {
    graphql(
      ADD_ARTICLES_TO_COLLECTION,
      {
        articlesId: items,
        appKey: this.props.app.key,
        collectionId: this.state.collection.id,
      },
      {
        success: (data) => {
          const collection = data.addArticlesToCollection.collection;
          if (collection) {
            this.getCollection();
          }
        },
        error: () => {},
      }
    );
  };

  renderAddToSectionDialog = () => {
    return (
      <AddArticleDialog
        app={this.props.app}
        handleClose={()=> this.setState({addArticlesDialog: false})}
        handleSubmit={this.addArticlesHandlerSubmit}
        isOpen={this.state.addArticlesDialog}
      />
    );
  };

  // TODO refactor
  handleLangChange = (o) => {
    this.setState(
      {
        lang: o,
      },
      this.getCollection
    );
  };

  render() {
    const { classes, app } = this.props;

    return (
      <React.Fragment>
        <ContentHeader
          breadcrumbs={[
            <AnchorLink color="inherit" to={`/apps/${app.key}/articles`}>
              {I18n.t("articles.help_center")}
            </AnchorLink>,
            <AnchorLink
              color="inherit"
              to={`/apps/${app.key}/articles/collections`}
            >
              {I18n.t("articles.collections")}
            </AnchorLink>,
          ]}
        />

        <div square={true} elevation={1}>
          <ScrollableTabsButtonForce
            //tabs={this.props.settings.availableLanguages}
            tabs={this.props.settings.availableLanguages.map((o) =>
              langs.find((lang) => lang.value === o)
            )}
            changeHandler={(index) =>
              this.handleLangChange(
                this.props.settings.availableLanguages[index]
              )
            }
          />

          {this.renderDialog()}

          {this.state.addArticlesDialog
            ? this.renderAddToSectionDialog()
            : null}

          {this.state.loading ? <CircularProgress /> : this.renderCollection()}
        </div>
      </React.Fragment>
    );
  }
}

class AddArticleDialog extends Component {
  state = {
    articles: [],
    isOpen: this.props.isOpen,
  };

  componentDidMount() {
    graphql(
      ARTICLES_UNCATEGORIZED,
      {
        appKey: this.props.app.key,
        page: 1,
        per: 50,
      },
      {
        success: (data) => {
          this.setState({
            articles: data.app.articlesUncategorized.collection,
          });
        },
        error: () => {},
      }
    );
  }

  close = () => {
    this.setState({ isOpen: false }); 
    this.props.handleClose && this.props.handleClose()
  }
  open = () => {
    this.setState({ isOpen: true });
    this.props.handleClose && this.props.handleClose()
  }

  getValues = () => {
    var chk_arr = document.getElementsByName("article[]");
    var chklength = chk_arr.length;
    var arr = [];
    for (let k = 0; k < chklength; k++) {
      if (chk_arr[k].checked) arr.push(chk_arr[k].value);
    }
    return arr;
  };

  render() {
    const { isOpen } = this.state;
    return (
      <FormDialog
        open={isOpen}
        handleClose={this.close}
        //contentText={"lipsum"}
        titleContent={I18n.t("articles.add")}
        formComponent={
          <List>
            {this.state.articles.map((o) => (
              <ListItem>
                <Input
                  type="checkbox"
                  checked={o.id}
                  //onChange={handleChange('checkedA')}
                  value={o.id}
                  name="article[]"
                />

                <ListItemText
                  primary={o.title}
                  secondary={<p noWrap>{o.state}</p>}
                />
              </ListItem>
            ))}
          </List>
        }
        dialogButtons={
          <React.Fragment>
            <Button onClick={this.close} variant="outlined">
              {I18n.t("common.cancel")}
            </Button>

            <Button
              onClick={() => this.props.handleSubmit(this.getValues())}
              className="mr-1"
            >
              {I18n.t("common.submit")}
            </Button>
          </React.Fragment>
        }
      />
    );
  }
}

function mapStateToProps(state) {
  const { auth, app } = state;
  const { isAuthenticated } = auth;
  //const { sort, filter, collection , meta, loading} = conversations

  return {
    app,
    isAuthenticated,
  };
}

export default withRouter(connect(mapStateToProps)(CollectionDetail));
