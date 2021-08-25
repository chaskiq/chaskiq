import React, { Component } from 'react';

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import I18n from '../../shared/FakeI18n';

import SegmentManager from '@chaskiq/components/src/components/segmentManager';
import Button from '@chaskiq/components/src/components/Button';
import userFormat from '@chaskiq/components/src/components/Table/userFormat';

import graphql from '@chaskiq/store/src/graphql/client';

import { toggleDrawer } from '@chaskiq/store/src/actions/drawer';

import { getAppUser } from '@chaskiq/store/src/actions/app_user';

import { parseJwt, generateJWT } from '@chaskiq/store/src/jwt';

import { PREDICATES_SEARCH } from '@chaskiq/store/src/graphql/mutations';

type SegmentProps = {
  data: any;
  app: any;
  handleSave: (val: any, cb?: any) => void;
  updateData: (val: any, cb?: any) => void;
  dispatch: (val: any) => void;
};
type SegmentState = {
  jwt: any;
  app_users: any;
  search: any;
  meta: any;
  searching: boolean;
};

class Segment extends Component<SegmentProps, SegmentState> {
  constructor(props) {
    super(props);
    this.state = {
      jwt: null,
      app_users: [],
      search: false,
      meta: {},
      searching: false,
    };
  }

  componentDidMount() {
    this.search();
  }

  handleSave = (_e) => {
    const predicates = parseJwt(this.state.jwt);
    if (this.props.handleSave) {
      this.props.handleSave(predicates.data, () => {
        this.setState({ jwt: null });
      });
    }
  };

  updateData = (data, cb = null) => {
    const newData = Object.assign({}, this.props.data, {
      segments: data.data,
    });
    this.props.updateData(newData, cb ? cb() : null);
  };

  updatePredicate = (data, cb = null) => {
    const jwtToken = generateJWT(data);
    // console.log(parseJwt(jwtToken))
    if (cb) cb(jwtToken);
    this.setState({ jwt: jwtToken }, () => {
      this.updateData(parseJwt(this.state.jwt), this.search);
    });
  };

  addPredicate = (data, cb = null) => {
    const pending_predicate = {
      attribute: data.name,
      comparison: null,
      type: data.type,
      value: data.value,
    };

    const new_predicates = this.props.data.segments.concat(pending_predicate);
    const jwtToken = generateJWT(new_predicates);
    // console.log(parseJwt(jwtToken))
    if (cb) cb(jwtToken);

    this.setState({ jwt: jwtToken }, () =>
      this.updateData(parseJwt(this.state.jwt))
    );
  };

  deletePredicate(data) {
    const jwtToken = generateJWT(data);
    this.setState({ jwt: jwtToken }, () =>
      this.updateData(parseJwt(this.state.jwt), this.search)
    );
  }

  search = (page = null) => {
    this.setState({ searching: true });
    // jwt or predicates from segment
    // console.log(this.state.jwt)
    const data = this.state.jwt
      ? parseJwt(this.state.jwt).data
      : this.props.data.segments;
    const predicates_data = {
      data: {
        predicates: data.filter((o) => o.comparison),
      },
    };

    graphql(
      PREDICATES_SEARCH,
      {
        appKey: this.props.app.key,
        search: predicates_data,
        page: page || 1,
      },
      {
        success: (data) => {
          const appUsers = data.predicatesSearch.appUsers;
          this.setState({
            app_users: appUsers.collection,
            meta: appUsers.meta,
            searching: false,
          });
        },
        error: (_error) => {},
      }
    );
  };

  showUserDrawer = (o) => {
    this.props.dispatch(
      toggleDrawer({ userDrawer: true }, () => {
        this.props.dispatch(getAppUser(o.id));
      })
    );
  };

  render() {
    return (
      <div className="py-4">
        <SegmentManager
          {...this.props}
          loading={this.state.searching}
          predicates={this.props.data.segments}
          meta={this.state.meta}
          collection={this.state.app_users}
          updatePredicate={this.updatePredicate.bind(this)}
          addPredicate={this.addPredicate.bind(this)}
          deletePredicate={this.deletePredicate.bind(this)}
          search={this.search.bind(this)}
          columns={userFormat(this.showUserDrawer, this.props.app)}
        >
          {this.state.jwt ? (
            <Button
              size={'sm'}
              variant={'link'}
              onClick={this.handleSave}
              className="animate-pulse"
            >
              <i className="fas fa-exclamation-circle mr-2"></i>
              {I18n.t('common.save_changes')}
            </Button>
          ) : null}
        </SegmentManager>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { drawer } = state;
  return {
    drawer,
  };
}

export default withRouter(connect(mapStateToProps)(Segment));
