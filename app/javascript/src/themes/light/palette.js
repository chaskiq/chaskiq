import logo from '../../images/logo-dark.png'
import { lighten, darken } from "polished";

const palette = {
  background: {
    default: "#f7f7f7",
    paper: "#fefefe",
  },
  sidebar: {
    background: "#131313",
    color: "#fefefe",
    borders: "none",
    activeBackground: lighten(0.06, "#131313"),
    hoverBackground: lighten(0.3, "#131313")
  },
  common: {
    black: "#161616",
    white: "#fff",
    gray: '#6a6a6a',
    green: 'green',
    offline: '#ccc'
  },
  primary: {
    light: '#6a6a6a',
    //main: '#009be5',
    //main: '#444',
    //main: '#dc18c1',
    //contrastText: "#000",
    contrastText: "#fff",
    main: '#3aa3f2', //'#7b16ff', //'#0000ff', // '#24862c',
    white: '#fff',
    dark: '#161616', //'#15501a', //'#006db3',
    borders: "#ece9e9",
    logo: logo

  },
  secondary:{
    main: "#444"
  },
 error: {
  light: "#e57373",
  main: "#f44336",
  dark: "#d32f2f",
  contrastText: "#fff",
 }


}

export default palette