import React, { Component } from 'react';

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import I18n from '../../shared/FakeI18n';

// import Select from '@material-ui/core/Select'

import serialize from 'form-serialize';
import langsOptions from '../../shared/langsOptions';

import { toSnakeCase } from '@chaskiq/components/src/utils/caseConverter';
import DeleteDialog from '@chaskiq/components/src/components/DeleteDialog';
import ContentHeader from '@chaskiq/components/src/components/PageHeader';
import Tabs from '@chaskiq/components/src/components/Tabs';
import Button from '@chaskiq/components/src/components/Button';
import Table from '@chaskiq/components/src/components/Table';
import FormDialog from '@chaskiq/components/src/components/FormDialog';
import Input from '@chaskiq/components/src/components/forms/Input';
import FieldRenderer, {
  gridClasses,
} from '@chaskiq/components/src/components/forms/FieldRenderer';
import UpgradeButton from '@chaskiq/components/src/components/upgradeButton';
import {
  getFileMetadata,
  directUpload,
} from '@chaskiq/components/src/components/fileUploader';

import graphql from '@chaskiq/store/src/graphql/client';

import { CREATE_DIRECT_UPLOAD } from '@chaskiq/store/src/graphql/mutations';

import {
  setCurrentPage,
  setCurrentSection,
} from '@chaskiq/store/src/actions/navigation';

type SettingsProps = {
  dispatch: any;
  getSettings: any;
  updateMemSettings: any;
  settings: any;
  update: any;
  errors: any;
  deleteLang: any;
};

type SettingsState = {
  loading: boolean;
  tabValue: number;
  errors: any;
};
class Settings extends Component<SettingsProps, SettingsState> {
  state = {
    loading: true,
    tabValue: 0,
    errors: null,
  };

  titleRef = null;
  descriptionRef = null;
  switch_ref = null;

  componentDidMount() {
    this.props.getSettings(() => this.setState({ loading: false }));
    this.props.dispatch(setCurrentSection('HelpCenter'));

    this.props.dispatch(setCurrentPage('Settings'));
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
            //serviceUrl
          } = data.createDirectUpload.directUpload;

          directUpload(url, JSON.parse(headers), file).then(() => {
            const params = {};
            params[kind] = signedBlobId;
            this.props.update({ settings: params });
          });
        },
        error: (error) => {
          console.log('error on signing blob', error);
        },
      });
    });
  };

  definitionsForSettings = () => {
    return [
      {
        name: 'subdomain',
        label: I18n.t('definitions.articles.subdomain.label'),
        hint: I18n.t('definitions.articles.subdomain.hint'),
        type: 'string',
        grid: { xs: 'w-full', sm: 'w-1/2' },
      },

      {
        name: 'domain',
        hint: I18n.t('definitions.articles.domain.hint'),
        label: I18n.t('definitions.articles.domain.label'),
        type: 'string',
        grid: { xs: 'w-full', sm: 'w-1/2' },
      },
      {
        name: 'website',
        hint: I18n.t('definitions.articles.website.hint'),
        label: I18n.t('definitions.articles.website.label'),
        type: 'string',
        grid: { xs: 'w-full', sm: 'w-3/4' },
      },
      {
        name: 'googleCode',
        label: I18n.t('definitions.articles.google_code.label'),
        hint: I18n.t('definitions.articles.google_code.hint'),
        type: 'string',
        grid: { xs: 'w-full', sm: 'w-1/4' },
      },
    ];
  };

  definitionsForAppearance = () => {
    return [
      {
        name: 'color',
        type: 'color',
        handler: (color) => {
          this.props.updateMemSettings({ color: color });
        },
        grid: { xs: 'w-full', sm: 'w-1/3' },
      },

      {
        name: 'logo',
        type: 'upload',
        label: 'logo',
        handler: (file) => this.uploadHandler(file, 'logo'),
        grid: { xs: 'w-full', sm: 'w-1/3' },
      },

      {
        name: 'header_image',
        type: 'upload',
        label: 'Header logo',
        handler: (file) => this.uploadHandler(file, 'header_image'),
        grid: { xs: 'w-full', sm: 'w-1/3' },
      },

      {
        name: 'facebook',
        label: 'Facebook',
        startAdornment: 'facebook/',
        type: 'string',
        grid: { xs: 'w-full', sm: 'w-1/3' },
      },

      {
        name: 'twitter',
        label: 'Twitter',
        startAdornment: 'twitter/',
        type: 'string',
        grid: { xs: 'w-full', sm: 'w-1/3' },
      },

      {
        name: 'linkedin',
        label: 'Linkedin',
        startAdornment: 'linkedin/',
        type: 'string',
        grid: { xs: 'w-full', sm: 'w-1/3' },
      },

      {
        name: 'credits',
        label: I18n.t('definitions.articles.credits.label'),
        type: 'bool',
        hint: I18n.t('definitions.articles.credits.hint'),
        grid: { xs: 'w-full', sm: 'w-3/4' },
      },
    ];
  };

  definitionsForLang = () => {
    return [
      {
        name: 'langs',
        type: 'select',
        multiple: true,
        options: langsOptions,
        default: 'es',
        hint: 'Choose langs',
        grid: { xs: 'w-full', sm: 'w-3/4' },
      },
    ];
  };

  handleTabChange = (e, i) => {
    this.setState({ tabValue: i });
  };

  tabsContent = () => {
    return (
      <Tabs
        currentTab={this.state.tabValue}
        onChange={this.handleTabChange}
        textColor="inherit"
        tabs={[
          {
            label: I18n.t('articles.settings.basic'),
            content: (
              <SettingsForm
                title={I18n.t('articles.settings.general_app')}
                // currentUser={this.props.currentUser}
                data={this.props.settings}
                update={this.props.update.bind(this)}
                // errorNamespace={'article_settings.'}
                // fetchApp={this.fetchApp}
                // classes={this.props.classes}
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
                  <p className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 pb-4">
                    {I18n.t('articles.settings.lang_title')}
                  </p>

                  <p className="max-w-xl text-sm leading-5 text-gray-500 dark:text-gray-300 mb-4">
                    {I18n.t('articles.settings.lang_desc')}
                  </p>
                </div>

                <LanguageForm
                  // title={'Lang'}
                  settings={this.props.settings}
                  // currentUser={this.props.currentUser}
                  // data={this.props.settings}
                  deleteLang={this.props.deleteLang.bind(this)}
                  update={this.props.update.bind(this)}
                  // fetchApp={this.fetchApp}
                  // classes={this.props.classes}
                  // definitions={this.definitionsForLang}
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
                // currentUser={this.props.currentUser}
                data={this.props.settings}
                update={this.props.update.bind(this)}
                // errorNamespace={'article_settings.'}
                // fetchApp={this.fetchApp}
                // classes={this.props.classes}
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
          actions={
            <div>
              <UpgradeButton
                classes={`absolute z-10 ml-1 mt-3 transform w-screen 
                  max-w-md px-2 origin-top-right right-0
                  md:-ml-4 sm:px-0 lg:ml-0
                  lg:right-2/6 lg:translate-x-1/6`}
                label={I18n.t('articles.activate_help_center')}
                feature="Articles"
              >
                <Button>{I18n.t('articles.activate_help_center')}</Button>
              </UpgradeButton>
            </div>
          }
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
          } */
        />

        {this.tabsContent()}
      </React.Fragment>
    );
  }
}

type SettingsFormProps = {
  update: (val: any) => void;
  title: string;
  definitions: () => Array<any>;
  errors: any;
  data: any;
};
class SettingsForm extends Component<SettingsFormProps> {
  formRef;

  onSubmitHandler = (e) => {
    e.preventDefault();
    const serializedData = serialize(this.formRef, {
      hash: true,
      empty: true,
    });
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
        <div className={'my-2'}>
          <p className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 pb-4">
            {this.props.title}
          </p>

          <div className="flex flex-wrap items-center">
            {this.props.definitions().map((field, i) => {
              return (
                <div
                  key={`articles-settings-${i}`}
                  className={`${gridClasses(field)} py-2 pr-2`}
                >
                  <FieldRenderer
                    namespace={'settings'}
                    data={field}
                    type={field.type}
                    // defaultValue={field.defaultValue}
                    handler={field.handler}
                    // errorNamespace={this.props.errorNamespace}
                    props={{ data: this.props.data }}
                    errors={this.props.errors}
                  />
                </div>
              );
            })}
          </div>

          <div className={'space-around py-4'}>
            <Button
              className="mr-2"
              onClick={this.onSubmitHandler.bind(this)}
              variant="success"
              color="primary"
              size="md"
            >
              {I18n.t('common.save')}
            </Button>
          </div>
        </div>
      </form>
    );
  }
}

function LanguageForm({ settings, update, deleteLang }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedLang, _setSelectedLang] = React.useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(null);

  const formRef: any = React.createRef();

  function handleChange(e) {
    const val = e.value;
    const serializedData = serialize(formRef.current, {
      hash: true,
      empty: true,
    });
    const data = toSnakeCase(serializedData);

    const next = {};
    next[`site_title_${val}`] = '';
    next[`site_description_${val}`] = '';

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
          // contentText={"lipsum"}
          titleContent={I18n.t('articles.settings.add_language_to_help')}
          formComponent={
            //! loading ?
            <form onSubmit={(e) => e.preventDefault()}>
              <Input
                label={I18n.t('articles.settings.select_lang')}
                value={selectedLang}
                onChange={handleChange}
                type={'select'}
                // defaultValue={{label: item.to, value: item.to}}
                name={'age'}
                data={{}}
                options={langsOptions}
              ></Input>
            </form>
            // : <CircularProgress/>
          }
          dialogButtons={
            <React.Fragment>
              <Button onClick={toggleDialog} variant="outlined">
                {I18n.t('common.cancel')}
              </Button>

              <Button // onClick={this.submitAssignment }
                className="mr-1"
              >
                {I18n.t('common.update')}
              </Button>
            </React.Fragment>
          }
          // actions={actions}
          // onClose={this.close}
          // heading={this.props.title}
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
    const fields = ['locale', 'site_title', 'site_description', 'action'];

    const cols = fields.map((field) => ({
      field: field,
      title: I18n.t(`data_tables.articles.settings.${field}`),
      render: (row) => {
        return (
          row && (
            <div
              // onClick={(e)=>(showUserDrawer && showUserDrawer(row))}
              className="flex items-center"
            >
              {field === 'locale' ? (
                <p className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                  {row[field]}
                </p>
              ) : field === 'action' ? (
                <Button
                  variant="danger"
                  color="secondary"
                  onClick={() => setOpenDeleteDialog(row)}
                >
                  {I18n.t('common.delete')}
                </Button>
              ) : (
                <Input
                  type={'text'}
                  // id="standard-name"
                  label={false}
                  defaultValue={row[field]}
                  name={`settings[${field}_${row.locale}]`}
                />
              )}
            </div>
          )
        );
      },
    }));

    return cols;
  }

  return (
    <div className="py-4">
      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <UpgradeButton
          label={I18n.t('articles.settings.add_language')}
          size="sm"
          feature="Articles"
        >
          <Button onClick={toggleDialog} variant={'outlined'}>
            {I18n.t('articles.settings.add_language')}
          </Button>
        </UpgradeButton>

        <div>
          {
            <Table
              // meta={this.props.meta}
              data={settings.translations}
              // search={this.props.search}
              // loading={this.props.loading}
              columns={columns()}
              // defaultHiddenColumnNames={this.props.defaultHiddenColumnNames}
              // tableColumnExtensions={this.props.tableColumnExtensions}
              // leftColumns={this.props.leftColumns}
              // rightColumns={this.props.rightColumns}
              // toggleMapView={this.props.toggleMapView}
              // map_view={this.props.map_view}
              // enableMapView={this.props.enableMapView}
            />
          }
        </div>

        <div className="flex justify-start py-2">
          <Button
            onClick={handleSubmit}
            variant={'success'}
            color={'primary'}
            size={'medium'}
          >
            {I18n.t('common.save')}
          </Button>
        </div>
      </form>

      {renderLangDialog()}

      {openDeleteDialog && (
        <DeleteDialog
          open={openDeleteDialog}
          title={I18n.t('articles.settings.delete.title', {
            name: openDeleteDialog.locale,
          })}
          closeHandler={() => {
            setOpenDeleteDialog(null);
          }}
          deleteHandler={() => {
            deleteLang(openDeleteDialog.locale, () =>
              setOpenDeleteDialog(false)
            );
          }}
        >
          <p>
            {I18n.t('articles.settings.delete.text', {
              name: openDeleteDialog.locale,
            })}
          </p>
        </DeleteDialog>
      )}
    </div>
  );
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

export default withRouter(connect(mapStateToProps)(Settings));
