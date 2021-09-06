import React, { Component } from 'react';
import Moment from 'react-moment';
import CampaignChart from './charts/charts';
import styled from '@emotion/styled';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import I18n from '../../../../src/shared/FakeI18n';

import Table from './Table';
import Badge from './Badge';
import Button from './Button';

import Count from './charts/count';
import { isEmpty } from 'lodash';

import { getAppUser } from '@chaskiq/store/src/actions/app_user';
import { toggleDrawer } from '@chaskiq/store/src/actions/drawer';

const PieContainer = styled.div`
  padding: 0.75em;
  display: grid;
  grid-template-columns: repeat(4, 200px);
  grid-gap: 10px;
  width: 100vw;
  margin: 25px 0 18px 0;
  overflow: auto;
`;

const PieItem = styled.div`
  height: 200px;
`;

type StatsProps = {
  mode: any;
  match: any;
  app: any;
  data: any;
  getStats: (value: any, cb?: any) => void;
  dispatch: (value: any) => void;
};
type StatsState = {
  collection: any;
  meta: any;
  counts: any;
  loading: boolean;
};

class Stats extends Component<StatsProps, StatsState> {
  constructor(props) {
    super(props);
    this.state = {
      collection: [],
      meta: {},
      counts: {},
      loading: false,
    };
    this.getData = this.getData.bind(this);
  }

  renderLozenge = (item) => {
    let kind = 'default';

    switch (item) {
      case 'click':
        kind = 'success';
        break;
      case 'viewed':
        kind = 'inprogress';
        break;
      case 'close':
        kind = 'removed';
        break;
      default:
        break;
    }

    return <div>{item}</div>;
  };

  renderBadgeKind = (row) => {
    let variant = null;
    switch (row.action) {
      case 'send':
        variant = 'yellow';
        break;
      case 'delivery':
        variant = 'green';
        break;
      case 'open':
        variant = 'blue';
        break;
      case 'click':
        variant = 'purple';
        break;
      default:
        break;
    }

    return <Badge variant={variant}>{row.action}</Badge>;
  };

  componentDidMount() {
    this.init();
  }

  init = () => {
    this.getData();
    // this.getCounts()
  };

  getData = () => {
    this.props.getStats(
      {
        appKey: this.props.app.key,
        mode: this.props.mode,
        id: this.props.match.params.id,
        page: this.state.meta.next_page || 1,
      },
      (data) => {
        const { counts, metrics } = data;
        this.setState({
          meta: metrics.meta,
          counts: counts,
          collection: metrics.collection,
        });
      }
    );
  };

  handleNextPage = () => {
    this.getData();
  };

  getRateFor = (type) => {
    return type.keys.map((o) => {
      return {
        id: o.name,
        label: o.name,
        value: this.state.counts[o.name] || 0,
        color: o.color,
      };
    });
  };

  showUserDrawer = (id) => {
    this.props.dispatch(
      toggleDrawer({ userDrawer: true }, () => {
        this.props.dispatch(getAppUser(id));
      })
    );
  };

  render() {
    return (
      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold my-4">
            {I18n.t('campaign.stats.title')}
          </h3>
          <Button variant={'outlined'} size="small" onClick={this.getData}>
            {I18n.t('campaign.stats.refresh_data')}
          </Button>
        </div>

        {this.props.data && this.props.mode !== 'counter_blocks' && (
          <PieContainer>
            {!isEmpty(this.state.counts) &&
              this.props.data.statsFields.map((o, i) => {
                const rateData = this.getRateFor(o);
                return (
                  <PieItem key={`rate-for-${i}`}>
                    <CampaignChart data={rateData} />
                  </PieItem>
                );
              })}
          </PieContainer>
        )}

        {this.props.mode === 'counter_blocks' && this.props.data && (
          <div className="flex pb-5 overflow-x-auto">
            {Object.keys(this.state.counts).map((key, i) => {
              return (
                <div
                  className="lg:w-1/4 w-screen my-1 px-1"
                  key={`counter-${i}`}
                >
                  <div className="rounded shadow-lg bg-white dark:bg-gray-900 dark:border-gray-900 border p-4">
                    <Count
                      data={this.state.counts[key]}
                      label={key.replace('bot_tasks.', '')}
                      appendLabel={''}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <hr className="border-gray-200" />

        {!this.state.loading ? (
          <Table
            data={this.state.collection}
            search={this.getData}
            columns={[
              { field: 'id', title: 'id', hidden: true },
              {
                field: 'email',
                title: I18n.t('definitions.stats.email.label'),
                render: (row) =>
                  row && (
                    <div
                      onClick={() => this.showUserDrawer(row.appUserId)}
                      className="flex items-center"
                    >
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={row.avatarUrl}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm leading-5 font-medium text-gray-900 dark:text-gray-100">
                          {row.displayName}
                        </div>
                        <div className="text-sm leading-5 text-gray-500 dark:text-gray-300">
                          {row.email}
                        </div>
                      </div>
                    </div>
                  ),
              },
              {
                field: 'action',
                title: I18n.t('definitions.stats.actions.label'),
                render: (row) => this.renderBadgeKind(row),
              },
              {
                field: 'host',
                title: I18n.t('definitions.stats.from.label'),
              },
              {
                field: 'createdAt',
                title: I18n.t('definitions.stats.when.label'),
                render: (row) =>
                  row && <Moment fromNow>{row.updatedAt}</Moment>,
              },
              {
                field: 'data',
                title: I18n.t('definitions.stats.data.label'),
                render: (row) => row && <div>{JSON.stringify(row.data)}</div>,
              },
            ]}
            meta={this.state.meta}
          />
        ) : null}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { app } = state;
  return {
    app,
  };
}

export default withRouter(connect(mapStateToProps)(Stats));
