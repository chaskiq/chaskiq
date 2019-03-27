import React, {Component} from "react"
import axios from "axios"
import DynamicTable from '@atlaskit/dynamic-table'
import Moment from 'react-moment';
import Lozenge from "@atlaskit/lozenge"
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
      counts: {}
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

  getTableData(){

    const head = this.createHead(true);

    const metrics = this.state.collection.map((metric, index) => {
      return {
        key: `row-${index}-${metric.id}`,
        cells: [
          {
            content: (<Lozenge appearance={"default"}>
                      {metric.action}
                      </Lozenge>),
          },
          {
            //key: createKey(metric.state),
            content: <span>{metric.email}</span>,
          },
          {
            //key: createKey(metric.state),
            content: <span>{metric.host}</span>,
          },
          {
            //key: createKey(metric.state),
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
    this.getData()
    this.getCounts()
  }

  getData = ()=>{
    console.log(this.props)
    const url = `${this.props.url}/metrics.json?mode=${this.props.mode}&page=${this.state.meta.next_page || 1}`

    axios.get(url)
    .then((response)=>{
      this.setState({
        collection: this.state.collection.concat(response.data.collection),
        meta: response.data.meta
      })
    }).catch((err)=>{
      console.log(err)
    })
  }

  getCounts = ()=>{
    console.log(this.props.store)
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

  getDeliverRateCount = ()=>{
    return [
      {
        "id": "send",
        "label": "send",
        "value": this.state.counts.send || 0,
        "color": "#0747A6"
      },
      {
        "id": "open",
        "label": "open",
        "value": this.state.counts.open || 0,
        "color": "#DEEBFF"
      }]
  }

  getClickRateCount = ()=>{
    return [
      {
        "id": "open",
        "label": "open",
        "value": this.state.counts.open || 0,
        "color": "#0747A6"
      },
      {
        "id": "click",
        "label": "click",
        "value": this.state.counts.click || 0,
        "color": "#DEEBFF"
      }]
  }

  getBouncesRateCount = ()=>{
    return [
      {
        "id": "sends",
        "label": "sends",
        "value": this.state.counts.send || 0,
        "color": "#0747A6"
      },
      {
        "id": "bounces",
        "label": "bounces",
        "value": this.state.counts.bounces || 0,
        "color": "#DEEBFF"
      }]
  }

  getComplaintsRateCount = ()=>{
    return [
      {
        "id": "sends",
        "label": "sends",
        "value": this.state.counts.send,
        "color": "#0747A6"
      },
      {
        "id": "complaints",
        "label": "complaints",
        "value": this.state.counts.complaints,
        "color": "#DEEBFF"
      }]
  }

  render(){
    const {head, rows} = this.getTableData()
    return <div>
              <PieContainer>
                <PieItem>
                  <CampaignChart data={this.getDeliverRateCount()}
                  />
                </PieItem>

                <PieItem>
                  <CampaignChart data={this.getClickRateCount()}
                  />
                </PieItem>

                <PieItem>
                  <CampaignChart data={this.getBouncesRateCount()}
                  />
                </PieItem>

                <PieItem>
                  <CampaignChart data={this.getComplaintsRateCount()}
                  />
                </PieItem>
              </PieContainer>
              
              <DynamicTable
                caption={null}
                head={head}
                rows={rows}
                //rowsPerPage={1}
                defaultPage={1}
                loadingSpinnerSize="large"
                isLoading={false}
                isFixedSize
                defaultSortKey="term"
                defaultSortOrder="ASC"
                onSort={() => console.log('onSort')}
                onSetPage={() => console.log('onSetPage')}
              />
              {
                this.state.meta.next_page ? 
                <a href="#" onClick={this.handleNextPage}>next</a> : null
              }
              
           </div>
  }
}