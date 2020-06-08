import React, { Component } from "react";
import Moment from "react-moment";
import CampaignChart from "./charts/charts.js";
import styled from "@emotion/styled";
import graphql from "../graphql/client";
import Table from "./Table";
import gravatar from "../shared/gravatar";
import Badge from './Badge'
import Button from "./Button";
import Avatar from "./Avatar";

import Count from "./charts/count";

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

const NameWrapper = styled.span`
  display: flex;
  align-items: center;
`;

const AvatarWrapper = styled.div`
  margin-right: 8px;
`;

class Stats extends Component {
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
    let kind = "default";

    switch (item) {
      case "click":
        kind = "success";
        break;
      case "viewed":
        kind = "inprogress";
        break;
      case "close":
        kind = "removed";
        break;
      default:
        break;
    }

    return <div appearance={kind}>{item}</div>;
  };

  renderBadgeKind = (row)=>{
    let variant = null
    switch (row.action) {
      case 'send':
        variant = 'yellow';
        break
      case 'delivery':
        variant = 'green';
        break
      case 'open':
        variant = 'blue';
        break
      case 'click':
        variant = 'purple';
        break
      default:
        break;
    }

    return <Badge variant={variant}>
            {row.action}
           </Badge>
  }

  componentDidMount() {
    this.init();
  }

  init = () => {
    this.getData();
    //this.getCounts()
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

  render() {
    return (
      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold my-4">Campaign stats</h3>
          <Button onClick={this.getData}>
            refresh data
          </Button>
        </div>

      
        {this.props.data && this.props.mode !== "counter_blocks" &&
          <PieContainer>
            {
              this.props.data.statsFields.map((o) => {
                return (
                  <PieItem>
                    <CampaignChart data={this.getRateFor(o)} />
                  </PieItem>
                );
              })
            }
          </PieContainer>
        }
       

        {this.props.mode === "counter_blocks" && this.props.data && (
          <div className="flex pb-5 overflow-x-auto">
            {Object.keys(this.state.counts).map(
              (key) => {
              return (
                <div className="lg:w-1/4 w-screen my-1 px-1">
                  <div className="rounded shadow-lg bg-white border p-4">
                    <Count
                      data={this.state.counts[key]}
                      label={key.replace('bot_tasks.', '')}
                      appendLabel={""}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <hr className="border-gray-200"/>

        {!this.state.loading ? (
          <Table
            data={this.state.collection}
            loading={this.props.searching}
            search={this.getData}
            defaultHiddenColumnNames={[]}
            columns={[
              { field: "id", title: "id", hidden: true },
              {
                field: "email",
                title: "email",
                render: (row) =>
                  row && (
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <div
                        onClick={(e) =>
                          this.props.actions.showUserDrawer(row.appUserId)
                        }
                        className="flex items-center"
                      >
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={gravatar(row.email)}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm leading-5 font-medium text-gray-900">
                            {row.displayName}
                          </div>
                          <div className="text-sm leading-5 text-gray-500">
                            {row.email}
                          </div>
                        </div>
                      </div>
                    </td>
                  ),
              },
              { field: "action", title: "Action", 
                render: (row)=> <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  {this.renderBadgeKind(row)}
                </td> 
              },
              { field: "host", title: "from" },
              {
                field: "createdAt",
                title: "when",
                render: (row) =>
                  row && (
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <Moment fromNow>{row.updatedAt}</Moment>
                    </td>
                  ),
              },
              {
                field: "data",
                title: "data",
                render: (row) =>
                  row && (
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <div>{JSON.stringify(row.data)}</div>
                    </td>
                  ),
              },
            ]}
            //selection [],
            tableColumnExtensions={[
              //{ columnName: 'id', width: 150 },
              { columnName: "email", width: 250 },
              { columnName: "lastVisitedAt", width: 120 },
              { columnName: "os", width: 100 },
              { columnName: "osVersion", width: 100 },
              { columnName: "state", width: 80 },
              { columnName: "online", width: 80 },

              //{ columnName: 'amount', align: 'right', width: 140 },
            ]}
            leftColumns={["email"]}
            rightColumns={["online"]}
            meta={this.state.meta}
          />
        ) : null}
      </div>
    );
  }
}

export default Stats;
