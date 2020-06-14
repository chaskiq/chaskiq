import PropTypes from "prop-types";
import React, { Component } from "react";

import { withRouter, Route } from "react-router-dom";
import { connect } from "react-redux";

import ContentHeader from "../../components/PageHeader";
import Tabs from "../../components/Tabs";
import Button from "../../components/Button";
import Table from "../../components/Table";
//import Select from '@material-ui/core/Select'

import { getFileMetadata, directUpload } from "../../shared/fileUploader";

//import {Link} from 'react-router-dom'

import graphql from "../../graphql/client";
import { toSnakeCase } from "../../shared/caseConverter";
import FormDialog from "../../components/FormDialog";

import { CREATE_DIRECT_UPLOAD } from "../../graphql/mutations";

import serialize from "form-serialize";

import { setCurrentSection, setCurrentPage } from "../../actions/navigation";
import Content from "../../components/Content";
import langsOptions from "../../shared/langsOptions";
import DeleteDialog from "../../components/DeleteDialog";
import Input from "../../components/forms/Input";
import FieldRenderer, {
  gridClasses,
} from "../../components/forms/FieldRenderer";

function GestureIcon() {
  return <p>icon</p>;
}
function CheckCircleIcon() {
  return <p>icon</p>;
}

class Settings extends Component {
  state = {
    loading: true,
    tabValue: 0,
  };

  titleRef = null;
  descriptionRef = null;
  switch_ref = null;

  componentDidMount() {
    this.props.getSettings(() => this.setState({ loading: false }));
    this.props.dispatch(setCurrentSection("HelpCenter"));

    this.props.dispatch(setCurrentPage("Settings"));
  }

  updateState = (data) => {
    this.setState(data);
  };

  uploadHandler = (file, kind) => {
    getFileMetadata(file).then((input) => {
      graphql(CREATE_DIRECT_UPLOAD, input, {
        success: (data) => {
          const {
            signedBlobId,
            headers,
            url,
            serviceUrl,
          } = data.createDirectUpload.directUpload;

          directUpload(url, JSON.parse(headers), file).then(() => {
            let params = {};
            params[kind] = signedBlobId;
            this.props.update({ settings: params });
          });
        },
        error: (error) => {
          console.log("error on signing blob", error);
        },
      });
    });
  };

  
  definitionsForSettings = () => {
    return [
      {
        name: "subdomain",
        label: I18n.t('definitions.articles.subdomain.label'),
        hint: I18n.t('definitions.articles.subdomain.hint'),
        type: "string",
        grid: { xs: "w-full", sm: "w-1/2" },
      },

      {
        name: "domain",
        hint: I18n.t('definitions.articles.domain.hint'),
        label: I18n.t('definitions.articles.domain.label'),
        type: "string",
        grid: { xs: "w-full", sm: "w-1/2" },
      },
      {
        name: "website",
        hint: I18n.t('definitions.articles.website.hint'),
        label: I18n.t('definitions.articles.website.label'),
        type: "string",
        grid: { xs: "w-full", sm: "w-3/4" },
      },
      {
        name: "googleCode",
        label: I18n.t('definitions.articles.google_code.label'),
        hint: I18n.t('definitions.articles.google_code.hint'),
        type: "string",
        grid: { xs: "w-full", sm: "w-1/4" },
      },
    ];
  };

  definitionsForAppearance = () => {
    return [
      {
        name: "color",
        type: "color",
        handler: (color) => {
          this.props.updateMemSettings({ color: color })
        },
        grid: { xs: "w-full", sm: "w-1/12" },
      },

      {
        name: "logo",
        type: "upload",
        handler: (file) => this.uploadHandler(file, "logo"),
        grid: { xs: "w-full", sm: "w-1/3" },
      },

      {
        name: "header_image",
        type: "upload",
        handler: (file) => this.uploadHandler(file, "header_image"),
        grid: { xs: "w-full", sm: "w-1/3" },
      },

      {
        name: "facebook",
        label: "Facebook",
        startAdornment: "facebook/",
        type: "string",
        grid: { xs: "w-full", sm: "w-1/3" },
      },

      {
        name: "twitter",
        label: "Twitter",
        startAdornment: "twitter/",
        type: "string",
        grid: { xs: "w-full", sm: "w-1/3" },
      },

      {
        name: "linkedin",
        label: "Linkedin",
        startAdornment: "linkedin/",
        type: "string",
        grid: { xs: "w-full", sm: "w-1/3" },
      },

      {
        name: "credits",
        label: I18n.t('definitions.articles.credits.label'), 
        type: "bool",
        hint: I18n.t('definitions.articles.credits.hint'),
        grid: { xs: "w-full", sm: "w-3/4" },
      },
    ];
  };

  definitionsForLang = () => {
    return [
      {
        name: "langs",
        type: "select",
        multiple: true,
        options: langsOptions,
        default: "es",
        hint: "Choose langs",
        grid: { xs: "w-full", sm: "w-3/4" },
      },
    ];
  };

  handleTabChange = (e, i) => {
    this.setState({ tabValue: i });
  };

  tabsContent = () => {
    return (
      <Tabs
        value={this.state.tabValue}
        onChange={this.handleTabChange}
        textColor="inherit"
        tabs={[
          {
            label:  I18n.t('articles.settings.basic'),
            content: (
              <SettingsForm
                title={ I18n.t('articles.settings.general_app')}
                //currentUser={this.props.currentUser}
                data={this.props.settings}
                update={this.props.update.bind(this)}
                errorNamespace={"article_settings."}
                //fetchApp={this.fetchApp}
                //classes={this.props.classes}
                definitions={this.definitionsForSettings}
                errors={this.props.errors}
                {...this.props}
              />
            ),
          },
          {
            label: I18n.t('articles.settings.lang'),
            content: (
              <div className="my-2">
                <div>
                  <p
                    className="text-lg leading-6 font-medium text-gray-900 pb-4"
                    variant="h5"
                  >
                    {I18n.t('articles.settings.lang_title')}
                  </p>

                  <p
                    className="max-w-xl text-sm leading-5 text-gray-500 mb-4"
                    variant="subtitle1"
                  >
                    {I18n.t('articles.settings.lang_desc')}
                  </p>
                </div>

                <LanguageForm
                  title={"Lang"}
                  settings={this.props.settings}
                  //currentUser={this.props.currentUser}
                  data={this.props.settings}
                  deleteLang={this.props.deleteLang.bind(this)}
                  update={this.props.update.bind(this)}
                  //fetchApp={this.fetchApp}
                  //classes={this.props.classes}
                  definitions={this.definitionsForLang}
                  errors={this.state.errors}
                  {...this.props}
                />
              </div>
            ),
          },
          {
            label: I18n.t('articles.settings.appearance'),
            content: (
              <SettingsForm
                title={I18n.t('articles.settings.appearance_settings')}
                //currentUser={this.props.currentUser}
                data={this.props.settings}
                update={this.props.update.bind(this)}
                //fetchApp={this.fetchApp}
                //classes={this.props.classes}
                definitions={this.definitionsForAppearance}
                errors={this.props.errors}
                {...this.props}
              />
            ),
          },
        ]}
      ></Tabs>
    );
  };

  render() {
    return (
      <React.Fragment>
        <ContentHeader
          title={I18n.t('articles.settings.title')}
          /*
          tabsContent={ this.tabsContent() }
          items={
            <React.Fragment>
              {
                this.props.settings && this.props.settings.subdomain ?
                  <div item>
                    <Button href={`https://${this.props.settings.subdomain}.chaskiq.io`}
                      variant="outlined" color="inherit" size="small" target={"blank"}>
                      visit help center
                    </Button>
                  </div> : null 
              }
            </React.Fragment>
          }*/
        />

        {this.tabsContent()}
      </React.Fragment>
    );
  }
}

class SettingsForm extends Component {
  formRef;

  onSubmitHandler = (e) => {
    e.preventDefault();
    const serializedData = serialize(this.formRef, { hash: true, empty: true });
    const data = toSnakeCase(serializedData);
    this.props.update(data);
  };

  render() {
    return (
      <form
        onSubmit={this.onSubmitHandler.bind(this)}
        ref={(form) => {
          this.formRef = form;
        }}
      >
        <div className={"my-2"}>
          <p className="text-lg leading-6 pb-4 font-medium text-gray-900 pb-4">
            {this.props.title}
          </p>

          <div className="flex flex-wrap">
            {this.props.definitions().map((field) => {
              return (
                <div
                  className={`${gridClasses(field)} py-2 pr-2`}
                >
                  <FieldRenderer
                    namespace={"settings"}
                    data={field}
                    type={field.type}
                    handler={field.handler}
                    //errorNamespace={this.props.errorNamespace}
                    props={{ data: this.props.data }}
                    errors={this.props.errors}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div container justify={"space-around"}>
          <Button
            className="mr-2"
            onClick={this.onSubmitHandler.bind(this)}
            variant="contained"
            color="primary"
          >
            {I18n.t('common.save')}
          </Button>

          <Button appearance="subtle" variant={"outlined"} color={"secondary"}>
            {I18n.t('common.cancel')}
          </Button>
        </div>
      </form>
    );
  }
}

function LanguageForm({ settings, update, deleteLang }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedLang, setSelectedLang] = React.useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(null);

  const formRef = React.createRef();

  function handleChange(e) {
    const val = e.value;
    const serializedData = serialize(formRef.current, {
      hash: true,
      empty: true,
    });
    const data = toSnakeCase(serializedData);

    let next = {};
    next[`site_title_${val}`] = "";
    next[`site_description_${val}`] = "";

    const newData = Object.assign({}, data.settings, next);
    update({ settings: newData });
    toggleDialog();
  }

  function renderLangDialog() {
    return (
      isOpen && (
        <FormDialog
          open={isOpen}
          handleClose={() => setIsOpen(false)}
          //contentText={"lipsum"}
          titleContent={I18n.t('articles.settings.add_language_to_help')}
          formComponent={
            //!loading ?
            <form onSubmit={(e) => e.preventDefault()}>
              <Input
                label={I18n.t('articles.settings.select_lang')}
                value={selectedLang}
                onChange={handleChange}
                type={"select"}
                //defaultValue={{label: item.to, value: item.to}}
                name={"age"}
                data={{}}
                options={langsOptions}
              ></Input>
            </form>
            //: <CircularProgress/>
          }
          dialogButtons={
            <React.Fragment>
              <Button onClick={toggleDialog} variant="outlined">
                {I18n.t('common.cancel')}
              </Button>

              <Button //onClick={this.submitAssignment }
                className="mr-1"
              >
                {I18n.t('common.update')}
              </Button>
            </React.Fragment>
          }
          //actions={actions}
          //onClose={this.close}
          //heading={this.props.title}
        ></FormDialog>
      )
    );
  }

  function toggleDialog() {
    setIsOpen(!isOpen);
  }

  function handleSubmit() {
    const serializedData = serialize(formRef.current, {
      hash: true,
      empty: true,
    });
    const data = toSnakeCase(serializedData);
    update(data);
  }

  function columns() {
    const fields = ["locale", "site_title", "site_description", "action"];

    let cols = fields.map((field) => ({
      field: field,
      title: field,
      render: (row) => {
        return (
          row && (
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
              <div
                //onClick={(e)=>(showUserDrawer && showUserDrawer(row))}
                className="flex items-center"
              >
                {field === "locale" ? (
                  <p className="block text-gray-700 text-sm font-bold mb-2">
                    {row[field]}
                  </p>
                ) : field === "action" ? (
                  <Button
                    color="secondary"
                    onClick={() => setOpenDeleteDialog(row)}
                  >
                    {I18n.t('common.delete')}
                  </Button>
                ) : (
                  <Input
                    type={"text"}
                    //id="standard-name"
                    label={field}
                    defaultValue={row[field]}
                    name={`settings[${field}_${row.locale}]`}
                    margin="normal"
                  />
                )}
              </div>
            </td>
          )
        );
      },
    }));

    return cols;
  }

  return (
    <div className="py-4">
      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <Button onClick={toggleDialog} variant={"outlined"}>
          {I18n.t('articles.settings.add_language')}
        </Button>

        <div mt={2} mb={2}>
          {
            <Table
              title={"laguages"}
              //meta={this.props.meta}
              data={settings.translations}
              //search={this.props.search}
              //loading={this.props.loading}
              columns={columns()}
              //defaultHiddenColumnNames={this.props.defaultHiddenColumnNames}
              //tableColumnExtensions={this.props.tableColumnExtensions}
              //leftColumns={this.props.leftColumns}
              //rightColumns={this.props.rightColumns}
              //toggleMapView={this.props.toggleMapView}
              //map_view={this.props.map_view}
              //enableMapView={this.props.enableMapView}
            />
          }
        </div>

        <div className="flex justify-end py-2">
          <Button
            onClick={handleSubmit}
            variant={"contained"}
            color={"primary"}
          >
            {I18n.t('common.submit')}
          </Button>
        </div>
      </form>

      {renderLangDialog()}

      {openDeleteDialog && (
        <DeleteDialog
          open={openDeleteDialog}
          title={
            I18n.t('articles.settings.delete.title', {name: openDeleteDialog.locale})
          }
          closeHandler={() => {
            setOpenDeleteDialog(null);
          }}
          deleteHandler={() => {
            deleteLang(openDeleteDialog.locale, () =>
              setOpenDeleteDialog(false)
            );
          }}
        >
          <p variant="subtitle2">
            {I18n.t('articles.settings.delete.text', {name: openDeleteDialog.locale})}
          </p>
        </DeleteDialog>
      )}
    </div>
  );
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

export default withRouter(connect(mapStateToProps)(Settings));
