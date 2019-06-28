import React, {Component} from "react"
import axios from "axios"
import Moment from 'react-moment';
import CampaignChart from "./charts.js"
import styled from 'styled-components'
import graphql from '../../graphql/client'
import {CAMPAIGN_METRICS} from '../../graphql/queries'
import Badge from '@material-ui/core/Badge';
import Avatar from '@material-ui/core/Avatar';
import DataTable from '../../components/newTable'
import gravatar from '../../shared/gravatar'

const PieContainer = styled.div`
padding: .75em;
display: grid;
grid-template-columns: repeat(4,200px);
grid-gap: 10px;
width: 100%;
margin: 25px 0 18px 0;
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
    /*return {
      cells: [
        {
          key: 'action',
          content: 'Action',
          isSortable: true,
          width: withWidth ? 5 : undefined,
        },
        {
          key: 'email',
          content: 'who',
          shouldTruncate: true,
          isSortable: true,
          width: withWidth ? 15 : undefined,
        },
        {
          key: 'host',
          content: 'from',
          shouldTruncate: true,
          isSortable: true,
          width: withWidth ? 15 : undefined,
        },
        
        {
          key: 'created_at',
          content: 'when',
          shouldTruncate: true,
          isSortable: true,
          width: withWidth ? 10 : undefined,
        },
  
        {
          key: 'data',
          content: 'Data',
          shouldTruncate: true,
          isSortable: true,
          width: withWidth ? 10 : undefined,
        },
      ],
    };*/

    return [
      {
        name: 'action',
        options: {
          filter: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return this.renderLozenge(value)
          }
        }
      },

      {
        name: 'email',
        options: {
          filter: false
        }
      },
      {
        name: 'host',
        options: {
          filter: false
        }
      },
        
      {
        name: 'created_at',
        options: {
          filter: false
        }
      },
  
      {
        name: 'data',
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

    /*
      "default",
      "inprogress",
      "moved",
      "new",
      "removed",
      "success",
    */

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

  getTableData(){

    const head = this.createHead(true);


    /*
    const metrics = this.state.collection.map((metric, index) => {
      return {
        key: `row-${index}-${metric.id}`,
        cells: [
          {
            key: `action-${metric.id}-${index}`,
            content: (this.renderLozenge(metric) ),
          },
          {
            key: `email-${metric.email}-${index}`,
            content: <span>{metric.email}</span>,
          },
          {
            key: `host-${metric.id}-${index}`,
            content: <span>{metric.host}</span>,
          },
          {
            key: `host-${metric.created_at}-${index}`,
            content: (<span>
                        <Moment fromNow>{metric.created_at }</Moment>
                      </span>),
          },
          {
            content: (

            <DropdownMenu trigger="More" triggerType="button"
              position={"bottom right"}>
              <DropdownItemGroup>
                {
                  Object.keys(metric.data).map((k, i)=> <DropdownItem key={i}>
                    <b>{k}</b>: {metric.data[k]}
                  </DropdownItem> 
                )
                }
                
              </DropdownItemGroup>
            </DropdownMenu>

            ),
          },
        ],
      }
    }
    );
    */

    //return {head: head, rows: metrics}

    return {head: head}
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

  /*getData = ()=>{
    const url = `${this.props.url}/metrics.json?mode=${this.props.mode}&page=${this.state.meta.next_page || 1}`
    this.setState({loading: true})
    axios.get(url)
    .then((response)=>{
      this.setState({
        collection: response.data.collection, //this.state.collection.concat(response.data.collection),
        meta: response.data.meta,
        loading: false
      })
    }).catch((err)=>{
      console.log(err)
    })
  }

  getCounts = ()=>{
    const url = `${this.props.url}/metrics/counts.json?mode=${this.props.mode}`

    axios.get(url)
    .then((response)=>{
      this.setState({
        counts: response.data
      })
    }).catch((err)=>{
      console.log(err)
    })

  }*/

  handleNextPage = ()=>{
    this.getData()
  }

  purgeMetrics = ()=>{
    const url = `${this.props.url}/metrics/purge.json?mode=${this.props.mode}`

    axios.get(url)
      .then((response) => {
        this.props.fetchCampaign()
        this.init()
      }).catch((err) => {
        console.log(err)
      })
  }

  getRateFor = (type)=>{
    return type.keys.map((o)=>{
      console.log(o)
      return {
        "id": o.name,
        "label": o.name,
        "value": this.state.counts[o.name] || 0,
        "color": o.color
      }
    })
  }

  render(){
    const {head, rows} = this.getTableData()
    
    return <div>
              <PieContainer>

              {
                this.props.data.statsFields.map((o)=>{
                  return <PieItem>
                            <CampaignChart data={this.getRateFor(o)}/>
                          </PieItem>
                })
              }

              </PieContainer>


            <div>
              <button
                spacing={"compact"}
                appearance={"danger"}
                onClick={this.purgeMetrics}>
                purge metrics
              </button>
            </div>

            <hr/>

            

              {
                !this.state.loading ?

                <DataTable
                  rows={this.state.collection} 
                  loading={this.props.searching}
                  search={this.getData}
                  defaultHiddenColumnNames={[]}
                  columns={[
                            //{name: 'id', title: 'id'},
                            {name: 'email', 
                            title: 'email', 
                              getCellValue: row => (row ? 

                                <NameWrapper onClick={(e)=>(this.props.showUserDrawer(row))}>
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
                            {name: 'lastVisitedAt', 
                              title: 'lastVisitedAt',
                              getCellValue: row => (row ? <Moment fromNow>
                                                            {row.lastVisitedAt}
                                                          </Moment> : undefined)
                            },
                            {name: 'action', title: 'Action'},
                            {name: 'email', title: 'who'},
                            {name: 'host', title: 'from'},
                            {name: 'created_at', title: 'when'},
                            {name: 'data', title: 'data'},
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

                  /*<DataTable 
                    title={'metrics'}
                    columns={head} 
                    meta={this.state.meta}
                    data={this.state.collection}
                    search={this.getData}
                    loading={this.state.loading}
                    //onRowClick={(e)=>{
                    //  this.showUserDrawer(e)
                    //}}
                  />*/

                  /*<DynamicTable
                    caption={null}
                    head={head}
                    rows={rows}
                    //rowsPerPage={1}
                    defaultPage={1}
                    loadingSpinnerSize="large"
                    isLoading={false}
                    isFixedSize
                    defaultSortKey="email"
                    defaultSortOrder="ASC"
                    onSort={() => console.log('onSort')}
                    onSetPage={() => console.log('onSetPage')}
                  />*/ 
                  /> : null 
              }
              
           </div>
  }
}