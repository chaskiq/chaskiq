import React from 'react'
import MaterialTable, {
  MTableToolbar
} from 'material-table'

import {
  Paper,
  Grid,
  IconButton,
  Typography,
  Button,
  Menu,
  MenuItem,
  Checkbox
} from '@material-ui/core'

import {
  ChevronLeft, 
  ChevronRight, 
  FirstPage, 
  LastPage,
  ViewColumn
} from '@material-ui/icons'

import MapIcon from '@material-ui/icons/Map';


export default class Table extends React.Component {

  constructor (props){
    super(props)
 
    this.state = {
      columns: this.props.columns
    }
  }

  dataFromProps = ()=>{

  }

  changeColumns=(columns)=>{
    this.setState({columns: columns})
  }

  render() {
    
    return (
      <MaterialTable
        title={this.props.title}
        columns={this.state.columns}
        data={this.props.data}
        components={{
          Container: props => <Paper {...props}  elevation={this.props.elevation || 0} />
          ,
          Pagination: props => {
            return <Grid container 
                      alignItems={'center'} 
                      justify={'flex-end'}>

                    <Grid item>
                      <IconButton disabled={!this.props.meta.prev_page}
                        onClick={()=>this.props.search(this.props.meta.prev_page)}>
                        <ChevronLeft/>
                      </IconButton>
                    </Grid>

                    <Grid item>
                      <Typography variant={'caption'}>
                        {this.props.meta.current_page} of {this.props.meta.total_pages} pages
                        ({this.props.meta.total_count} records)
                      </Typography>
                    </Grid>

                    <Grid item>
                      <IconButton disabled={!this.props.meta.next_page}
                        onClick={()=> this.props.search(this.props.meta.next_page)}>
                        <ChevronRight/>
                      </IconButton>
                    </Grid> 
              
                  </Grid>
          },

          Toolbar: props => {
            return <Grid container 
                alignItems={"center"} 
                justify={"space-between"}>


              <Grid item>
              
              <Typography variant={"h5"}>
                {this.props.title}
              </Typography>

              </Grid>

              <Grid item>
                <Grid container justify={"space-around"}>

                  <SimpleMenu 
                    handleChange={this.changeColumns}
                    options={
                      this.state.columns
                    }
                  />
                  
                  {
                    this.props.enableMapView ?
                      <IconButton onClick={this.props.toggleMapView}>
                        <MapIcon/>
                      </IconButton> : null 
                  }

                </Grid>
              </Grid>
            </Grid>
          },

        }}
        
      />
    )
  }
}


function SimpleMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  //const [options, setOptions] = React.useState(props.options);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleChange(o){
    const item =  Object.assign({}, o, {hidden: !o.hidden})
    const columns = props.options.map((o)=>{
      return o.title === item.title ? item : o
    })
    //setOptions(columns)
    //console.log(item)
    props.handleChange(columns)
    //setOptions()
  }

  //React.useEffect(() => console.log('value changed!'), [props.options]);

  //console.log(props.options)
  return (
    <div>
      <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
        <ViewColumn/>
      </IconButton>


      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {
          props.options.map((o)=> <MenuItem 
            onClick={()=>handleChange(o)}
            >
            <Checkbox
            defaultChecked={!o.hidden}
            //onChange={handleChange(o)}
            //value={!o.hidden}
            inputProps={{
              'aria-label': 'primary checkbox',
              }}
            />
            {o.title}

          </MenuItem> )
        }

      </Menu>
       
    </div>
  );
}