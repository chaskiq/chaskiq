import React, {Component} from "react"
import axios from "axios"
import Moment from 'react-moment';
import CampaignChart from "./charts.js"
import styled from '@emotion/styled'
import graphql from '../../graphql/client'
import {CAMPAIGN_METRICS} from '../../graphql/queries'
import Table from '../../components/table/index'
import gravatar from '../../shared/gravatar'

import Typography from '@material-ui/core/Typography' 
import Button from '@material-ui/core/Button' 
import Avatar from '@material-ui/core/Avatar' 
import Badge from '@material-ui/core/Badge'
import Divider from '@material-ui/core/Divider'

const PieContainer = styled.div`
  padding: .75em;
  display: grid;
  grid-template-columns: repeat(4,200px);
  grid-gap: 10px;
  width: 100vw;
  margin: 25px 0 18px 0;
  overflow: auto;
`

const PieItem = styled.div`
height: 200px;
`

const NameWrapper = styled.span`
  display: flex;
  align-items: center;
`;

const AvatarWrapper = styled.div`
  margin-right: 8px;
`;


export default class CampaignStats extends Component {

  constructor(props){
    super(props)
    this.state = {
      collection: [],
      meta: {},
      counts: {},
      loading: false
    }
    this.getData = this.getData.bind(this)
  }

  createHead = (withWidth: boolean) => {

    return [
      {
        field: 'action',
        options: {
          filter: false,
          render: (value, tableMeta, updateValue) => {
            return this.renderLozenge(value)
          }
        }
      },

      {
        field: 'email',
        options: {
          filter: false
        }
      },
      {
        field: 'host',
        options: {
          filter: false
        }
      },
        
      {
        field: 'created_at',
        options: {
          filter: false
        }
      },
  
      {
        field: 'data',
        options: {
          filter: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return <p>cccc</p>
          }
        }
      },


    ]

  };

  renderLozenge = (item)=>{
    let kind = "default"

    switch (item) {
      case "click":
        kind = "success"
        break
      case "viewed":
        kind = "inprogress"
        break
      case "close":
        kind = "removed"
        break
      default:
        break;
    }

    return <div appearance={kind}>
            {item}
           </div>
  }

  componentDidMount(){
    this.init()
  }

  init = ()=>{
    this.getData()
    //this.getCounts()
  }

  getData = ()=>{
    graphql(CAMPAIGN_METRICS, {
      appKey: this.props.app.key, 
      mode: this.props.mode, 
      id: parseInt(this.props.match.params.id),
      page: this.state.meta.next_page || 1
    }, {
      success: (data)=>{
        const {counts, metrics} = data.app.campaign
        this.setState({
          meta: metrics.meta,
          counts: counts,
          collection: metrics.collection
        })
      },
      error: (error)=>{

      }
    })
  }

  handleNextPage = ()=>{
    this.getData()
  }

  getRateFor = (type)=>{
    return type.keys.map((o)=>{
      return {
        "id": o.name,
        "label": o.name,
        "value": this.state.counts[o.name] || 0,
        "color": o.color
      }
    })
  }

  render(){

    return <div>
              <PieContainer>

              {
                this.props.data.statsFields.map((o)=>{
                  return  <PieItem>
                            <CampaignChart data={this.getRateFor(o)}/>
                          </PieItem>
                })
              }

              </PieContainer>

            <Divider variant={"fullWidth"}/>

            

              {
                !this.state.loading ?

                <Table
                  data={this.state.collection} 
                  loading={this.props.searching}
                  search={this.getData}
                  defaultHiddenColumnNames={[]}
                  columns={[
                            {field: 'id', title: 'id', hidden: true},
                            {field: 'email', 
                            title: 'email', 
                              render: row => (row ? 

                                <NameWrapper onClick={(e)=>(this.props.actions.showUserDrawer(row.appUserId))}>
                                  <AvatarWrapper>
                                    <Badge 
                                      //className={classes.margin} 
                                      color={row.online ? "primary" : 'secondary' }
                                      variant="dot">
                                      <Avatar
                                        name={row.email}
                                        size="medium"
                                        src={gravatar(row.email)}
                                      />
                                    </Badge>
                                  </AvatarWrapper>

                                  <Typography>{row.email}</Typography>
                                  <Typography variant="overline" display="block">
                                    {row.name}
                                  </Typography>
                                </NameWrapper>

                               : undefined)
                            },
                            {field: 'action', title: 'Action'},
                            {field: 'host', title: 'from'},
                            {field: 'createdAt', title: 'when',
                            render: row => (row ? <Moment fromNow>
                                                          {row.updatedAt}
                                                        </Moment> : undefined)
                            },
                            {field: 'data', title: 'data', render: row => (row ? 
                              <p>{JSON.stringify(row.data)}</p> : 
                              null 
                            )},
                          ]}
                  //selection [],
                  tableColumnExtensions={[
                    //{ columnName: 'id', width: 150 },
                    { columnName: 'email', width: 250 },
                    { columnName: 'lastVisitedAt', width: 120 },
                    { columnName: 'os', width: 100 },
                    { columnName: 'osVersion', width: 100 },
                    { columnName: 'state', width: 80 },
                    { columnName: 'online', width: 80 },

                    //{ columnName: 'amount', align: 'right', width: 140 },
                  ]}
                  leftColumns={ ['email']}
                  rightColumns={ ['online']} 
                  meta={this.state.meta}
                  /> : null 
              }
              
           </div>
  }
}