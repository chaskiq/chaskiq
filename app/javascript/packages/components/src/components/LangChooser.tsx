import React from 'react';
import { connect } from 'react-redux';

import FormDialog from './FormDialog';
import Input from './forms/Input';
import CircularProgress from './Progress';
import I18n from '../../../../src/shared/FakeI18n';

import graphql from '@chaskiq/store/src/graphql/client';

import { getCurrentUser } from '@chaskiq/store/src/actions/current_user';

import { UPDATE_AGENT } from '@chaskiq/store/src/graphql/mutations';

function LangChooser({ open, handleClose, current_user, app, dispatch }) {
  const [setted, setSetted] = React.useState(false);

  function setLang(lang) {
    graphql(
      UPDATE_AGENT,
      {
        appKey: app.key,
        email: current_user.email,
        params: {
          lang: lang,
        },
      },
      {
        success: () => {
          // This dispatch will trigger an effect on AppRoutes.js
          // which will refresh the components
          dispatch(getCurrentUser());
          setSetted(true);
        },
        error: () => {},
      }
    );
  }

  function handleChange(e) {
    setLang(e.value);
  }

  return (
    <FormDialog
      open={open}
      handleClose={() => handleClose(false)}
      maxWidth={'sm'}
      fullWidth={true}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      titleContent={'select language'}
      formComponent={
        <div>
          {setted && (
            <div>
              <CircularProgress />
            </div>
          )}

          {!setted && (
            <Input
              type="select"
              // value={ selectedAgent() }
              onChange={handleChange}
              defaultValue={{
                value: I18n.locale,
                label: I18n.t(`common.langs.${I18n.locale}`),
              }}
              label={I18n.t('common.select_language')}
              data={{}}
              options={Object.keys(I18n.t('common.langs')).map((o) => ({
                label: I18n.t(`common.langs.${o}`),
                value: o,
              }))}
            ></Input>
          )}
        </div>
      }
      // dialogButtons={}
    ></FormDialog>
  );
}

function mapStateToProps(state) {
  const { auth, app, current_user } = state;
  return {
    auth,
    current_user,
    app,
  };
}

export default connect(mapStateToProps)(LangChooser);
