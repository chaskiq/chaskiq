import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import FormDialog from '@chaskiq/components/src/components/FormDialog';
import { SeachIcon } from '@chaskiq/components/src/components/icons';
import Button from '@chaskiq/components/src/components/Button';
import SearchInput from '@chaskiq/components/src/components/SearchInput';
import I18n from '../../shared/FakeI18n';

import {
  getConversations,
  updateConversationsData,
  clearConversations,
} from '@chaskiq/store/src/actions/conversations';

function ConversationSearch({ _app, dispatch, conversations, asButton }) {
  const [open, setOpen] = React.useState(false);

  function fetchConversations(options, cb = null) {
    dispatch(
      getConversations(options, () => {
        cb && cb();
      })
    );
  }

  function handleSubmit(term) {
    dispatch(clearConversations([]));
    dispatch(
      updateConversationsData(
        {
          term: term,
        },
        () => {
          setOpen(false);
          fetchConversations({});
        }
      )
    );
  }

  function handleEnter(e) {
    if (e.key === 'Enter') {
      handleSubmit(e.target.value);
    }
  }

  return (
    <React.Fragment>
      {asButton && (
        <Button variant="icon" onClick={() => setOpen(true)}>
          <SeachIcon />
        </Button>
      )}

      {!asButton && (
        <div className="flex items-center justify-space w-full bg-gray-200 dark:bg-gray-900 rounded-md px-2 py-1- mx-2">
          <SeachIcon size="small" onClick={() => setOpen(true)} />
          <input
            className="w-full ml-2 bg-transparent active:outline-none focus:outline-none text-sm py-1"
            defaultValue={conversations.term}
            onKeyDown={(e) => {
              handleEnter(e);
            }}
            placeholder={I18n.t('common.search_conversations')}
          />
        </div>
      )}

      <FormDialog
        open={open}
        handleClose={() => setOpen(false)}
        title={'eeie'}
        formComponent={
          <div>
            <h3>{I18n.t('common.search_conversations')}</h3>
            <SearchInput
              defaultValue={conversations.term}
              onSubmit={(term) => {
                handleSubmit(term);
              }}
              placeholder={I18n.t('common.search_conversations')}
            />
          </div>
        }
      ></FormDialog>
    </React.Fragment>
  );
}

function mapStateToProps(state) {
  const { app, conversations } = state;
  return {
    conversations,
    app,
  };
}

export default withRouter(connect(mapStateToProps)(ConversationSearch));
