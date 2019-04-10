import React from 'react'
import styled from 'styled-components'
import posed from 'react-pose'
import { CreateTheme } from 'prey-stash'
import themeConfig from './themeConfig'
import SplitText from 'react-pose-text'

const theme = CreateTheme(themeConfig)

const IntroStyle = styled.div`
  .close {
    position: absolute;
    top: 0.5rem;
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
  img {
    width: 100%;
  }
  code {
    font-size: 1rem;
  }
  .close a {
    display: inline-block;
    padding: 1rem;
    color: #DEA007;
    font-size: 1.4rem;
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
})

const Inner2 = posed.div()

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
    this.setState({
      isMinimized: !this.state.isMinimized
    })
  }

  render(){
    return <IntroStyle initialPose="exit" pose="enter">
          <InnerStyle>
            
            <Header>

              <div className="close">
                {/* eslint-disable-next-line */}
                <a href="" onClick={this.handleMinus}>{!this.state.isMinimized ? 'minimize' : 'close'}</a>
                <small>&nbsp;▓</small>
              </div>

              <code className="title">
                <SplitText charPoses={charPoses}>&gt;_ Help us build a better product for you!</SplitText>
              </code>

            </Header>

            <Content>
              {
                !this.state.isMinimized ? (
                  <Inner2>
                    {this.props.children}
                  </Inner2>
                ) : null
              }
            </Content>

          </InnerStyle>

        </IntroStyle>
  }

}