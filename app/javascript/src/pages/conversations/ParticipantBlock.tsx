import React from 'react';
import { connect } from 'react-redux';
import { AppItem } from './Sidebar';

function AppUserEdit({ app, conversation, app_user }) {
  const { mainParticipant } = conversation;

  const object = {
    definitions: [{ type: 'content' }],
    hooKind: 'initialize',
    name: 'ContactFields',
    values: {},
    block_type: null,
  };

  return (
    <div>
      <AppItem
        key={`inboxApp-${object.name}`}
        app={app}
        object={object}
        conversation={conversation}
        app_user={app_user}
      />
    </div>
  );
}

function mapStateToProps(state) {
  const { app, conversation, app_user } = state;
  return {
    app,
    conversation,
    app_user,
  };
}

export default connect(mapStateToProps)(AppUserEdit);
