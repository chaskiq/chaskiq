// same as SegmentItemButton


import React, {Component} from "react"

import AddIcon from '@material-ui/icons/Add'
import FormDialog from '../FormDialog'
import {appUsersFormat} from './appUsersFormat' 
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import styled from '@emotion/styled'
import { withStyles } from '@material-ui/core/styles';
import {
  Button,
  MenuItem,
  Menu,
  Radio ,
  RadioGroup ,
  FormControlLabel ,
  TextField
} from '@material-ui/core';

const TextField1 = withStyles({
  root: {
    marginRight: '10px',
    marginTop: '0px',
    /*border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },*/
  },
  expanded: {},
})(TextField);

const ContentMatchTitle = styled.h5`
  margin: 15px;
  border-bottom: 2px solid #6f6f6f;
`

const ContentMatch = styled.div`
  overflow: auto;
  width: 300px;
  height: 221px;
  padding-left: 14px;
  border-bottom: 1px solid #ccc;
  margin-bottom: 7px;
`

const ContentMatchFooter = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-evenly;
`

export default class SegmentItemButton extends Component {
  state = {
    dialogOpen: this.props.open,
    selectedOption: this.props.predicate.comparison,
    btn: null
  };

  relative_input = null
  btn_ref = null

  onRadioChange = (value, cb)=> {
    this.setState({
      selectedOption: value
    }, ()=> cb ? cb() : null)
  };

  handleSubmit = (e)=> {
    //this.props.predicate.type
    let value = null 
    
    if(this.relative_input && !this.relative_input.value)
      return this.toggleDialog2()

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
    const new_predicates = this.props.predicates.map(
      (o, i)=> this.props.index === i ? response : o  
    )
    
    this.props.updatePredicate(new_predicates, this.props.predicateCallback )

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

  toggleDialog2 = ()=>{
    this.setState({dialogOpen: !this.state.dialogOpen })
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

    return <ClickAwayListener onClickAway={this.toggleDialog2.bind(this)}>

            <div>

              {/*<ContentMatchTitle>
                <h5>Select the filter</h5>
              </ContentMatchTitle>*/}

              <ContentMatch>
                <RadioGroup
                  aria-label="options"
                  name="options"
                  onChange={(e)=>{
                    this.onRadioChange(e.target.value)
                  }}>
                  {
                    relative.map((o)=>(
                      <div style={{ 
                                   display: 'flex',
                                   flexDirection: 'column'                                 
                                 }}>

                        <FormControlLabel
                          control={<Radio 
                                    checked={this.state.selectedOption === o.value} 
                                   />} 
                          value={o.value}
                          label={o.label} 
                        /> 

                        {

                          this.state.selectedOption && 
                          this.state.selectedOption === o.value ?
                          
                        
                            <TextField1
                              //id="standard-uncontrolled"
                              //label="Uncontrolled"
                              //classes={}
                              //variant={"outlined"}
                              defaultValue={this.props.predicate.value}
                              inputRef={input => (
                                this.relative_input = input)
                              }
                              label={"value"}
                              //className={classes.textField}
                              margin="normal"
                            /> : null

                        }

                      </div>

                    ))
                  }
                </RadioGroup>
              </ContentMatch>

              { 
                this.state.selectedOption && 
                (this.state.selectedOption !== "is_null" || 
                  this.state.selectedOption !== "is_not_null") ?
                
                <ContentMatchFooter>

                  <Button
                    variant="outlined" 
                    color="primary"
                    size={"small"}
                    onClick={this.handleSubmit.bind(this)}>
                    Apply
                  </Button>
                  
                  { 
                  !this.props.predicate.comparison ? 
                    null : 
                    this.deleteButton() 
                  }

                  {/*<Button
                      variant="outlined"
                      color="primary"
                      onClick={this.handleSubmit.bind(this)}>
                      cancel
                    </Button>*/}

                </ContentMatchFooter> : null
              }



              
            
            </div>

          </ClickAwayListener>

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

    return  <div>
                <MenuItem disabled={true}>
                  Select the date filter
                </MenuItem>


               <ContentMatch>
                <RadioGroup
                  aria-label="options"
                  name="options"
                  onChange={(e)=>{
                    this.onRadioChange(e.target.value)
                  }}>
                  {
                    relative.map((o)=>(
                      <div style={{ 
                                   display: 'flex',
                                   flexDirection: 'column'                                 
                                 }}>

                        <FormControlLabel
                          control={<Radio 
                            checked={this.state.selectedOption === o.value}/>} 
                          value={o.value}
                          label={o.label} 
                        /> 


                        {

                          this.state.selectedOption && 
                          this.state.selectedOption === o.value ?
                          
                        
                            <TextField1
                              //id="standard-uncontrolled"
                              //label="Uncontrolled"
                              //classes={}
                              //variant={"outlined"}
                              autoFocus
                              id="name"
                              name="name"
                              label="name"
                              type="number"
                              helperText={"days ago"}
                              defaultValue={this.props.predicate.value}
                              inputRef={input => (
                                this.relative_input = input)
                              }
                              label={"value"}
                              //className={classes.textField}
                              margin="normal"
                            /> : null

                        }

                      </div>

                    ))
                  }
                </RadioGroup>
              </ContentMatch>


              { 
                this.state.selectedOption ?
                
                <ContentMatchFooter>

                  <Button
                    variant="outlined" 
                    color="primary"
                    size={"small"}
                    onClick={this.handleSubmit.bind(this)}>
                    Apply
                  </Button>
                  
                  { 
                  !this.props.predicate.comparison ? 
                    null : 
                    this.deleteButton() 
                  }

                  {/*<Button
                      variant="outlined"
                      color="primary"
                      onClick={this.handleSubmit.bind(this)}>
                      cancel
                    </Button>*/}

                </ContentMatchFooter> : null
              }



              

                {
                  /*
                

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
                      helperText={"days ago"}
                      inputRef={input => (this.relative_input = input)}
                    />

                    <hr/>

                    <Button 
                      variant="outlined"
                      color="primary"
                      size={"small"}
                      onClick={this.handleSubmit.bind(this)}>
                      Apply
                    </Button>

                    { 
                        !this.props.predicate.comparison ? 
                          null : this.deleteButton() 
                      }

                  </div> : null
                }

                */}

                
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
    return <Button 
            size="small" 
            appearance="link" 
            onClick={this.handleDelete.bind(this)}>
            Delete
           </Button>
  }

  toggleDialog = (e) => this.setState({ 
    dialogOpen: !this.state.dialogOpen,
    btn: e ? e.target : this.state.btn
  });

  toggleDialog2 = () => this.setState({ 
    dialogOpen: !this.state.dialogOpen
  });

  renderMenu = ()=>{

    if(!this.btn_ref)
      return

    return <Menu 
              open={this.state.dialogOpen}
              anchorEl={this.btn_ref}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              /*transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}*/
              //position={"bottom center"}
              //shouldFlipunion={true}
              >

              <ClickAwayListener 
                onClickAway={this.toggleDialog2.bind(this)}>
                {this.renderOptions()}
              </ClickAwayListener>
            </Menu>
  }

  setRef = (ref)=>{
    this.btn_ref = ref
  }

  render() {
    return (
      <div>
          <React.Fragment>
            <div >
              {
                !this.props.predicate.comparison ?

                  <React.Fragment>
                    <Button 
                      ref={(ref)=>this.setRef(ref)} 
                      isLoading={false}
                      color={this.state.dialogOpen ? 'primary' : 'secondary'}
                      onClick={this.toggleDialog}>
                      {
                        !this.state.dialogOpen ?
                          "Missing value!" :
                          this.props.text
                      }
                    </Button>
                    {this.renderMenu()}
                  </React.Fragment> :
                  <React.Fragment>
                    <Button 
                      ref={(ref)=>this.setRef(ref)}
                      isLoading={false}
                      variant="outlined" 
                      color="primary"
                      //appearance={this.props.appearance}
                      onClick={this.toggleDialog}>
                      {this.props.text}
                    </Button>
                    {this.renderMenu()}
                  </React.Fragment>
              } 

            </div>
    
          </React.Fragment>

      </div>
    );
  }
}