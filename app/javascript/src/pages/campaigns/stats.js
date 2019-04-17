import React, {Component} from "react"
import axios from "axios"
import DynamicTable from '@atlaskit/dynamic-table'
import Moment from 'react-moment';
import Lozenge from "@atlaskit/lozenge"
import Button from '@atlaskit/button';

import DropdownMenu, {
  DropdownItemGroup,
  DropdownItem,
} from '@atlaskit/dropdown-menu';

import CampaignChart from "./charts.js"
import styled from 'styled-components'


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
    return {
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
    };
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

    switch (item.action) {
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

    return <Lozenge appearance={kind}>
      {item.action}
    </Lozenge>
  }

  getTableData(){

    const head = this.createHead(true);

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

    return {head: head, rows: metrics}
  }

  componentDidMount(){
    this.init()
  }

  init = ()=>{
    this.getData()
    this.getCounts()
  }

  getData = ()=>{
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

  }

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
                this.props.data.stats_fields.map((o)=>{
                  return <PieItem>
                            <CampaignChart data={this.getRateFor(o)}/>
                          </PieItem>
                })
              }

              </PieContainer>


            <div>
              <Button
                spacing={"compact"}
                appearance={"danger"}
                onClick={this.purgeMetrics}>
                purge metrics
              </Button>
            </div>

            <hr/>

            

              {
                !this.state.loading ? 
                  <DynamicTable
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
                  /> : null 
              }

              {
                this.state.meta.next_page ? 
                <a href="#" onClick={this.handleNextPage}>next</a> : null
              }
              
           </div>
  }
}