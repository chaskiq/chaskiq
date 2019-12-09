import React, {Component, useState} from 'react'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Link from '@material-ui/core/Link'
import { withRouter, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import {ColorPicker} from '../../shared/FormFields'
import styled from '@emotion/styled'


const PatternButton = styled.button`
  padding: 0px;
  margin: 3px;
  display: inline-block;
  width: 60px;
  height: 60px;
`

const Image = styled.div`
  width: 60px;
  height: 60px;

  ${(props)=>{
    return props.image ? 
    `background-image: url(${props.image});` : ''
  }}

  background-size: 310px 310px,cover;
`

function CustomizationColors({settings, update, dispatch}){
  const [state, setState] = React.useState({
    customization_colors: settings.customizationColors || {},
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
      {pattern: pattern ? pattern.url : null }
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

        <Grid container direction={'row'}>
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
        </Grid>

        <Grid container direction={'row'}>

          <Grid item  xs={12} sm={6} >

            <Typography variant={"h6"}>
              Choose a pattern From 
              <Link target={"blank"} href={"https://www.toptal.com/designers/subtlepatterns/"}>
              Subtle patterns
              </Link>
            </Typography>

            <PatternButton onClick={(e)=>selectPattern(null)}>
              <Image />
            </PatternButton>

            {
              patterns.map((o)=>{
                return <PatternButton onClick={(e)=>selectPattern(o)}>
                          <Image image={o.url} />
                        </PatternButton>
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
