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
        hint: "documentation site subdomain",
        type: "string",
        grid: { xs: "w-full", sm: "w-full" },
      },

      {
        name: "domain",
        hint: "documentation site custom domain",
        type: "string",
        grid: { xs: "w-full", sm: "w-full" },
      },
      {
        name: "website",
        hint: "link to your website",
        type: "string",
        grid: { xs: "w-full", sm: "w-full" },
      },
      {
        name: "googleCode",
        hint: "Google Analytics Tracking ID",
        type: "string",
        grid: { xs: "w-full", sm: "w-full" },
      },
    ];
  };

  definitionsForAppearance = () => {
    return [
      {
        name: "color",
        type: "color",
        handler: (color) => {
          this.props.updateMemSettings({ color: color });
        },
        grid: { xs: "w-full", sm: "w-1/3" },
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
        startAdornment: "facebook/",
        type: "string",
        grid: { xs: "w-full", sm: "w-1/3" },
      },

      {
        name: "twitter",
        startAdornment: "twitter/",
        type: "string",
        grid: { xs: "w-full", sm: "w-1/3" },
      },

      {
        name: "linkedin",
        startAdornment: "linkedin/",
        type: "string",
        grid: { xs: "w-full", sm: "w-1/3" },
      },

      {
        name: "credits",
        type: "bool",
        hint: "Display a subtle link to the Chaskiq website",
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
            label: "Basic Setup",
            content: (
              <SettingsForm
                title={"General app's information"}
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
            label: "Lang",
            content: (
              <div className="my-2">
                <div>
                  <p
                    className="text-lg leading-6 font-medium text-gray-900 pb-4"
                    variant="h5"
                  >
                    Localize your Help Center
                  </p>

                  <p
                    className="max-w-xl text-sm leading-5 text-gray-500 mb-4"
                    variant="subtitle1"
                  >
                    Manage supported languages and customize your Help Center's
                    header
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
            label: "Appearance",
            content: (
              <SettingsForm
                title={"Appearance settings"}
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
          title={"Help Center Settings"}
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
            Save
          </Button>

          <Button appearance="subtle" variant={"outlined"} color={"secondary"}>
            Cancel
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
          titleContent={"Add new language to Help center"}
          formComponent={
            //!loading ?
            <form onSubmit={(e) => e.preventDefault()}>
              {/*<Select
                value={selectedLang}
                onChange={handleChange}
                inputProps={{
                  name: 'age',
                  id: 'age-simple',
                }}>

                {
                  langsOptions.map((o)=>(
                    <MenuItem value={o.value}>
                      {o.label}
                    </MenuItem> 
                  ))
                }
                
                
              </Select>*/}

              <Input
                label="select lang"
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
              <Button onClick={toggleDialog} color="secondary">
                Cancel
              </Button>

              <Button //onClick={this.submitAssignment }
                color="primary"
              >
                Update
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
                    delete
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
          Add language
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

          {/*
            <Table>
            <TableHead>
              <TableRow>
                <TableCell>Locale</TableCell>
                <TableCell align="left">Title</TableCell>
                <TableCell align="left">Description</TableCell>
                <TableCell align="left"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {settings.translations.map(row => (
                <TableRow key={row.locale}>
                  <TableCell component="th" scope="row">
                    {row.locale}
                  </TableCell>
                  <TableCell align="left">
                    <TextField
                      //id="standard-name"
                      label="Site Title"
                      defaultValue={row.site_title}
                      name={`settings[site_title_${row.locale}]`}
                      //className={classes.textField}
                      //value={values.name}
                      //onChange={handleChange('name')}
                      margin="normal"
                    />
                  </TableCell>
                  <TableCell align="left">
                    <TextField
                      //id="standard-name"
                      label="Site Description"
                      defaultValue={row.site_description}
                      name={`settings[site_description_${row.locale}]`}
                      //className={classes.textField}
                      //value={values.name}
                      //onChange={handleChange('name')}
                      margin="normal"
                    />
                  </TableCell>

                  <TableCell align="left">
                    <Button color="secondary" onClick={()=>setOpenDeleteDialog(row)}>
                      delete
                    </Button>
                  </TableCell>
                
                </TableRow>
              ))}
            </TableBody>
          </Table>
          */}
        </div>

        <div className="flex justify-end py-2">
          <Button
            onClick={handleSubmit}
            variant={"contained"}
            color={"primary"}
          >
            Submit
          </Button>
        </div>
      </form>

      {renderLangDialog()}

      {openDeleteDialog && (
        <DeleteDialog
          open={openDeleteDialog}
          title={`Delete translation "${openDeleteDialog.locale}"`}
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
            We will destroy translation and hide any articles with the "
            {openDeleteDialog.locale}" language
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
