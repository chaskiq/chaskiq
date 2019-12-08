import React, {Component, useState} from 'react'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withRouter, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import {ColorPicker} from '../../shared/FormFields'

function CustomizationColors({settings, update, dispatch}){
  console.log("SETTINGs", settings)
  const [state, setState] = React.useState({
    customization_colors: settings.customizationColors,
  });

  const handleChange = name => event => {
    setState({ ...state, [name]: event.target.checked });
  };

  const names = [
    "email-pattern",
    "5-dots",
    "greek-vase",
    "criss-cross",
    "chevron",
    "blue-snow",
    "let-there-be-sun",
    "triangle-mosaic",
    "dot-grid",
    "so-white",
    "cork-board",
    "hotel-wallpaper",
    "trees",
    "beanstalk",
    "fishnets-and-hearts",
    "lilypads",
    "floor-tile",
    "beige-tiles",
    "memphis-mini",
    "christmas-colour",
    "intersection",
    "doodles",
    "memphis-colorful"

   ]
 
   const pattern_base_url = "https://www.toptal.com/designers/subtlepatterns/patterns/"
 
   const patterns = names.map((o)=> {
     return {name: o, url: pattern_base_url + o + ".png"}
   })

  function handleSubmit(){
    const {
      customization_colors
    } = state

    const data = {
      app: {
        customization_colors: customization_colors
      }
    } 
    update(data)
  }

  function selectPattern(pattern){
    const color = Object.assign({}, 
      state.customization_colors, 
      {pattern: pattern.url}
    )
    setState({customization_colors: color })
  }

  return (
    <div>
      
      <Box mb={2}>
        <Typography variant={"h4"}>
          Customize chat window
        </Typography> 
      </Box>
    
      <Grid container direction={'column'}>

          <Grid item  xs={12} sm={4} >
            <ColorPicker 
              color={state.customization_colors.primary} 
              colorHandler={(hex)=> {
                const color = Object.assign({}, state.customization_colors, {primary: hex})
                setState({customization_colors: color })
              }}
              label={"Primary color"} 
            />

            <Typography variant={"overline"}>
              For color backgrounds, buttons and links
            </Typography>          
          </Grid>

          <Grid item  xs={12} sm={4} >
            <ColorPicker 
              color={state.customization_colors.secondary} 
              colorHandler={(hex)=>{
                const color = Object.assign({}, state.customization_colors, {secondary: hex})
                setState({customization_colors: color })
              }}
              label={"Secondary color"} 
            />
            <Typography variant={"overline"}>
              Secondary color
            </Typography>
          </Grid>



        <Grid container direction={'row'}>

          <Grid item  xs={12} sm={6} >

            <Typography variant={"h6"}>
              Choose a pattern From subtle patterns
            </Typography>

            {
              patterns.map((o)=>{
                return <button onClick={(e)=>selectPattern(o)}>
                          <img src={o.url} width={60} height={60}/>
                        </button>
              })
            }
          </Grid>  


          { state.customization_colors.pattern && 
            <Grid item  xs={12} sm={6} >

              <Typography variant={"h6"}>
                Selected pattern
              </Typography>

                <img src={state.customization_colors.pattern} />
              

              <br/>

              <Typography variant={"overline"}>
                From subtle patterns
              </Typography>
            </Grid> 
          }
        
        </Grid>

      </Grid>

      <Divider/>

      <Grid container>
        <Button onClick={handleSubmit}
          variant={"contained"} color={"primary"}>
          Save
        </Button>
      </Grid>

    </div>
  )
}

function mapStateToProps(state) {
  const { drawer } = state
  return {
    drawer
  }
}

export default withRouter(connect(mapStateToProps)(CustomizationColors))
