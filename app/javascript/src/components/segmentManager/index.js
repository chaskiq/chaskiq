
import React, {Component} from "react"

import PieChartIcon from '@material-ui/icons/PieChart'
import AddIcon from '@material-ui/icons/Add'
import FormDialog from '../FormDialog'
import DataTable from '../newTable'

import {appUsersFormat} from './appUsersFormat' 
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import SegmentItemButton from './itemButton'
import {Map, List, fromJS} from 'immutable'

import {
  Button,
  MenuItem,
  Menu,
  Radio ,
  RadioGroup ,
  FormControlLabel ,
  TextField
} from '@material-ui/core';

import styled from '@emotion/styled'

const ContentMatchTitle = styled.h5`
  margin: 15px;
  border-bottom: 2px solid #6f6f6f;
`

const ContentMatch = styled.div`
  overflow: auto;
  width: 300px;
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
  //display: inline-flex;
  //display: -webkit-box;

  display: inline-flex;
  flex-wrap: wrap;

  button {
    margin-right: 5px !important;
  }
`



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

  equalPredicates = ()=>{
    return fromJS(this.props.segment.predicates).equals( 
      fromJS(this.props.segment.initialPredicates)
    )
  }

  incompletePredicates = ()=>{
    return this.props.segment.predicates.find((o)=> !o.comparison || !o.value )
  }

  render() {
    const { isOpen, loading } = this.state;

    return (

        <React.Fragment>
          <Button isLoading={false} 
            variant={'small'}
            appearance={'link'}
            onClick={this.open}
            disabled={this.equalPredicates() || this.incompletePredicates()}>
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
        </React.Fragment>
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
          //this.props.handleClick(token)
        })
    });
  }

  
  toggleDialog2 = ()=>{
    this.setState({dialogOpen: !this.state.dialogOpen})
  }


  render() {

    const fields = this.props.fields || [
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

      <ClickAwayListener onClickAway={this.toggleDialog2.bind(this)}>
        <div>
          <MenuItem disabled={true}>
            Select field:
          </MenuItem>

          <div style={{height: "200px", width: '250px', overflow: 'auto'}}>
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
         
        </div>
       </ClickAwayListener>
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
              horizontal: 'left',
            }}
            /*transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}*/
            //position="bottom left"
            >
            {content}
          </Menu>
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

            {
              <DataTable 
                title={'segment'}
                meta={this.props.meta}
                rows={this.props.collection}
                search={this.props.search}
                loading={this.props.loading}
                columns={this.props.columns}
                defaultHiddenColumnNames={this.props.defaultHiddenColumnNames}
                tableColumnExtensions={this.props.tableColumnExtensions}
                leftColumns={this.props.leftColumns}
                rightColumns={this.props.rightColumns}
                toggleMapView={this.props.toggleMapView}
                map_view={this.props.map_view}
                enableMapView={this.props.enableMapView}

              />
            }

          </div>
  }
} 