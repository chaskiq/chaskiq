

import indigo from '@material-ui/core/colors/indigo';
import pink from '@material-ui/core/colors/pink';
import red from '@material-ui/core/colors/red';


import purple from '@material-ui/core/colors/purple';
import logo from '../../images/favicon.png'
import { lighten, darken, opacify } from "polished";

const palette = {
  type: "dark",
  background: {
    default: "#1B1F23",
    paper: "#24292e"
  },
  color: {
    default: "#ff0000"
  },
  sidebar: {
    background: "#1B1F23",
    color: "#f3f3f3",
    border: "1px solid rgba(0, 0, 0, 0.12)",
    activeBackground: darken(0.2, "#131313"),
    darkColor: opacify(0.1, darken(0.06, "#131313") ),

  },
  common: {
    black: "#000",
    white: "#fff",
    gray: '#ccc'
  },

  primary: {

    light: "#fff",
    main: purple[500],
    dark: '#202229',
    contrastText: "#fff",
    borders: "#2F363D",
    logo: logo,
    
    /*contrastText: "#000",
    dark: "#121212",
    light: "#7986cb",
    main: "#3f51b5",*/
  },

  secondary: {
    contrastText: "#fff",
    dark: "#c51162", 
    light: "#ff4081",
    main: "#f50057",
  },

  error: {
    //light: "#e57373",
    main: "#f44336",
    //dark: "#d32f2f",
    contrastText: "#fff",
  }
}

export default palette