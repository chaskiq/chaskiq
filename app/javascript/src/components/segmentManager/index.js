
import React, {Component} from "react"
import Button, { ButtonGroup } from '@atlaskit/button';
//import RadioGroup, { AkFieldRadioGroup, AkRadio } from '@atlaskit/field-radio-group';
import FieldRadioGroup from '@atlaskit/field-radio-group';
import DynamicTable from '@atlaskit/dynamic-table';
import Moment from 'react-moment';
import Avatar from '@atlaskit/avatar';
import Lozenge from "@atlaskit/lozenge"

import Modal from '@atlaskit/modal-dialog';
import DropdownMenu, {
  DropdownItemGroup,
  DropdownItem,
} from '@atlaskit/dropdown-menu';

import InlineDialog from '@atlaskit/inline-dialog';
import {parseJwt, generateJWT} from './jwt'
import ListDivider from '../list'

// same as SegmentItemButton
export class SegmentItemButton extends Component {
  state = {
    dialogOpen: this.props.open,
    selectedOption: this.props.predicate.comparison
  };

  onRadioChange = (e, cb)=> {
    this.setState({
      selectedOption: e.target.value
    }, ()=> cb ? cb() : null)
  };

  handleSubmit = (e)=> {
    //this.props.predicate.type
    let value = null 
    switch(this.props.predicate.type){
      case "string": {
        value = `${this.refs.relative_input.value}`
        break;
      }
      case "date": {
        value = `${this.refs.relative_input.value} days ago`
        break;
      }

      case "match": {
        value = `${this.state.selectedOption}`
        break;
      }

    }
    
    const h = {
      comparison: this.state.selectedOption.replace("relative:", ""),
      value: value
    }

    const response = Object.assign({}, this.props.predicate, h )
    const new_predicates = this.props.predicates.map((o, i)=> this.props.index === i ? response : o  )
    
    this.props.updatePredicate(new_predicates, ()=> this.props.predicateCallback )
    
    this.toggleDialog()
  }

  handleDelete = (e) => {
    //const response = Object.assign({}, this.props.predicate, h )
    //const new_predicates = this.props.predicates.map((o, i)=> this.props.index === i ? response : o  )
    const data = this.props.predicates.filter((o,i)=> i !== this.props.index )
    this.props.deletePredicate(data, this.props.predicateCallback)
  }

  renderOptions = () => {

    switch(this.props.predicate.type){
      case "string": {
        return this.contentString()
      }

      case "date": {
        return this.contentDate()
      }

      case "match": {
        return this.contentMatch() 
      }
    }

  }

  contentString = () => {
    
    const compare = (value)=>{
      return this.props.predicate.comparison === value
    }

    const relative = [
      {label: "is", value: "eq", defaultSelected: false},
      {label: "is not", value: "not_eq", defaultSelected: false},
      {label: "starts with", value: "contains_start", defaultSelected: false},
      {label: "ends with", value: "contains_ends", defaultSelected: false},
      {label: "contains", value: "contains", defaultSelected: false},
      {label: "does not contain", value: "not_contains", defaultSelected: false},
      {label: "is unknown", value: "is_null", defaultSelected: false},
      {label: "has any value", value: "is_not_null", defaultSelected: false},
    ]

    return <div>
              <h5>Select the filter</h5>
              <FieldRadioGroup
                items={relative}
                label="Relative:"
                onRadioChange={this.onRadioChange.bind(this)}
              />

              { this.state.selectedOption && 
                (this.state.selectedOption !== "is_null" || 
                  this.state.selectedOption !== "is_not_null") ?
                <div>
                  <input 
                    defaultValue={null} 
                    type="text"
                    ref={"relative_input"}
                  />
                  
                  <hr/>

                  <Button appearance="link" 
                    onClick={this.handleSubmit.bind(this)}>
                    Save changes
                  </Button>

                </div> : null
              }

              { !this.props.predicate.comparison ? null : this.deleteButton() }
            
            </div>
  }

  contentDate = () => {
  
    const compare = (value)=>{
      return this.props.predicate.comparison === value
    }

    const relative = [
      {label: "more than", value: "lt", defaultSelected: compare("lt")  },
      {label: "exactly", value: "eq",  defaultSelected: compare("eq")  },
      {label: "less than", value: "gt", defaultSelected: compare("gt")  },
    ]
    const absolute = [
      {name: "after", value: "absolute:gt"},
      {name: "on", value: "absolute:eq"},
      {name: "before", value: "absolute:lt"},
      {name: "is unknown", value: "absolute:eq"},
      {name: "has any value", value: "absolute:not_eq"},
    ]

    return <div>
              <h5>Update date</h5>
              <p>Select the filter</p>
              <FieldRadioGroup
                items={relative}
                label="Relative:"
                onRadioChange={this.onRadioChange.bind(this)}
              />

              { this.state.selectedOption ?
                <div>
                  <input 
                    defaultValue={30} 
                    type="number"
                    ref={"relative_input"}/>
                  <span>days ago</span>
                  <hr/>

                  <Button appearance="link" 
                    onClick={this.handleSubmit.bind(this)}>
                    save changes
                  </Button>

                </div> : null
              }

              { !this.props.predicate.comparison ? null : this.deleteButton() }
            
            </div>

  }

  contentMatch = () => {
  
    const compare = (value)=>{
      return this.props.predicate.value === value
    }

    const relative = [
      {label: "match any", comparison: "or", value: "or", defaultSelected: compare("or")  },
      {label: "match all", comparison: "and", value: "and",  defaultSelected: compare("and")  },
    ]

    return <div>
              <FieldRadioGroup
                items={relative}
                label="match criteria options:"
                onRadioChange={(e)=> this.onRadioChange.bind(this)(e, this.handleSubmit.bind(this) )}
              />
            </div>
  }

  deleteButton = () => {
    return <Button appearance="link" 
            onClick={this.handleDelete.bind(this)}>
            Delete
           </Button>
  }

  toggleDialog = (e) => this.setState({ dialogOpen: !this.state.dialogOpen });

  render() {
    //console.log(this.props.predicate)
    return (
      <div >
        <InlineDialog content={this.renderOptions()} 
                      isOpen={this.state.dialogOpen}
                      position={"bottom left"}
                      shouldFlipunion={true}>

          {
            !this.props.predicate.comparison ?
        
              <Button isLoading={false} 
                appearance={this.state.dialogOpen ? 'default' : 'danger'}
                onClick={this.toggleDialog}>
                {
                  !this.state.dialogOpen ? 
                  "Missing value!" : 
                  this.props.text
                }
              </Button> : 

              <Button isLoading={false} 
                appearance={this.props.appearance}
                onClick={this.toggleDialog}>
                {this.props.text}
              </Button>
          }

        </InlineDialog>
      </div>
    );
  }
}

export class SaveSegmentModal extends Component {
  state: State = { 
    isOpen: false, 
    action: "update",
    loading: false,
    input: null
  };
  open  = () => this.setState({ isOpen: true });
  close = () => this.setState({ isOpen: false });
  
  secondaryAction = ({ target }: Object) => {
    this.props.savePredicates({
      action: this.state.action,
      input: this.refs.input ? this.refs.input.value : null
    }, ()=> {
      this.close()
      if(this.props.predicateCallback)
        this.props.predicateCallback()
    })
  }

  deleteAction = ({ target }: Object) => {
    this.props.deleteSegment(this.props.segment.id, this.close )
  }

  handleChange = ({target})=> {
    this.setState({
      action: target.value, 
    })
  }
  
  render() {
    const { isOpen, loading } = this.state;
    const actions = [
      { text: 'Close', onClick: this.close },
      { text: 'Save Segment', onClick: this.secondaryAction.bind(this) },
      { text: 'Remove Segment', onClick: this.deleteAction.bind(this) }
    ];

    return (
      <div>

        <Button isLoading={false} 
          appearance={'link'}
          onClick={this.open}>
          <i className="fas fa-chart-pie"></i>
          {" "}
          Save Segment
        </Button>

        <Button isLoading={false} 
          appearance={'link danger'}
          onClick={this.deleteAction.bind(this)}>
          <i className="fas fa-chart-pie"></i>
          {" "}
          remove Segment
        </Button>


        {isOpen && (
          <Modal actions={actions} 
            onClose={this.close} 
            heading={this.props.title}>
            
            {
              !loading ?
                 <div>
                  <FieldRadioGroup
                    items={
                      [
                        {label: `Save changes to the segment ‘${this.props.segment.name}’`, value: "update", defaultSelected: true  },
                        {label: "Create new segment", value: "new" },
                      ]
                    }
                    label="options:"
                    onRadioChange={this.handleChange.bind(this)}
                  />

                  {
                    this.state.action === "new" ?
                    <input name="name" ref="input"/> : null
                  }
                </div> : <Spinner/>
            }

          </Modal>
        )}
      </div>
    );
  }
}

export class InlineFilterDialog extends Component {
  state = {
    dialogOpen: false,
  };

  toggleDialog = (e) => this.setState({ dialogOpen: !this.state.dialogOpen });

  handleClick = (e, o) => {
    this.props.addPredicate(o, (token)=> { 
      this.props.handleClick(token)
    })
  }

  render() {

    const fields = [
      {name: "email", type: "string"},
      {name: "last_visited_at", type: "date"},
      {name: "referrer", type: "string"},
      {name: "pro", type: "string" },
      {name: "role", type: "string" },
      {name: "plan", type: "string" },
      {name: "state", type: "string"},
      {name: "ip", type: "string"},        
      {name: "city", type: "string"},           
      {name: "region", type: "string"},         
      {name: "country", type: "string"},        
      {name: "lat", type: "string"},
      {name: "lng", type: "string"},
      {name: "postal", type: "string"},   
      {name: "web_sessions", type: "string"}, 
      {name: "timezone", type: "string"}, 
      {name: "browser", type: "string"}, 
      {name: "browser_version", type: "string"},
      {name: "os", type: "string"},
      {name: "os_version", type: "string"},      
      {name: "browser_language", type: "string"}, 
      {name: "lang", type: "string"},  
    ]

    const content = (
      <div>
        <h5>Select field</h5>
        <p>oeoe</p>


        <div style={{ height: '200px', overflow: 'auto'}}>
          <ListDivider 
            items={fields} 
            onClick={this.handleClick.bind(this)}
          />
        </div>

       {
         /*
       <div style={{ height: '200px', overflow: 'auto'}}>
          {
            fields.map((o) => <div key={o.name} style={{ marginBottom: '2px' }}>
                              <Button onClick={(e)=> this.handleClick.bind(this)(e, o)}>
                                {o.name}
                              </Button>
                             </div>
            )
          }
        </div>  
         */
       } 
       
      </div>
    );

    return (
      <div style={{ minHeight: '120px' }}>
        <InlineDialog 
          content={content} 
          isOpen={this.state.dialogOpen}
          position="bottom left">

          <Button isLoading={false} 
            appearance={'link'}
            onClick={this.toggleDialog}>
            <i className="fas fa-plus"></i>
            {" "}
            Add filter
          </Button>
        </InlineDialog>
      </div>
    );
  }
}

export class InlineCriteriaDialog extends Component {
  state = {
    dialogOpen: false,
  };

  toggleDialog = (e) => this.setState({ dialogOpen: !this.state.dialogOpen });

  handleClick = (e, o) => {
    this.props.addPredicate(o, ()=> { 
      this.props.handleClick()
    })
  }

  render() {

    const fields = [
      {name: "match any criteria", type: "or"},
      {name: "match all criteria", type: "and"},   
    ]

    const content = (
      <div>
        <h5>Select field</h5>
        <p>oeoe</p>

        <ul style={{ height: '200px', overflow: 'auto'}}>
          {
            fields.map((o)=> <li key={o.name}>
                              <Button onClick={(e)=> this.handleClick.bind(this)(e, o)}>
                                {o.name}
                              </Button>
                             </li>
            )
          }
        </ul>
      </div>
    );

    return (
      <div style={{ minHeight: '120px' }}>
        <InlineDialog 
          content={content} 
          isOpen={this.state.dialogOpen}
          position="bottom left">

          <Button isLoading={false} 
            appearance={'link'}
            onClick={this.toggleDialog}>
            <i className="fas fa-plus"></i>
            {" "}
            Add filter
          </Button>
        </InlineDialog>
      </div>
    );
  }
}


export default class SegmentManager extends Component {

  constructor(props){
    super(props)
  }

  handleClickOnSelectedFilter = (jwtToken)=>{
    const url = `/apps/${this.props.store.app.key}/segments/${this.props.store.segment.id}/${jwtToken}`
    //this.props.history.push(url) 
  }

  getTextForPredicate = (o)=>{
    if(o.type === "match"){
      return `Match ${o.value === "and" ? "all" : "any" } criteria`
    }else{
      return `Match: ${o.attribute} ${o.comparison ? o.comparison : '' } ${o.value ? o.value : ''}`
    }
  }

  render(){
    //console.log(this.getPredicates())
    // this.props.actions.getPredicates()
    return <div style={{marginTop: '10px'}}>
            <ButtonGroup>

              {
                this.props.predicates.map((o, i)=>{
                    return <SegmentItemButton 
                            key={i}
                            index={i}
                            predicates={this.props.predicates}
                            predicate={o}
                            open={ !o.comparison }
                            appearance={ o.comparison ? "primary" : "default"} 
                            text={this.getTextForPredicate(o)}
                            updatePredicate={this.props.updatePredicate}
                            deletePredicate={this.props.deletePredicate}                          
                           />
                })
              }

              <InlineFilterDialog
                {...this.props}
                addPredicate={this.props.addPredicate}
                handleClick={this.handleClickOnSelectedFilter.bind(this)}
              />

              {
                /*
                <SaveSegmentModal 
                  title="Save Segment" 
                  segment={this.props.store.segment}
                  savePredicates={this.props.actions.savePredicates}
                  deleteSegment={this.props.actions.deleteSegment}
                />
                */
              }

            </ButtonGroup>

            <ButtonGroup>
              
              {this.props.children}

            </ButtonGroup>
        

            { /*
              this.props.store.app.segments.map((o)=>(
                  <p key={o.id}>{o.name}</p>
                )
              )
            */}

            {/*JSON.stringify(this.props.data)*/}


            {
              this.props.app_users.length > 0 ?
                <DataTable
                  meta={this.props.meta}
                  loading={this.props.loading} 
                  data={this.props.app_users}/> : null 
            }


            <hr/>

          </div>
  }
} 




class DataTable extends Component {


  constructor(props) {
    super(props)

    this.state = {
      dialogs: {}
    }

    this.createHead = (withWidth) => {
      return {
        cells: [
          {
            key: 'email',
            content: 'email',
            shouldTruncate: true,
            isSortable: true,
            width: withWidth ? 25 : undefined,
          },
          {
            key: 'state',
            content: 'State',
            shouldTruncate: true,
            isSortable: true,
            width: withWidth ? 10 : undefined,
          },
          {
            key: 'last_visited_at',
            content: 'last_visited_at',
            shouldTruncate: true,
            isSortable: true,
            width: withWidth ? 15 : undefined,
          },
          {
            key: 'os',
            content: 'Os',
            shouldTruncate: true,
            isSortable: true,
            width: withWidth ? 15 : undefined,
          },
          {
            key: 'browser',
            content: 'Browser',
            shouldTruncate: true,
            isSortable: true,
            width: withWidth ? 15 : undefined,
          },

          {
            key: 'action',
            content: 'Actions',
            shouldTruncate: true,
          },
        ],
      };
    };

    this.head = this.createHead(true);

  }

  renderCaption = () => {
    return <div>
      {this.props.meta.total_count} results
    </div>
  }

  toggleDialogFor = (id)=>{

    var hash = {};
    hash[id] = !this.state.dialogs[id]

    this.setState({
      dialogs: Object.assign(
        {}, 
        this.state.dialogs, 
        hash
      )
    })
  }

  rows = ()=>{
    return this.props.data.map((user, index) => {
 
      let userData  = <ul style={{height: '200px', overflow: 'auto'}}> 
                          {
                            Object.keys(user).map((o)=>(
                              <li><b>{o}:</b> {user[o]}</li>
                            ))
                          } 
                      </ul>
      return {
        key: `row-${index}-${user.id}`,
        cells: [
          {
            key: `${user.id}-email`,
            content: <div>
              <div style={{ float: 'left' }}>
                <Avatar
                  name={user.email}
                  size="medium"
                  src={`https://api.adorable.io/avatars/24/${encodeURIComponent(
                    user.email,
                  )}.png`}
                />
              </div>
              <div style={{
                float: 'left',
                marginLeft: '10px',
                marginTop: '9px'
              }}>
                {user.email}
              </div>
            </div>,
          },
          {
            key: `${user.id}-state`,
            content: <Lozenge
              appearance={user.state == "online" ? 'success' : 'moved'}
              isBold>
              {user.state}
            </Lozenge>,
          },
          {
            key: `${user.id}-last_visited_at`,
            content: <Moment fromNow>{user.last_visited_att}</Moment>,
          },

          {
            key: `${user.id}-browser`,
            content: `${user.browser} ${user.browser_version}`,
          },

          {
            key: `${user.id}-os`,
            content: `${user.os} ${user.os_version}`,
          },

          {
            key: `${user.id}-scheduled_to`,
            content: user.id,
          },

          {
            content: (

              <div>

                <InlineDialog 
                  content={userData}
                  isOpen={this.state.dialogs[user.id]}
                  position={"bottom right"}
                  shouldFlipunion={true} />

                  <Button onClick={() => this.toggleDialogFor(user.id)}>
                    data
                  </Button>

              </div>

              

            ),
          }
        ],
      }
    });
  }


  render() {

    return (
      
        <DynamicTable
          caption={this.renderCaption()}
          head={this.head}
          rows={this.rows()}
          rowsPerPage={10}
          defaultPage={1}
          loadingSpinnerSize="large"
          isLoading={this.props.loading}
          isFixedSize
          defaultSortKey="email"
          defaultSortOrder="ASC"
          onSort={() => console.log('onSort')}
          onSetPage={() => console.log('onSetPage')}
        />
      
    );
  }
}