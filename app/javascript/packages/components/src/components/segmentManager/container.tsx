import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import { InlineFilterDialog, SaveSegmentModal } from '.';
import I18n from '../../../../../src/shared/FakeI18n';

import SegmentItemButton from './itemButton';

import Table from '../Table/index';
import Map from '../map/index';

import userFormat from '../Table/userFormat';
import Progress from '../Progress';

import { dispatchSegmentUpdate } from '@chaskiq/store/src/actions/segments';
import {
  setCurrentSection,
  setCurrentPage,
} from '@chaskiq/store/src/actions/navigation';
import { toggleDrawer } from '@chaskiq/store/src/actions/drawer';
import { getAppUser } from '@chaskiq/store/src/actions/app_user';

const Wrapper = styled.div`
  //min-width: 600px;
`;

const ButtonGroup = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  margin-bottom: 2em;
  align-items: center;
  button {
    margin-right: 5px !important;
    margin: 2px;
  }
`;

type AppContentProps = {
  dispatch: (val: any) => void;
  match: any;
  actions: any;
  segment: any;
  history: any;
  app_users: any;
  app_user: any;
  app: any;
};
class AppContent extends Component<AppContentProps> {
  constructor(props) {
    super(props);
    this.getSegment = this.getSegment.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(setCurrentSection('Platform'));

    this.props.dispatch(
      setCurrentPage(`segment-${this.props.match.params.segmentID}`)
    );

    this.props.dispatch(
      dispatchSegmentUpdate({
        id: this.props.match.params.segmentID,
        jwt: this.props.match.params.Jwt,
      })
    );

    this.getSegment();
  }

  getSegment() {
    const segmentID = this.props.match.params.segmentID;
    segmentID && this.props.actions.fetchAppSegment(segmentID);
  }

  componentDidUpdate(prevProps, _prevState) {
    if (
      this.props.match.params &&
      prevProps.match.params.segmentID !== this.props.match.params.segmentID
    ) {
      this.props.dispatch(
        dispatchSegmentUpdate({
          id: this.props.match.params.segmentID,
          jwt: this.props.match.params.Jwt,
        })
      );

      this.props.dispatch(
        setCurrentPage(`segment-${this.props.match.params.segmentID}`)
      );

      this.getSegment();
    }

    if (
      prevProps.segment.jwt &&
      prevProps.segment.jwt !== this.props.segment.jwt
    ) {
      // console.info("cambio jwt")
      this.props.actions.search();
    }

    // check empty token , used when same sagment changes jwt
    if (
      prevProps.match.params.Jwt !== this.props.match.params.Jwt &&
      !this.props.match.params.Jwt
    ) {
      this.props.dispatch(
        dispatchSegmentUpdate({
          jwt: this.props.match.params.Jwt,
        })
      );

      this.getSegment();
    }
  }

  render() {
    const { searching, collection, meta } = this.props.app_users;
    return (
      <div style={{ marginTop: '20px' }}>
        {this.props.app.key && this.props.segment && this.props.segment.id ? (
          <AppUsers
            actions={this.props.actions}
            history={this.props.history}
            app={this.props.app}
            segment={this.props.segment}
            app_users={collection}
            app_user={this.props.app_user}
            meta={meta}
            searching={searching}
            dispatch={this.props.dispatch}
          />
        ) : null}
      </div>
    );
  }
}

type AppUsersProps = {
  segment: any;
  actions: any;
  history: any;
  app: any;
  app_users: any;
  app_user: any;
  meta: any;
  searching: boolean;
  dispatch: (val: any) => void;
};

type AppUsersState = {
  map_view: boolean;
};
class AppUsers extends Component<AppUsersProps, AppUsersState> {
  constructor(props) {
    super(props);
    this.state = {
      map_view: false,
    };
    this.toggleMap = this.toggleMap.bind(this);
    this.toggleList = this.toggleList.bind(this);
  }

  toggleMap = (_e) => {
    this.setState({ map_view: false });
  };

  toggleList = (_e) => {
    this.setState({ map_view: true });
  };

  toggleMapView = () => {
    this.setState({ map_view: !this.state.map_view });
  };

  handleClickOnSelectedFilter = (jwtToken) => {
    const url = `/apps/${this.props.app.key}/segments/${this.props.segment.id}/${jwtToken}`;
    this.props.history.push(url);
  };

  displayName = (o) => {
    return o.attribute.split('_').join(' ');
  };

  getTextForPredicate = (o) => {
    if (o.type === 'match') {
      if (o.value === 'and') return I18n.t('segment_manager.match_all');
      return I18n.t('segment_manager.match_any');
      //return `Match ${o.value === 'and' ? 'all' : 'any'} criteria`
    } else {
      return `${this.displayName(o)} ${o.comparison ? o.comparison : ''} ${
        o.value ? o.value : ''
      }`;
    }
  };

  getStatePredicate = () => {
    return this.props.actions
      .getPredicates()
      .find((o) => o.attribute === 'subscription_state');
  };

  caption = () => {
    return (
      <div>
        <ButtonGroup>
          {/* this.getStatePredicate() ?
                <button>
                  {this.getStatePredicate().attribute}
                </button> : null
              */}

          {this.props.actions
            .getPredicates()
            // .filter((o)=>(o.attribute !== "subscription_state"))
            .map((o, i) => {
              return (
                <SegmentItemButton
                  key={`segment-item-button-${i}`}
                  index={i}
                  predicate={o}
                  predicates={this.props.actions.getPredicates()}
                  open={!o.comparison}
                  appearance={o.comparison ? 'primary' : 'default'}
                  text={this.getTextForPredicate(o)}
                  updatePredicate={this.props.actions.updatePredicate}
                  predicateCallback={(jwtToken) =>
                    this.handleClickOnSelectedFilter.bind(this)(jwtToken)
                  }
                  deletePredicate={this.props.actions.deletePredicate}
                />
              );
            })}

          <InlineFilterDialog
            {...this.props}
            //handleClick={this.handleClickOnSelectedFilter.bind(this)}
            addPredicate={this.props.actions.addPredicate}
          />

          <SaveSegmentModal
            title="Save Segment"
            segment={this.props.segment}
            savePredicates={this.props.actions.savePredicates}
            predicateCallback={() => {
              const url = `/apps/${this.props.app.key}/segments/${this.props.segment.id}`;
              this.props.history.push(url);
            }}
            deleteSegment={this.props.actions.deleteSegment}
          />
        </ButtonGroup>
      </div>
    );
  };

  showUserDrawer = (o) => {
    this.props.dispatch(
      toggleDrawer({ userDrawer: true }, () => {
        this.props.dispatch(getAppUser(o.id));
      })
    );
  };

  getUserData = (id) => {
    this.props.actions.setAppUser(id);
  };

  render() {
    return (
      <Wrapper>
        {this.caption()}

        {this.state.map_view &&
        !this.props.searching &&
        this.props.app.key &&
        this.props.segment &&
        this.props.segment.id ? (
          <Map
            interactive={true}
            //segment={this.props.segment}
            data={this.props.app_users}
          />
        ) : null}

        {!this.props.searching && (
          <Table
            data={this.props.app_users}
            columns={userFormat(this.showUserDrawer, this.props.app)}
            meta={this.props.meta}
            search={this.props.actions.search}
            toggleMapView={this.toggleMapView}
            enableMapView={true}
          />
        )}

        {this.props.searching && <Progress />}
      </Wrapper>
    );
  }
}

function mapStateToProps(state) {
  const { auth, app, segment, app_users, app_user } = state;
  const { loading, isAuthenticated } = auth;

  const { searching, meta } = app_users;

  return {
    app_user,
    app_users,
    searching,
    meta,
    segment,
    app,
    loading,
    isAuthenticated,
  };
}

export default withRouter(connect(mapStateToProps)(AppContent));
