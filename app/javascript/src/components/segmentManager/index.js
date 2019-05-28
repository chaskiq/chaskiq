
import React, {Component} from "react"

import PieChartIcon from '@material-ui/icons/PieChart'
import AddIcon from '@material-ui/icons/Add'
import FormDialog from '../FormDialog'
import DataTable from '../dataTable'
import {appUsersFormat} from './appUsersFormat' 

import {
  Button,
  MenuItem,
  Menu,
  Radio ,
  RadioGroup ,
  FormControlLabel ,
  TextField
} from '@material-ui/core';

import styled from 'styled-components'

const ContentMatchTitle = styled.h5`
  margin: 15px;
  border-bottom: 2px solid #6f6f6f;
`

const ContentMatch = styled.div`
  overflow: auto;
  width: 100%;
  height: 121px;
  margin-bottom: 25px;
  padding-left: 14px;
`

const ContentMatchFooter = styled.div`
  /* position: absolute; */
  bottom: 0px;
  width: 100%;
  left: 0px;
  padding: 9px;
  /* background: #ccc; */
  margin-top: 10px;
  border-top: 1px solid #ccc;
  display: flex;
  align-items: baseline;
`

const ButtonGroup = styled.div`
  display: inline-flex;
  button {
    margin-right: 5px !important;
  }
`

// same as SegmentItemButton
export class SegmentItemButton extends Component {
  state = {
    dialogOpen: this.props.open,
    selectedOption: this.props.predicate.comparison,
    btn: null
  };

  relative_input = null

  onRadioChange = (value, cb)=> {
    this.setState({
      selectedOption: value
    }, ()=> cb ? cb() : null)
  };

  handleSubmit = (e)=> {
    //this.props.predicate.type
    let value = null 
    switch(this.props.predicate.type){
      case "string": {
        value = `${this.relative_input.value}`
        break;
      }
      case "date": {
        value = `${this.relative_input.value} days ago`
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

              <ContentMatchTitle>
                <h5>Select the filter</h5>
              </ContentMatchTitle>

              <ContentMatch>
                <RadioGroup
                  aria-label="options"
                  name="options"
                  onChange={(e)=>{
                    this.onRadioChange(e.target.value)
                  }}>
                  {
                    relative.map((o)=>(
                      <FormControlLabel
                        control={<Radio />} 
                        value={o.value}
                        label={o.label} 
                      />                  
                    ))
                  }
                </RadioGroup>
              </ContentMatch>

              { 
                this.state.selectedOption && 
                (this.state.selectedOption !== "is_null" || 
                  this.state.selectedOption !== "is_not_null") ?
                
                <ContentMatchFooter>

                  <TextField
                    //id="standard-uncontrolled"
                    //label="Uncontrolled"
                    defaultValue={null}
                    inputRef={input => (this.relative_input = input)}
                    label={"value"}
                    //className={classes.textField}
                    margin="normal"
                  />

                  <div style={{margin: '5px'}}></div>

                  <Button
                    variant="outlined" 
                    color="primary"
                    onClick={this.handleSubmit.bind(this)}>
                    Apply
                  </Button>

                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={this.handleSubmit.bind(this)}>
                    cancel
                  </Button>

                </ContentMatchFooter> : null
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

              <MenuItem disabled={true}>
                Select the date filter
              </MenuItem>

              {
                relative.map((o)=>(
                  <MenuItem
                    key={o.name}
                    disabled={compare(o.value)}
                    selected={compare(o.value)}
                    onClick={e =>   
                      this.onRadioChange.bind(this)(
                        o.value, 
                        this.handleSubmit.bind(this) 
                      )
                    }
                  >
                    {o.label}
                  </MenuItem>
                ))
              }

              { this.state.selectedOption ?
                <div>

                  <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    name="name"
                    label="name"
                    type="number"
                    fullWidth
                    defaultValue={30} 
                    inputRef={input => (this.relative_input = input)}
                  />



                  <span>days ago</span>
                  <hr/>

                  <Button 
                    variant="outlined"
                    color="primary"
                    onClick={this.handleSubmit.bind(this)}>
                    Apply
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
            
              <MenuItem disabled={true}>
                match criteria options:
              </MenuItem>

              {
                relative.map((o)=>(
                  <MenuItem
                    key={o.name}
                    disabled={compare(o.value)}
                    selected={compare(o.value)}
                    onClick={e =>   
                      this.onRadioChange.bind(this)(
                        o.value, 
                        this.handleSubmit.bind(this) 
                      )
                    }
                  >
                    {o.label}
                  </MenuItem>
                ))
              }
            </div>
  }

  deleteButton = () => {
    return <Button size="small" appearance="link" 
            onClick={this.handleDelete.bind(this)}>
            Delete
           </Button>
  }

  toggleDialog = (e) => this.setState({ 
    dialogOpen: !this.state.dialogOpen,
    btn: e ? e.target : this.state.btn
  });

  render() {
    return (
      <div>
        <div id="aa">
          {
            !this.props.predicate.comparison ?

              <Button isLoading={false}

                color={this.state.dialogOpen ? 'primary' : 'secondary'}
                onClick={this.toggleDialog}>
                {
                  !this.state.dialogOpen ?
                    "Missing value!" :
                    this.props.text
                }
              </Button> :

              <Button isLoading={false}
                variant="outlined" 
                color="primary"
                //appearance={this.props.appearance}
                onClick={this.toggleDialog}>
                {this.props.text}
              </Button>
          }

        </div>


        <Menu 
          open={this.state.dialogOpen}
          anchorEl={document.getElementById("aa")}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          //position={"bottom left"}
          //shouldFlipunion={true}
          >
         
          {this.renderOptions()}
        </Menu>

      </div>
    );
  }
}

export class SaveSegmentModal extends Component {
  state = { 
    isOpen: false, 
    action: "update",
    loading: false,
    input: null
  };
  open  = () => this.setState({ isOpen: true });
  close = () => this.setState({ isOpen: false });
  input_ref = null
  
  secondaryAction = ({ target }: Object) => {
    this.props.savePredicates({
      action: this.state.action,
      input: this.input_ref ? this.input_ref.value : null
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
    /*const actions = [
      { text: 'Close', onClick: this.close },
      { text: 'Save Segment', onClick: this.secondaryAction.bind(this) },
      { text: 'Remove Segment', onClick: this.deleteAction.bind(this) }
    ];*/

    return (
      <div>

        <Button isLoading={false} 
          variant={'small'}
          appearance={'link'}
          onClick={this.open}>
          <PieChartIcon variant="small" />
          {" "}
          Save Segment
        </Button>

        <Button isLoading={false} 
          variant={'small'}
          appearance={'link danger'}
          onClick={this.deleteAction.bind(this)}>
          <PieChartIcon />
          {" "}
          remove Segment
        </Button>


        {isOpen && (
          <FormDialog 
            open={isOpen}

            //contentText={"lipsum"}
            titleContent={"Save Segment"}
            formComponent={
              !loading ?
                 <div>


                  <RadioGroup
                    aria-label="options"
                    name="options"
                    onChange={this.handleChange.bind(this)}
                  >
                    <FormControlLabel
                      control={<Radio />} 
                      value="update"
                      label={`Save changes to the segment ‘${this.props.segment.name}’`} 
                    />
                    <FormControlLabel
                      control={<Radio />} 
                      value="new"
                      label="Create new segment" 
                    />

                  </RadioGroup>

                  {
                    this.state.action === "new" ?

                      <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        name="name"
                        label="name"
                        type="email"
                        ref={"input"}
                        fullWidth
                        inputRef={input => (this.input_ref = input)}
                      /> : null
                  }


                  {
                    /*
                    actions.map((o, i)=> (
                      <Button key={i}
                        onClick={o.onClick}>
                        {o.text}
                      </Button>
                     )
                    )
                    */
                  }

                </div> : <Spinner/>
            }

            dialogButtons={
              <React.Fragment>
                <Button onClick={this.close} color="primary">
                  Cancel
                </Button>

                <Button onClick={this.secondaryAction.bind(this)} 
                  zcolor="primary">
                  {
                    this.state.action === "update" ? "Save" : "Save New"
                  }
                </Button>

              </React.Fragment>
            }
            //actions={actions} 
            //onClose={this.close} 
            //heading={this.props.title}
            >
            
            

          </FormDialog>
        )}
      </div>
    );
  }
}

export class InlineFilterDialog extends Component {
  state = {
    dialogOpen: false
  };

  _my_field = null

  toggleDialog = (e) => this.setState({ 
    dialogOpen: !this.state.dialogOpen
  });

  handleClick = (e, o) => {
    this.setState({
      dialogOpen: !this.state.dialogOpen
    }, ()=>{
        this.props.addPredicate(o, (token) => {
          this.props.handleClick(token)
        })
    });
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
        <MenuItem disabled={true}>
          Select field:
        </MenuItem>

        {
          fields.map((o)=>(
            <MenuItem
              key={o.name}
              onClick={(e)=> this.handleClick.bind(this)(e, o)}
            >
              {o.name}
            </MenuItem>
          ))
        }
       
      </div>
    );


    return (
      <div>
        <Button 
          innerRef={(ref)=> this._my_field = ref}
          isLoading={false}
          variant="outlined"
          color="primary"
          onClick={this.toggleDialog}>
          <AddIcon />
          {" "}
          Add filterss
        </Button>
      
        <Menu 
          //content={content} 
          anchorEl={this._my_field}
          open={this.state.dialogOpen}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          //position="bottom left"
          >
          {content}
        </Menu>

      </div>
    );
  }
}

/*
export class InlineCriteriaDialog extends Component {
  state = {
    dialogOpen: false,
    btn: null
  };

  toggleDialog = (e) => this.setState({ 
    dialogOpen: !this.state.dialogOpen,
    btn: e.target
  });

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
            fields.map((o)=> <MenuItem key={o.name}>
                              <Button 
                                color={'primary'} 
                                variant="outlined"
                                onClick={(e)=> this.handleClick.bind(this)(e, o)}>
                                {o.name}
                              </Button>
                             </MenuItem>
            )
          }
        </ul>
      </div>
    );

    return (
      <div style={{ minHeight: '120px' }}>
        <Menu
          anchorEl={this.state.btn}
          open={this.state.dialogOpen}
          //position="bottom left"
          >
          {content}
        </Menu>

        <Button isLoading={false} 
          appearance={'link'}
          onClick={this.toggleDialog}>
          <i className="fas fa-plus"></i>
          {" "}
          Add filter
        </Button>
   
      </div>
    );
  }
}*/


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

              {this.props.children}

            </ButtonGroup>

            <DataTable 
              title={'segment'}
              columns={appUsersFormat()} 
              meta={this.props.meta}
              data={this.props.app_users}
              //search={this.props.actions.search}
            />

          </div>
  }
} 