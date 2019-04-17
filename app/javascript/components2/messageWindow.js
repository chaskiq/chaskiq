import React from 'react'
import styled from 'styled-components'
//import posed from 'react-pose'
//import { CreateTheme } from 'prey-stash'
import themeConfig from './themeConfig'
//import SplitText from 'react-pose-text'
import Container from './styles'


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

  .aspectRatioPlaceholder {
    margin: 0 auto;
    position: relative;
    width: 100%;
  }

  .aspectRatioPlaceholder.is-locked .graf-image, .aspectRatioPlaceholder.is-locked .graf-imageAnchor {
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;
  }

  .graf-image, .graf-imageAnchor, .iframeContainer > iframe, .iframeContainer {
      box-sizing: border-box;
      display: block;
      margin: auto;
      max-width: 100%;
  }

  .imageCaption {
      text-align: center;
      margin-top: 0;
      letter-spacing: 0;
      font-weight: 400;
      font-size: 13px;
      line-height: 1.4;
      outline: 0;
      z-index: 300;
      margin-top: 10px;
      position: relative;
  }

`

const InnerStyle = styled.div`
  background: rgba(0,0,0,0.80);
  color: rgba(200,200,200,0.80);
  position: relative;
  overflow: hidden;
  overflow-y: auto;
  height: 100vh;
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
  position: sticky;
  top: 0px
  padding: 1rem;
  background: rgba(0,0,0,0.60);
  z-index: 1;
`

const Content = styled.div`
  height: 300px;
  padding: 1rem;
`

/*
const Intro = posed(IntroStyle)({

})

const Inner = posed(InnerStyle)({
  draggable: true,
  exit: {
    x: '-100%'
  },
  enter: {
    x: '0%',
    beforeChildren: true,
    staggerChildren: 50
  }
})*/

//const Inner2 = posed.div()

const charPoses = {
  exit: { opacity: 0 },
  enter: { opacity: 1 }
}

export default class Quest extends React.Component  {
  
  constructor(props) {
    super(props)
    this.state = {
      isMinimized: false
    }
  }

  handleMinus = (ev) => {
    ev.preventDefault()
    this.props.toggleMinimize(ev)
  }

  handleClose = (ev)=>{
    ev.preventDefault()
    this.props.handleClose(ev)
  }

  render(){
    return <IntroStyle initialPose="exit" pose="enter">
          <InnerStyle>
            
            <Header>

              <div className="close">
                {/* eslint-disable-next-line */}
                <a href="" onClick={this.handleMinus}>
                  {!this.props.isMinimized ? 'minimize' : 'expand'}
                </a>
                {
                  this.props.isMinimized ? 
                  <a href="" onClick={this.handleClose}>
                    dismiss
                  </a> : null
                }
              </div>

              <code className="title">
                <p style={{margin: '7px 2px 0px 0px'}}>
                  &gt;_ Help us build a better product for you!
                </p>
              </code>

            </Header>


            <Content>
            
              {
                !this.state.isMinimized ? (
                  
                <Container>
                    {this.props.children}
                </Container>
                 
                ) : null
              }
            </Content>

          </InnerStyle>

        </IntroStyle>
  }

}