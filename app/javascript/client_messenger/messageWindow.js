import React from 'react'
import styled from '@emotion/styled'
//import posed from 'react-pose'
//import { CreateTheme } from 'prey-stash'
//import SplitText from 'react-pose-text'
//import Container from './styles/dante'


//const theme = CreateTheme(themeConfig)

let theme = {
  desaturation: 0,
  lightness: 0,
  hue: 0,
  bg: '#F7F7F7',
  linkColor: '#2D77B6',
  fontColor: '#1F2937',
  accentColor: '#234457'
}

const IntroStyle = styled.div`
  .close {
    /*position: absolute;
    top: 0.5rem;
    right: 0.5rem;*/

    position: absolute;
    top: -3px;
    right: 0.5rem;

  }
`

const InnerStyle = styled.div`
  ${(props)=>{
    return props.theme.mode === "dark" ?
    `background: rgba(0, 0, 0, 0.80);
     color: rgba(200, 200, 200, 0.80);` : ''
  }}
  position: relative;
  overflow: hidden;
  overflow-y: auto;
  
  img {
    width: 100%;
  }
  code {
    font-size: 1rem;
  }
  .close a {
    display: inline-block;
    padding: 0.5rem;
    color: #DEA007;
    font-size: 0.8rem;
    text-transform: uppercase;
    font-family: sans-serif;
  }
  small {
    display: inline-block;
    padding: 0;
    cursor: grab;
  }
  blockquote {
    opacity: 0.80;
    border-left: 2px solid ${theme.bg};
    code {
      line-height: 1.1;
      color: ${theme.bg}
    }
  }
  .btn {
    color: ${theme.bg};
    &:hover {
      box-shadow: none;
      color: ${theme.bg};
    }
  }
`

const Header = styled.div`

  ${(props) => {
    return props.theme.mode === "dark" ?
      `` : `
        background: rgba(253, 253, 253, 0.9);
        box-shadow: 0px 0px 3px 0px #eaeaea;
      `
  }}

    position: -webkit-sticky;
    position: fixed;
    top: 9px;
    z-index: 1;
    width: 96vw;
`

const Content = styled.div`
  /*height: 300px;*/
  padding: 1rem;
`

export default class Quest extends React.Component  {
  
  constructor(props) {
    super(props)
    this.state = {
      isMinimized: false
    }
  }

  render(){
    return <IntroStyle>
            <InnerStyle>
              
              <Header>

              </Header>

              <Content>
                {this.props.children}
              </Content>

            </InnerStyle>
          </IntroStyle>
  }

}