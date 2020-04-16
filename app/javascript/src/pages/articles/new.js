import PropTypes from "prop-types";
import React, { Component } from "react";
import { withRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import Avatar from "../../components/Avatar";
import Button, { DropdownButton } from "../../components/Button";
import Input from "../../components/forms/Input";
import ContentHeader from "../../components/PageHeader";
import FilterMenu from "../../components/FilterMenu";
import Tabs from "../../components/Tabs";
import ArticleEditor from "./editor";

import graphql from "../../graphql/client";

import {
  CREATE_ARTICLE,
  EDIT_ARTICLE,
  ARTICLE_BLOB_ATTACH,
  TOGGLE_ARTICLE,
  ARTICLE_ASSIGN_AUTHOR,
  ARTICLE_COLLECTION_CHANGE,
} from "../../graphql/mutations";

import { ARTICLE, AGENTS, ARTICLE_COLLECTIONS } from "../../graphql/queries";

//import SuggestSelect from '../../components/forms/suggestSelect'

import { AnchorLink } from "../../shared/RouterLink";
import { GestureIcon, CheckCircle } from "../../components/icons";
//import GestureIcon from '@material-ui/icons/Gesture'
//import CheckCircle from '@material-ui/icons/CheckCircle'
//import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import { setCurrentSection, setCurrentPage } from "../../actions/navigation";
import langs from "../../shared/langsOptions";

import { errorMessage, successMessage } from "../../actions/status_messages";
import styled from "@emotion/styled";

const options = [
  {
    name: "Published",
    description: "shows article on the help center",
    icon: <CheckCircle />,
    id: "published",
    state: "published",
  },
  {
    name: "Draft",
    description: "hides the article on the help center",
    icon: <GestureIcon />,
    id: "draft",
    state: "draft",
  },
];

const styles = (theme) => ({
  addUser: {
    marginRight: theme.spacing(1),
  },
  paper: {
    /*margin: '9em',
    padding: '1em',
    marginTop: '1.5em',
    paddingBottom: '6em'*/
    //margin: theme.spacing(2)
  },
});

const ArticleAuthorControls = styled.div`
  display: flex;
  align-items: center;
  margin-top: 2em;
  margin-bottom: 2em;
  @media (min-width: 320px) and (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

class ArticlesNew extends Component {
  state = {
    currentContent: null,
    content: null,
    article: {},
    changed: false,
    loading: true,
    agents: [],
    collections: [],
    lang: "en",
  };

  titleRef = null;
  descriptionRef = null;
  switch_ref = null;

  componentDidMount() {
    if (this.props.match.params.id !== "new") {
      this.getArticle(this.props.match.params.id);
    } else {
      this.setState({
        loading: false,
      });
    }

    this.getAgents();
    this.getCollections();

    this.props.dispatch(setCurrentSection("HelpCenter"));

    this.props.dispatch(setCurrentPage("Articles"));
  }

  componentDidUpdate(prevProps, prevState) {
    // maybe do this ony with content and submit
    //checkbox and agent directly and independently from content
    if (prevState.content !== this.state.content) {
      this.registerChange();
    }
  }

  registerChange = () => {
    this.setState({
      changesAvailable: true,
    });
  };

  getCollections = () => {
    graphql(
      ARTICLE_COLLECTIONS,
      {
        appKey: this.props.app.key,
      },
      {
        success: (data) => {
          this.setState({
            collections: data.app.collections,
          });
        },
      }
    );
  };

  getArticle = (id) => {
    graphql(
      ARTICLE,
      {
        appKey: this.props.app.key,
        id: id,
        lang: this.state.lang,
      },
      {
        success: (data) => {
          this.setState({
            article: data.app.article,
            loading: false,
          });
        },
        error: () => {
          debugger;
        },
      }
    );
  };

  updateUrlFromNew = () => {
    this.props.history.push(
      `/apps/${this.props.app.key}/articles/${this.state.article.id}`
    );
  };

  getAgents = () => {
    graphql(
      AGENTS,
      {
        appKey: this.props.app.key,
      },
      {
        success: (data) => {
          this.setState({
            agents: data.app.agents,
          });
        },
        error: () => {},
      }
    );
  };

  createArticle = () => {
    graphql(
      CREATE_ARTICLE,
      {
        appKey: this.props.app.key,
        title: this.titleRef.value,
        content: this.state.content,
      },
      {
        success: (data) => {
          const article = data.createArticle.article;
          this.setState(
            {
              article: article,
              changesAvailable: false,
            },
            () => {
              this.updateUrlFromNew();
              this.updatedMessage();
            }
          );
        },
        error: () => {
          this.errorMessage();
        },
      }
    );
  };

  editArticle = () => {
    graphql(
      EDIT_ARTICLE,
      {
        appKey: this.props.app.key,
        title: this.titleRef.value,
        description: this.descriptionRef.value,
        id: this.state.article.id,
        content: this.state.content,
        lang: this.state.lang,
      },
      {
        success: (data) => {
          const article = data.editArticle.article;
          this.setState(
            {
              article: article,
              changesAvailable: false,
            },
            () => {
              this.updatedMessage();
            }
          );
        },
        error: (e) => {
          this.errorMessage();
        },
      }
    );
  };

  updatedMessage = () => {
    this.props.dispatch(successMessage("article updated"));
  };
  errorMessage = () => {
    this.props.dispatch(successMessage("article error on save"));
  };

  submitChanges = () => {
    console.log(this.state.article);
    this.setState(
      {
        changesAvailable: false,
      },
      () => {
        if (this.state.article.id) {
          this.editArticle();
        } else {
          this.createArticle();
        }
      }
    );
  };

  toggleButton = (clickHandler) => {
    const stateColor =
      this.state.article.state === "published" ? "primary" : "secondary";
    return (
      <div variant="outlined" color={stateColor}>
        <DropdownButton
          onClick={clickHandler}
          label={this.state.article.state}
          icon={
            this.state.article.state === "published" ? (
              <CheckCircle />
            ) : (
              <GestureIcon />
            )
          }
        />
      </div>
    );
  };

  togglePublishState = (state) => {
    const val = state.state;
    graphql(
      TOGGLE_ARTICLE,
      {
        appKey: this.props.app.key,
        id: this.state.article.id,
        state: val,
      },
      {
        success: (data) => {
          this.setState({ article: data.toggleArticle.article }, () => {
            this.updatedMessage();
          });
        },
        error: () => {
          this.errorMessage();
        },
      }
    );
  };

  handleAuthorchange = (input) => {
    graphql(
      ARTICLE_ASSIGN_AUTHOR,
      {
        appKey: this.props.app.key,
        authorId: input.value,
        id: this.state.article.id,
      },
      {
        success: (data) => {
          this.setState(
            {
              article: data.assignAuthor.article,
            },
            () => {
              this.updatedMessage();
            }
          );
        },
        error: () => {
          this.errorMessage();
        },
      }
    );
  };

  handleCollectionChange = (input) => {
    graphql(
      ARTICLE_COLLECTION_CHANGE,
      {
        appKey: this.props.app.key,
        collectionId: input.value,
        id: this.state.article.id,
      },
      {
        success: (data) => {
          this.setState(
            {
              article: data.changeCollectionArticle.article,
            },
            () => {
              this.updatedMessage();
            }
          );
        },
        error: () => {
          this.errorMessage();
        },
      }
    );
  };

  updateState = (data) => {
    this.setState(data);
  };

  uploadHandler = ({ serviceUrl, signedBlobId, imageBlock }) => {
    graphql(
      ARTICLE_BLOB_ATTACH,
      {
        appKey: this.props.app.key,
        id: parseInt(this.state.article.id),
        blobId: signedBlobId,
      },
      {
        success: (data) => {
          imageBlock.uploadCompleted(serviceUrl);
        },
        error: (err) => {
          console.log("error on direct upload", err);
        },
      }
    );
  };

  handleLangChange = (lang) => {
    if (!lang) return;
    if (!this.state.article.id) return;
    this.setState(
      {
        lang: lang,
        loading: true,
      },
      () => this.getArticle(this.state.article.id)
    );
  };

  handleInputChange = (e) => {
    this.registerChange();
  };

  render() {
    const { classes, app } = this.props;
    return (
      <React.Fragment>
        <ContentHeader
          //title={ 'Help Center Settings' }
          breadcrumbs={[
            {
              to: `/apps/${app.key}/articles`,
              title: "Help Center",
            },
            {
              to: "",
              title: this.state.article.title,
            },
          ]}
        />

        <div container justify={"center"} spacing={4}>
          <div item xs={12} sm={10}>
            <div square={true} elevation={1}>
              <div m={2}>
                <div mb={2}>
                  <Tabs
                    scrollButtons="on"
                    //tabs={this.props.settings.availableLanguages}
                    tabs={this.props.settings.availableLanguages.map((o) =>
                      langs.find((lang) => lang.value === o)
                    )}
                    onChange={(index) => {
                      this.handleLangChange(
                        this.props.settings.availableLanguages[index]
                      );
                    }}
                  />
                </div>

                {!this.state.loading && (
                  <React.Fragment>
                    <div className="flex justify-between items-end py-4">
                      <Button
                        variant="contained"
                        onClick={this.submitChanges}
                        disabled={!this.state.changesAvailable}
                        color={"primary"}
                      >
                        Save
                      </Button>

                      <FilterMenu
                        options={options}
                        value={this.state.article.state}
                        filterHandler={this.togglePublishState}
                        triggerButton={this.toggleButton}
                        position={'right'}
                      />
                    </div>

                    <Input
                      id="article-title"
                      type={"text"}
                      //label="Name"
                      placeholder={"Type articles's title"}
                      inputProps={{
                        style: {
                          fontSize: "2.4em",
                        },
                      }}
                      //helperText="Full width!"
                      fullWidth
                      ref={(ref) => {
                        this.titleRef = ref;
                      }}
                      defaultValue={this.state.article.title}
                      margin="normal"
                      onChange={this.handleInputChange}
                    />

                    <Input
                      id="article-description"
                      type={"textarea"}
                      //label="Description"
                      placeholder={"Describe your article to help it get found"}
                      //helperText="Full width!"
                      fullWidth
                      multiline
                      ref={(ref) => {
                        this.descriptionRef = ref;
                      }}
                      defaultValue={this.state.article.description}
                      margin="normal"
                      onChange={this.handleInputChange}
                    />
                  </React.Fragment>
                )}

                {!this.state.loading && this.state.article.author && (
                  <div className="flex">
                    {this.state.agents.length > 0 && (
                      <div className="flex items-center">
                        <Avatar src={this.state.article.author.avatarUrl} />

                        <strong className="m-2">written by</strong>

                        {/*
                          <SuggestSelect 
                          name={"author"}
                          placeholder={"select author"}
                          data={this.state.agents.map((o)=> ({ 
                              label: o.name || o.email, 
                              value: o.email 
                            }) 
                          )}
                          handleSingleChange={this.handleAuthorchange }
                          defaultData={this.state.article.author.email}
                          />
                        */}

                        <Input
                          type={"select"}
                          className="m-2 w-32"
                          options={this.state.agents.map((o) => ({
                            label: o.name || o.email,
                            value: o.email,
                          }))}
                          data={{}}
                          name={"author"}
                          placeholder={"select author"}
                          onChange={this.handleAuthorchange}
                          defaultData={this.state.article.author.email}
                        ></Input>
                      </div>
                    )}

                    <div className="flex items-center">
                      <strong className="m-2">In</strong>

                      {/*<SuggestSelect 
                      name={"collection"}
                      placeholder={"select collection"}
                      data={this.state.collections.map((o)=> ({ 
                          label: o.title, 
                          value: o.id 
                        }) 
                      )}
                      handleSingleChange={ this.handleCollectionChange }

                      defaultData={
                        this.state.article.collection ? 
                        this.state.article.collection.id : null
                      }
                    />*/}

                      <Input
                        type={"select"}
                        options={this.state.collections.map((o) => ({
                          label: o.title,
                          value: o.id,
                        }))}
                        data={{}}
                        className={"m-2 w-32"}
                        name={"collection"}
                        placeholder={"select collection"}
                        onChange={this.handleCollectionChange}
                        defaultValue={
                          this.state.article.collection
                            ? this.state.article.collection.id
                            : null
                        }
                      ></Input>
                    </div>
                  </div>
                )}

                <div className="relative z-0 p-6 shadow bg-yellow rounded">
                  {!this.state.loading && (
                    <ArticleEditor
                      article={this.state.article}
                      data={this.props.data}
                      app={this.props.app}
                      updateState={this.updateState}
                      loading={false}
                      uploadHandler={this.uploadHandler}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
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

export default withRouter(connect(mapStateToProps)(ArticlesNew));
