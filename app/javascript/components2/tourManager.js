import React, {Component} from 'react'
import styled from 'styled-components'
import Joyride from 'react-joyride';
import Simmer from 'simmerjs'

const simmer = new Simmer(window, { /* some custom configuration */ })
// poner esto como StyledFrame
const IntersectionFrame = styled.div`
    background: rgba(0, 0, 0, 0.35);
    z-index: 3000000000;
    height: 100%;
    width: 100%;
    box-shadow: 0px 0px 14px rgba(0,0,0,0.2);
    position: fixed;
    bottom: 0;
    left: 0;

`

const TourManagerContainer = styled.div`
  position: fixed;
  bottom: 0px;
  left: 0px;
  width: 100%
`

const Body = styled.div`
  padding: 30px;
  background: white;
  box-shadow: 1px -1px 6px 0px #ccc;
  display: flex;
`

const Footer = styled.div`
  background: blue;
  padding: 10px;
  a, a:hover{
    color: white;
  }
`

const StepContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    flex: 0 0 auto;
    min-width: 0;
    min-height: 0;

`

const ConnectorStep = styled.div`

  width: 60px;
  heigth: 60px;
  border: 1px solid #ccc;

`

const StepBody = styled.div`

    background: #fff;
    max-height: 148px;
    box-shadow: 0 2px 8px 0 rgba(0,0,0,.05);
    border: 1px solid rgba(0,0,0,.1);
    border-radius: 5px;
    overflow: hidden;
    max-width: 140px;
`

const StepHeader = styled.div`
  padding: 16px 24px;
`

const StepMessage = styled.div`

`


const isElement = (x) => x && x.nodeType === Node.ELEMENT_NODE;

const nthChild = (el, nth = 1) => {
  if (el) {
    return nthChild(el.previousSibling, nth + 1);
  } else {
    return nth - 1;
  }
};

const elementPath = (el, path = []) => {
  if (isElement(el)) {
    const tag = el.nodeName.toLowerCase(),
      id = (el.id.length != 0 && el.id);
    if (id) {
      return elementPath(
        null, path.concat([`#${id}`]));
    } else {
      return elementPath(
        el.parentNode,
        path.concat([`${tag}:nth-child(${nthChild(el)})`]));
    }
  } else {
    return path.reverse().join(" > ");
  }
};

export default class TourManager extends Component {

  state = {
    cssPath: null,
    cssIs: null,
    run: false,
    selecting: false,
    steps: []
  }

  componentDidMount(){
    document.addEventListener('mouseover',  (e)=> {
      if (this.state.run) return
      if (!this.state.selecting) return

      e = e || window.event;
      var target = e.target || e.srcElement,
        text = target.textContent || target.innerText;

      this.setState({
        cssPath: simmer(target)
      })
    }, false);

    document.addEventListener('click', (e) => {

      if(this.state.run) return
      if (!this.state.selecting) return

      e = e || window.event;
      var target = e.target || e.srcElement,
        text = target.textContent || target.innerText;

      let path = {
        target: simmer(target),
          content: 'This is my awesome feature!',
      }

      this.setState({
        steps: this.state.steps.concat(path)
      })
    }, false);
  }

  

  activatePreview = ()=>{
    this.setState({
      run: true
    })
  }

  disablePreview = () => {
    this.setState({
      run: false
    })
  }

  disableSelection = ()=>{
    this.setState({
      selecting: false
    })
  }

  enableSelection = () => {
    this.setState({
      selecting: true
    })
  }

  render(){

    return <div>

      <Joyride
        steps={this.state.steps}
        run={this.state.run}
        debug={true}
        continuous
        scrollToFirstStep
        showProgress
        showSkipButton
        styles={{
          options: {
            zIndex: 10000,
          }
        }}

      />
    
      <TourManagerContainer
        onMouseOver={this.disableSelection}
        onMouseOut={this.enableSelection}>

        <Body>

          <p>{this.state.run ? 'run si |' : 'run no |'}</p>
          <br />
          <p>{this.state.selecting ? 'selected' : 'no selected'}</p>

          {
            this.state.steps.map((o) => {
              return <TourStep step={o}></TourStep>
            }
            )}

          <NewTourStep></NewTourStep>

        </Body>

        <Footer>

          <a href="#" onClick={this.activatePreview}>preview</a>
          <a href="#" onClick={this.disablePreview}>cancel</a>
          <a href="#">save</a>


        </Footer>


      </TourManagerContainer>


    </div>
  }
}

class TourStep extends Component {

  render(){
    return <StepContainer>
           <StepBody>
              <StepHeader>
                {this.props.step.content}
              </StepHeader>

              <StepMessage>
              <p>{this.props.step.target}</p>
              </StepMessage>
           </StepBody>
           <ConnectorStep/>
          </StepContainer>
  }
}

const NewStepContainer = styled.div`
    background-color: #ebebeb;
    border-radius: 4px;
    min-width: 205px;
    height: 150px;

`

const NewStepBody = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

`

class NewTourStep extends Component {
  render(){
    return <NewStepContainer>
      <NewStepBody/>
      </NewStepContainer>
  }
}