// same as SegmentItemButton


import React, {Component} from "react"

import AddIcon from '@material-ui/icons/Add'
import FormDialog from '../FormDialog'
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import styled from '@emotion/styled'
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import TextField from '@material-ui/core/TextField'

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
  }
})(TextField);

const ContentMatchTitle = styled.h5`
  margin: 15px;
  border-bottom: 2px dotted #6f6f6f26;
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

  position: absolute;
  bottom: 1px;
  padding: 1em;
  background: ${(props)=> props.theme.palette.background.paper};
  box-shadow: -1px -1px 6px 0px ${(props)=> props.theme.palette.background.paper};
  width: 100%;
`

const ContentMatchWrapper = styled.div`
  margin-bottom: 3em;
`

export default class SegmentItemButton extends Component {
  state = {
    dialogOpen: this.props.open,
    selectedOption: this.props.predicate.comparison,
    checkedValue: this.props.predicate.value, 
    btn: null
  };

  relative_input = null
  btn_ref = null
  blockStyleRef = React.createRef();

  onRadioChange = (target, cb)=> {
    const {value} = target
 
    window.blockStyleRef = this.blockStyleRef.current
    window.target = target

    this.setState({
      selectedOption: value
    }, ()=> {

      setTimeout(()=> {
        const el = this.blockStyleRef.current
        const diff = target.getBoundingClientRect().top - el.getBoundingClientRect().top
        this.blockStyleRef.current.scrollTop = diff
      }, 20)

      cb ? cb() : null
    })
  };

  onRadioTypeChange = (target, cb)=>{
    const s = this.state.selectedOption
    const h = {
      comparison: "eq",
      value: target.value
    }

    const response = Object.assign({}, this.props.predicate, h )

    const new_predicates = this.props.predicates.map(
      (o, i)=> this.props.index === i ? response : o  
    )

    this.setState({
      checkedValue: target.value,
      selectedOption: "eq"
    })
    
    //, ()=>{
    //  this.props.updatePredicate(new_predicates, this.props.predicateCallback )
    //})
  }

  handleSubmit = (e)=> {
    //this.props.predicate.type
    let value = null 
    
    if(this.relative_input && !this.relative_input.value)
      return this.toggleDialog2()

    switch(this.props.predicate.type){
      case "string": {
        switch (this.props.predicate.attribute) {
          case "type":
            // we assume here that this field is auto applied
            // todo: set radio button on mem and update only on apply click 
            value = `${this.state.checkedValue}`
            break;
          default:
            value = `${this.relative_input.value}`
            break;
        }
        break
      }

      case "integer": {
        value = this.relative_input.value
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
        switch(this.props.predicate.attribute){
          case "type": 
            return this.contentType()
          default:
            return this.contentString()
        }
      }

      case "date": {
        return this.contentDate()
      }

      case "integer": {
        return this.contentInteger()
      }

      case "match": {
        return this.contentMatch() 
      }
    }

  }

  toggleDialog2 = ()=>{
    this.setState({dialogOpen: !this.state.dialogOpen })
  }

  contentType = ()=>{
    const compare = (value)=>{
      return this.props.predicate.comparison === value
    }

    const relative = [
      {label: "AppUser", value: "AppUser", defaultSelected: false},
      {label: "Lead", value: "Lead", defaultSelected: false},
      {label: "Visitor", value: "Visitor", defaultSelected: false},
    ]

    return <ClickAwayListener 
              onClickAway={this.toggleDialog2.bind(this)}>

            <ContentMatchWrapper>

              {<MenuItem>
                <ContentMatchTitle>
                  Select the filter for {this.props.predicate.attribute}
                </ContentMatchTitle>
              </MenuItem>}

              <ContentMatch ref={this.blockStyleRef}>
                <RadioGroup
                  aria-label="options"
                  name="options"
                  onChange={(e)=>{
                    this.onRadioTypeChange(e.target)
                  }}>
                  {
                    relative.map((o, i)=>(
                      <div  key={`${o.name}-${i}`}
                            style={{ 
                                   display: 'flex',
                                   flexDirection: 'column'                                 
                                 }}>

                        <FormControlLabel
                          control={<Radio 
                                    checked={o.label === this.state.checkedValue} 
                                   />} 
                          value={o.value}
                          label={o.label} 
                        />

                      </div>

                    ))
                  }
                </RadioGroup>
              </ContentMatch>

              <ContentMatchFooter>

                { 
                  this.state.selectedOption && 
                  (this.state.selectedOption !== "is_null" || 
                    this.state.selectedOption !== "is_not_null") &&
                  
                  <Button
                    variant="outlined" 
                    color="primary"
                    size={"small"}
                    onClick={this.handleSubmit.bind(this)}>
                    Apply
                  </Button>

                }

                { this.deleteButton()  }
              </ContentMatchFooter> 
            </ContentMatchWrapper>
          </ClickAwayListener>
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

            <ContentMatchWrapper>

              {<MenuItem>
                <ContentMatchTitle>
                  Select the filter for {this.props.predicate.attribute}
                </ContentMatchTitle>
              </MenuItem>}

              <ContentMatch ref={this.blockStyleRef}>
                <RadioGroup
                  aria-label="options"
                  name="options"
                  onChange={(e)=>{
                    this.onRadioChange(e.target)
                  }}>
                  {
                    relative.map((o, i)=>(
                      <div  key={`${o.name}-${i}`}
                            style={{ 
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

              <ContentMatchFooter>

                { 
                  this.state.selectedOption && 
                  (this.state.selectedOption !== "is_null" || 
                    this.state.selectedOption !== "is_not_null") &&
                  
                  <Button
                    variant="outlined" 
                    color="primary"
                    size={"small"}
                    onClick={this.handleSubmit.bind(this)}>
                    Apply
                  </Button>

                }

                { this.deleteButton()  }
                {/*<Button
                    variant="outlined"
                    color="primary"
                    onClick={this.handleSubmit.bind(this)}>
                    cancel
                  </Button>*/}

              </ContentMatchFooter> 

            </ContentMatchWrapper>

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

    const extractNum = this.props.predicate.value ? 
                       this.props.predicate.value.match(/\d+/)[0] : ""
    
    const parsedNum = parseInt(extractNum)

    return  <ContentMatchWrapper>

              <MenuItem disabled={true}>
                <ContentMatchTitle>
                  Select the date filter for {this.props.predicate.attribute}
                </ContentMatchTitle>
              </MenuItem>

              <ContentMatch ref={this.blockStyleRef}>
                <RadioGroup
                  aria-label="options"
                  name="options"
                  onChange={(e)=>{
                    this.onRadioChange(e.target)
                  }}>
                  {
                    relative.map((o, i)=>(
                      <div  
                        key={`${o.name}-${i}`}
                        style={{ 
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
                              autoFocus
                              id="name"
                              name="name"
                              label="name"
                              type="number"
                              helperText={'days ago'}
                              defaultValue={parsedNum}
                              inputRef={input => (
                                this.relative_input = input)
                              }
                              label={"value"}
                              margin="normal"
                            /> : null
                        }

                      </div>

                    ))
                  }
                </RadioGroup>
              </ContentMatch>

              <ContentMatchFooter>
                { 
                  this.state.selectedOption &&
                  
                  <Button
                    variant="outlined" 
                    color="primary"
                    size={"small"}
                    onClick={this.handleSubmit.bind(this)}>
                    Apply
                  </Button>

                }
                
                { 
                  this.deleteButton() 
                }

              </ContentMatchFooter> 
            
            </ContentMatchWrapper>
  }


  contentInteger = () => {
  
    const compare = (value)=>{
      return this.props.predicate.comparison === value
    }

    const relative = [
      {label: "exactly", value: "eq",  defaultSelected: compare("eq")  },
      {label: "more than", value: "gt", defaultSelected: compare("gt")  },
      {label: "more than eq", value: "gteq", defaultSelected: compare("gteq")  },
      {label: "less than", value: "lt", defaultSelected: compare("lt")  },
      {label: "less than eq", value: "lteq", defaultSelected: compare("lteq")  }
    ]

    const extractNum = this.props.predicate.value ? 
                       this.props.predicate.value.match(/\d+/)[0] : ""
    
    const parsedNum = parseInt(extractNum)

    return  <ContentMatchWrapper>

              <MenuItem disabled={true}>
                <ContentMatchTitle>
                  Select the integer filter for {this.props.predicate.attribute}
                </ContentMatchTitle>
              </MenuItem>

              <ContentMatch ref={this.blockStyleRef}>
                <RadioGroup
                  aria-label="options"
                  name="options"
                  onChange={(e)=>{
                    this.onRadioChange(e.target)
                  }}>
                  {
                    relative.map((o, i)=>(
                      <div  
                        key={`${o.name}-${i}`}
                        style={{ 
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
                              autoFocus
                              id="name"
                              name="name"
                              label="name"
                              type="number"
                              helperText={"any number"}
                              defaultValue={parsedNum}
                              inputRef={input => (
                                this.relative_input = input)
                              }
                              label={"value"}
                              margin="normal"
                            /> : null
                        }

                      </div>

                    ))
                  }
                </RadioGroup>
              </ContentMatch>

              <ContentMatchFooter>
                { 
                  this.state.selectedOption &&
                  
                  <Button
                    variant="outlined" 
                    color="primary"
                    size={"small"}
                    onClick={this.handleSubmit.bind(this)}>
                    Apply
                  </Button>

                }
                
                { 
                  this.deleteButton() 
                }

              </ContentMatchFooter> 
            
            </ContentMatchWrapper>
  }

  contentMatch = () => {
  
    const compare = (value)=>{
      return this.props.predicate.value === value
    }

    const relative = [
      {label: "match any", comparison: "or", value: "or", defaultSelected: compare("or")  },
      {label: "match all", comparison: "and", value: "and",  defaultSelected: compare("and")  },
    ]

    return <ContentMatchWrapper>
            
            <MenuItem disabled={true}>
              <ContentMatchTitle> 
                match criteria options for {this.props.predicate.type}
              </ContentMatchTitle>
             
            </MenuItem>


            {
              relative.map((o, i)=>(
                <MenuItem
                  key={`${o.name}-${i}`}
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

          </ContentMatchWrapper>
           
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

  closeDialog = () => this.setState({ 
    dialogOpen: false
  });

  openDialog = () => this.setState({ 
    dialogOpen: true
  });

  renderMenu = ()=>{

    if(!this.btn_ref)
      return

    return <Menu 
              open={this.state.dialogOpen}

              anchorEl={this.btn_ref}
              /*anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}*/
              /*transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}*/
              //position={"bottom center"}
              //shouldFlipunion={true}
              >

              <ClickAwayListener 
                onClickAway={this.closeDialog}>
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
                      color={"secondary"}
                      //{this.state.dialogOpen ? 'primary' : 'secondary'}
                      onClick={this.openDialog}>
                      {
                        /*
                        !this.state.dialogOpen ?
                          "Missing value!" :
                          this.props.text
                        */
                      }

                      {"Missing value!"}
                    </Button>
                    {this.renderMenu()}
                  </React.Fragment> :
                  <React.Fragment>
                    <Button 
                      ref={(ref)=>this.setRef(ref)}
                      isLoading={false}
                      variant={"contained"} 
                      color="primary"
                      //appearance={this.props.appearance}
                      onClick={this.openDialog}>
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