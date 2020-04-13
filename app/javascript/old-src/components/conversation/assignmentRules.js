
import React from  'react'

import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import FormControl from '@material-ui/core/FormControl'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem' 
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Avatar from '@material-ui/core/Avatar'

import defaultFields from '../../shared/defaultFields'

import FormDialog from '../FormDialog'
import FieldRenderer from '../../shared/FormFields'
import { 
    AGENTS,
    ASSIGNMENT_RULES
} from "../../graphql/queries"

import {
  CREATE_ASSIGNMENT_RULE,
  EDIT_ASSIGNMENT_RULE,
  DELETE_ASSIGNMENT_RULE,
  UPDATE_RULE_PRIORITIES
} from '../../graphql/mutations'

import graphql from "../../graphql/client"
import serialize from 'form-serialize'

import {
  withRouter
} from 'react-router-dom'
import { connect } from 'react-redux'

import { withStyles } from '@material-ui/core/styles';

import DragHandleIcon from '@material-ui/icons/DragHandle'
import {
  sortableContainer, 
  sortableElement,
  sortableHandle,
} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import {InlineFilterDialog} from '../segmentManager'
import SegmentItemButton from '../segmentManager/itemButton'
import { setCurrentPage, setCurrentSection } from '../../actions/navigation'


const styles = theme => ({
  button: {
    margin: theme.spacing(1),
  },
  wrapper: {
    [theme.breakpoints.down('sm')]: {
      width: '100vw'
    },
    [theme.breakpoints.up('md')]: {
      width: '100%'
    },
    [theme.breakpoints.up('lg')]: {
      width: '100%'
    },
  }

});

const DragHandle = sortableHandle(() => <Box m={1}><DragHandleIcon/></Box>);

const SortableItem = sortableElement(({object, deleteRule, edit, classes}) => (
    <ListItem divider>
        <DragHandle />

        <ListItemText primary={object.title} 
        secondary={object.agent.email} />

        <Button 
          variant="contained"
          color={'outlined'}
          className={classes.button}
          onClick={(e)=> {
            e.preventDefault()
            edit(object)}
          }>
          edit
        </Button>
        <Button 
          className={classes.button}
          variant="outlined"
          color={'secondary'}
          onClick={(e)=>{
          e.preventDefault()
          deleteRule(object)
        }}>
          delete
        </Button>
    </ListItem>
));

const SortableContainer = sortableContainer(({children}) => {
  return <List>{children}</List>;
});

class AssignmentRules extends React.Component {

  state = {
    isOpen: false,
    currentRule: null,
    rules: [],
    conditions: []
  }

  componentDidMount(){
    this.getAssignmentRules()

    this.props.dispatch(setCurrentPage("Assignment Rules"))
    this.props.dispatch(setCurrentSection("Conversations"))
  }

  onSortEnd = ({oldIndex, newIndex}) => {
    this.setState(({rules}) => ({
      rules: arrayMove(rules, oldIndex, newIndex),
    }), this.updatePriorities);
  };

  open  = () => this.setState({ isOpen: true });
  close = () => this.setState({ isOpen: false });

  definitions = () => {
    return [
      {
        name: "name",
        type: 'string',
        grid: { xs: 12, sm: 6 }
      },
      {
        name: "agent",
        type: 'select',
        options: ["dark", "light"],
        grid: { xs: 12, sm: 6 }
      },
    ]
  }

  updatePriorities = ()=>{
    graphql(UPDATE_RULE_PRIORITIES, {
      appKey: this.props.app.key,
      rules: this.state.rules
    }, {
      success: (data)=>{
      }
    })
  }

  submitAssignment = ()=>{
    if(this.state.currentRule){
      this.editAssignmentRule()
    }else{
      this.createAssignmentRule()
    }
  }

  getAssignmentRules = ()=>{
    graphql(ASSIGNMENT_RULES, {
      appKey: this.props.app.key,

    },{
      success: (data)=>{
        this.setState({rules: data.app.assignmentRules})
      },
      error: ()=>{
        debugger
      }
    })
  }

  createAssignmentRule = (opts)=>{
    const serializedData = serialize(this.refs.form, { hash: true, empty: true })

    graphql(CREATE_ASSIGNMENT_RULE, {
      appKey: this.props.app.key,
      title: serializedData["title"],
      agentId: serializedData["agent"],
      active:  serializedData["active"],
      conditions: this.state.conditions
    }, {
      success: (data)=>{
        const rule = data.createAssignmentRule.assignmentRule
        this.setState({
          rules: this.state.rules.concat(rule), 
          isOpen: false
        })
      },
      error: ()=>{

      }
    })
  }

  editAssignmentRule = (opts)=>{
    const serializedData = serialize(this.refs.form, { hash: true, empty: true })

    graphql(EDIT_ASSIGNMENT_RULE, {
      appKey: this.props.app.key,
      ruleId: this.state.currentRule.id,
      title: serializedData["title"],
      agentId: serializedData["agent"],
      active:  serializedData["active"],
      conditions: this.state.conditions
    }, {
      success: (data)=>{
        const rule = data.editAssignmentRule.assignmentRule
        const collection = this.state.rules.map((o)=>{
          if(o.id === rule.id){
            return rule
          } else {
            return o
          }
        })

        this.setState({
          rules: collection, 
          currentRule: null,
          isOpen: false
        })
      },
      error: ()=>{

      }
    })
  }

  deleteAssignmentRule = (opts)=>{
    graphql(DELETE_ASSIGNMENT_RULE, {
      appKey: this.props.app.key,
      ruleId: this.state.currentRule.id,
    }, {
      success: (data)=>{
        const rule = data.deleteAssignmentRule.assignmentRule
        const collection = this.state.rules.filter((o)=> o.id != rule.id)
        this.setState({rules: collection, currentRule: null})
      },
      error: ()=>{

      }
    })
  }

  edit = (rule)=>{
    this.setState({
      currentRule: rule,
      isOpen: true
    })
  }

  deleteRule = (rule)=>{
    this.setState({
      currentRule: rule
    }, this.deleteAssignmentRule )   
  }


  render(){
    const {isOpen} = this.state
    const {classes} = this.props
    const defaultConditions = [
      { 
        "type": "match", 
        "attribute": "match", 
        "comparison": "and", 
        "value": "and"
      }
    ]

    return <div className={classes.wrapper}>

              <Paper style={{
                padding: '1em',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column'
              }}>

                <Button style={{ alignSelf: 'flex-end'}} 
                  variant="contained" color="primary"
                  onClick={()=> 
                  this.setState({isOpen: true, currentRule: null })}>
                  Create Rule
                </Button>

                <Typography variant="h5">
                  Assignment Rules
                </Typography>

                <Typography component="p" >
                  incoming new conversations goes to:
                </Typography>

                <SortableContainer 
                    onSortEnd={this.onSortEnd}
                    useDragHandle>
                    {this.state.rules.map((value, index) => (
                      <SortableItem 
                        key={`item-${index}`} 
                        index={index} 
                        value={value.id}
                        object={value}
                        classes={classes}
                        edit={this.edit.bind(this)}
                        deleteRule={this.deleteRule.bind(this)} 
                      />
                    ))}
                </SortableContainer>
                
            

              </Paper>


              {isOpen && (
                <FormDialog 
                  open={isOpen}
                  //contentText={"lipsum"}
                  titleContent={"Save Assignment rule"}
                  formComponent={
                    //!loading ?
                      <form ref="form">

                       <AssignmentForm
                         rule={this.state.currentRule}
                         conditions={
                           this.state.currentRule ? 
                           this.state.currentRule.conditions : defaultConditions
                         }
                         setConditions={(conditions)=> this.setState({
                           conditions: conditions
                         })}
                         {...this.props}
                       /> 

                      </form> 
                      //: <CircularProgress/>
                  }
                  dialogButtons={
                    <React.Fragment>
                      <Button onClick={this.close} color="secondary">
                        Cancel
                      </Button>

                      <Button onClick={this.submitAssignment } 
                        color="primary">
                        {this.state.currentRule ? 'Update' : 'Create'}
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
  }
} 




function AssignmentForm(props){

  const {rule, setConditions, conditions, dispatch} = props

  const [agents, setAgents] = React.useState([])
  const [selected, setSelected] = React.useState(rule ? rule.agent.id : '')
  const [title, setTitle] = React.useState(rule ? rule.title : '')
  const [checked, setChecked] = React.useState('')
  const [updater, setUpdater] = React.useState(null)
  const [predicates, setPredicates] = React.useState(conditions || [])
  //const fields = defaultFields

  function availableFields(){
    if(!props.app.customFields)
      defaultFields
    return props.app.customFields.concat(defaultFields)
  }

  function getAgents(){
    graphql(AGENTS, {appKey: props.app.key }, {
      success: (data)=>{
        setAgents(data.app.agents)
      }, 
      error: (error)=>{

      }
    })
  }

  React.useEffect(() => {
    getAgents()
  }, [])

  React.useEffect(()=>{
    setConditions(predicates)
  }, [predicates])

  function handleChange(e){
    setSelected(e.target.value)
  }

  function displayName(o){
    return o.attribute.split("_").join(" ")
  }

  function getTextForPredicate(o){
    if(o.type === "match"){
      return `Match ${o.value === "and" ? "all" : "any" } criteria`
    }else{
      return `${displayName(o)} ${o.comparison ? o.comparison : '' } ${o.value ? o.value : ''}`
    }
  }

  function addPredicate(data){
    const pending_predicate = {
      attribute: data.name,
      comparison: null,
      type: data.type,
      value: data.value
    }
    setPredicates(predicates.concat(pending_predicate))

    // it forces a re render on itemButton for new predicates 
    setTimeout(()=>{
      setUpdater( Math.random() )
    }, 2)
  }

  function updatePredicates(data){
    setPredicates(data)
  }

  function deletePredicate(data){
    setPredicates(data)
  }

  return (

    <Grid container spacing={3}>

      <Grid item xs={12} sm={12}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap'
        }}>
          {
            predicates.map((o, i)=>{
              return <SegmentItemButton 
                      key={i}
                      index={i}
                      predicate={o}
                      predicates={predicates}
                      open={ !o.comparison }
                      updater={updater}
                      appearance={ o.comparison ? "primary" : "default"} 
                      text={getTextForPredicate(o)}
                      updatePredicate={updatePredicates}
                      predicateCallback={(jwtToken)=> { debugger } }
                      deletePredicate={(items)=>{ deletePredicate(items) }}                          
                     />
            })
          }
        </div>

        <InlineFilterDialog 
          app={props.app}
          fields={availableFields}
          addPredicate={(predicate)=>{
            addPredicate(predicate)
          }}
        />
      </Grid>

      <Grid item
        //key={field.name} 
        xs={6} 
        sm={6}>

        <FormControl>
          <TextField
            label={'title'}
            name={"title"}
            //error={errorMessage}
            //variant="outlined"
            fullWidth
            //margin="normal"
            //name={`${namespace}[${data.name}]`}
            //defaultValue={} 
            value={title}
            onChange={(e)=> setTitle(e.target.value)}
            helperText={"ssdds"}
          />
        </FormControl>

      </Grid>

      <Grid item
        //key={field.name} 
        xs={6} 
        sm={6}>


        {
          agents.length > 0 ?
        
          <FormControl>
            <InputLabel htmlFor="agent">agent</InputLabel>
            <Select
              value={selected}
              onChange={handleChange}
              inputProps={{
                name: 'agent',
                id: 'agent',
              }}
            >

              {
                agents.map((o)=>(
                  <MenuItem value={o.id}>
                    {o.email}
                  </MenuItem>
                ))
              }

            </Select>
          </FormControl> : null

        }

      </Grid>

      <Grid item
        //key={field.name} 
        xs={12} 
        sm={12}>

        <FormControlLabel 
          control={<Checkbox 
             name={"active"}
             value={checked}
             onChange={(e)=> setChecked(e.target.checked)}
          />} 
          label="Activate" 
        />

      </Grid>

    </Grid>

  )

}



function mapStateToProps(state) {

  const { auth, app, conversations, app_user } = state
  const { loading, isAuthenticated } = auth
  //const { sort, filter, collection , meta, loading} = conversations

  return {
    conversations,
    app_user,
    app,
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(withStyles(styles)(AssignmentRules)))


