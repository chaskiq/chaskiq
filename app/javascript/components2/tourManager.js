import React, {Component} from 'react'
import styled from 'styled-components'
import Simmer from 'simmerjs'
import TourEditor from './tourEditor'
import Button, { ButtonGroup } from '@atlaskit/button';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import StyledFrame from 'react-styled-frame'


const simmer = new Simmer(window, { 
  depth: 20
 })
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

const TourManagerContainer = styled(({ collapsedEditor, ...rest }) => (
  <StyledFrame {...rest} initialContent={`<!DOCTYPE html>
  <html><head></head>
  <body style="margin:0px"><div class="frame-root">
  </div></body></html>`} />
))`
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 300000;
    margin: 0px;
    height: ${(props)=> {
      return props.collapsedEditor ? `38px` : `267px` } 
    };
    box-shadow: 1px -1px 6px 0px #ccc;
`

const TourManagerContainerDiv = styled.div`
  position: fixed;
  bottom: 0px;
  left: 0px;
  width: 100%
  z-index: 300000;
`

const Body = styled.div`
  padding: 30px;
  background: white;
  
  display: flex;


  align-items: center;
  justify-content: center;
`

const Footer = styled.div`
  background: blue;
  padding: 10px;
  display: flex;
  flex-flow: column;
  a, a:hover{
    color: white;
  }
`

const FooterRight = styled.div`
  align-self: flex-end;
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

const CssPathIndicator = styled.div`
  color: white;
  align-self: flex-start;
`

const EventBlocker = styled.div`
    position: fixed;
    height: 100%;
    width: 100%;
    top: 0px;
    left: 0px;
    opacity: 0;
    box-sizing: border-box;
    pointer-events: none;
    z-index: 10000;
`

const StepsContainer = styled.div`
  width: 50%;
  overflow:scroll;
  display: flex;
`



export default class TourManager extends Component {

  state = {
    cssPath: null,
    cssIs: null,
    run: false,
    selecting: false,
    selectedCoords: null,
    selectionMode: false,
    editElement: null,
    isScrolling: false,
    steps: []
  }

  sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
  }

  componentDidMount(){
    document.addEventListener('mouseover',  (e)=> {
      if (this.state.run) return
      if (!this.state.selectionMode) return
      if (!this.state.selecting) return

      if (this.state.selectionMode === "edit") return


      e = e || window.event;
      var target = e.target || e.srcElement,
        text = target.textContent || target.innerText;

      //console.log(target)
      this.getElementShape(target)
      this.setState({
        cssPath: simmer(target)
      })
    }, false);

    document.addEventListener('click', (e) => {
      if (!this.state.selecting) return
      e.stopPropagation()
      e.preventDefault()
    }, false)

    document.addEventListener('mousedown', (e) => {

      if(this.state.run) return
      if (!this.state.selecting) return

      if (this.state.selectionMode === "edit") return

      //debugger
      
      e.stopPropagation()
      e.preventDefault()

      //this.sleep(1000)

      e = e || window.event;
      var target = e.target || e.srcElement,
        text = target.textContent || target.innerText;

      const cssPath = simmer(target)

      let path = {
        target: cssPath,
        content: 'default text',
        serializedContent: null,
      }

      if(this.state.steps.find((o)=> o.target === path.target )) {
        console.log("no entró!!")
        return
      }

      setTimeout(() => {
        this.setState({
          steps: this.state.steps.concat(path),
          cssPath: cssPath,
          selecting: false,
          selectionMode: false,
        })        
      }, 200);


    }, false);

    let scrollHandler = ()=>{
      if(!this.state.cssPath) return
      const target = document.querySelector(this.state.cssPath)
      this.getElementShape(target)
    }

    //document.addEventListener('scroll', isScrolling.bind(this));
    window.addEventListener('resize', scrollHandler.bind(this));
    document.addEventListener('scroll', scrollHandler.bind(this));

  }

  activatePreview = ()=>{
    this.setState({
      run: true,
      selectionMode: false,
      editElement: null,
      selecting: false
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

  getElementShape = (obj)=>{
    const coords = obj.getBoundingClientRect()
    //console.log(coords)
    this.setState({
      selectedCoords: {
        x: coords.x, 
        y: coords.y, 
        width: coords.width, 
        height: coords.height, 
        //width: coords.right - coords.left,
        //height: coords.bottom - coords.top,
      } 
    })
  }

  removeItem = (item)=>{
    console.log(this.state.steps.map((o)=>(o.path)).join(" "))
    this.setState({
      steps: this.state.steps.filter((o)=>( o.target != item.target ))
    })
  }

  enableSelectionMode = ()=>{
    this.setState({
      selectionMode: true,
    }, ()=> setTimeout(() => this.setState({selecting: true}), 500 ))
  }

  saveContent = (value, target)=>{
    this.state.steps.map((o)=>{
      if(o.target === target){
        o.serializedContent = value;
        return o
      } else {
        return o
      }

    })
  }

  enableEditMode = (editElement)=>{
    let newEl = {
      target: editElement.target,
      content: <TourEditor 
                saveContent={this.saveContent} 
                serializedContent={editElement.serializedContent}
                target={editElement.target}>
                </TourEditor>, 
      serializedContent: null
    }
    this.setState({
      selectionMode: 'edit',
      editElement: newEl,
      cssPath: editElement.target,
      styles: {
        options: {
          zIndex: 10000
        }
      },
    }, () => setTimeout(() => this.setState({ selecting: true }), 500))
  }

  disableEditMode = ()=>{
    this.setState({
      selecting: false,
      selectionMode: false,
    })
  }

  updateChanges = ()=>{
    this.setState({
      selecting: false,
      selectionMode: false,
    }, ()=>{
      const newStep  = this.state.steps.map((o)=>{
        if( o.target === this.state.editElement.target){
          this.state.editElement
          return o
        } else {
          return o
        }
         
      })
        this.setState({ steps: newStep  })
    })
  }

  prepareJoyRidyContent = ()=>{
    return this.state.steps.map((o)=>{

      o.content = <TourEditor 
                    serializedContent={o.serializedContent} 
                    readOnly={true}>
                  </TourEditor>
    
      return o

    })
  }

  /*a = document.querySelector().getBoundingClientRect()
  window.scrollTo(a.x, a.y)
  */

  handleJoyrideCallback = data => {
    const { action, index, status, type } = data;

    console.log(data)

    const centerDiv = (element)=>{
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const middle = absoluteElementTop - (window.innerHeight / 2);
      window.scrollTo(0, middle);
    }

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      
      if (action === ACTIONS.NEXT || action === ACTIONS.PREV)  {

        let t = null

        if (action === ACTIONS.NEXT){
          t = this.state.steps[index + 1]

        } else if (action === ACTIONS.PREV) {
          t = this.state.steps[index - 1]
        }

        if(!t) return
        const a = document.querySelector(t.target)
        centerDiv(a)
      }

      

      // Update state to advance the tour
      //this.setState({ stepIndex: index + (action === ACTIONS.PREV ? -1 : 1) });
    }
    else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Need to set our running state to false, so we can restart if we click start again.
      this.setState({ run: false });
    }

    console.groupCollapsed(type);
    console.log(data); //eslint-disable-line no-console
    console.groupEnd();
  };

  render(){

    return <div style={{ position: 'absolute', zIndex: '100000000'}}>


      {
        this.state.selectionMode !== "edit" ?
      
          <Joyride
            steps={this.prepareJoyRidyContent(this.state.steps)}
            run={this.state.run}
            debug={true}
            continuous
            scrollToFirstStep
            showProgress
            showSkipButton
            callback={this.handleJoyrideCallback}
            styles={{
              options: {
                zIndex: 10000,
              }
            }}
          /> : null 
        
        }


      {
        this.state.editElement && this.state.selectionMode == "edit" ? 
          <Joyride
            steps={[this.state.editElement]}
            run={this.state.selectionMode === "edit"}
            debug={true}
            continuous={false}
            scrollToFirstStep
            showProgress={false}
            showSkipButton={false}
            spotlightClicks
            disableOverlayClose
            styles={{
              options: {
                zIndex: 10000,
              }
            }}
          />
          : null
      }


      {/*this.state.selecting ? <EventBlocker tabindex="-1" /> : null */ }


      {
        this.state.selectedCoords && !this.state.run ?
      
          <div style={{ 
            border: '2px solid green',
            position: 'fixed',
            zIndex: 999,
            pointerEvents: 'none',
            boxShadow: this.state.selectionMode !== "edit" ? '0px 0px 0px 4000px rgba(0, 0, 0, 0.15)' : 'none',
            top: this.state.selectedCoords.y,
            left: this.state.selectedCoords.x,
            width: this.state.selectedCoords.width,
            height: this.state.selectedCoords.height
            }} /> : null 
      }
    
      <TourManagerContainer
        onMouseOver={this.disableSelection}
        onMouseOut={this.enableSelection}
        collapsedEditor={ this.state.selectionMode || this.state.run ? true : undefined }
      >

        <div>

          {
            !this.state.selectionMode && !this.state.run ?
          
              <Body>

                <StepsContainer>
                {
                  this.state.steps.map((o) => {
                    return <TourStep step={o}
                                    key={o.target}
                                    removeItem={this.removeItem}
                                    enableEditMode={this.enableEditMode}>
                          </TourStep>
                  }
                )}
                

                <NewTourStep 
                  enableSelection={this.enableSelectionMode}>
                </NewTourStep>

                </StepsContainer>

              </Body> : null
          }

          <Footer>



            {
              !this.state.selectionMode ? 

              <FooterRight>
              
                    {
                      this.state.run ?
                        <Button onClick={this.disablePreview}>
                          {'<- exit preview'}
                        </Button>
                        : 
                      <ButtonGroup appearance="warning">

                        <Button onClick={this.activatePreview}>preview</Button>

                        <Button >cancel</Button>
                        <Button >save tour</Button>
                      </ButtonGroup>
                    }
                  
              </FooterRight> : 
              
              <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                
                <CssPathIndicator>
                  {this.state.cssPath}
          
                  {this.state.run ? 'run si |' : 'run no |'}
                  
                  {this.state.selecting ? 'selected' : 'no selected'}
                
                </CssPathIndicator>  

                {
                  this.state.selectionMode === "edit" ? 
                  <FooterRight>
                    <ButtonGroup appearance="warning">
                      <Button onClick={this.disableEditMode}>cancel</Button>
                      <Button onClick={this.updateChanges}>save step</Button>
                    </ButtonGroup>
                  </FooterRight> : null
                }
                  
              </div>
            }



          </Footer>

        </div>

      </TourManagerContainer>


    </div>
  }
}

class TourStep extends Component {

  removeItem = (e)=>{
    e.preventDefault()
    this.props.removeItem(this.props.step)
  }

  enableEditMode = (e)=>{
    e.preventDefault()
    this.props.enableEditMode(this.props.step)
  }

  render(){
    return <StepContainer onClick={this.enableEditMode}>
           <StepBody>

              <a href="" onClick={this.removeItem}>x</a>
              <StepHeader>
                
              </StepHeader>

              <StepMessage>
                <TourEditor
                  serializedContent={this.props.step.serializedContent}
                  readOnly={true}
                />
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
  enableSelection = (e)=>{
    e.preventDefault()
    this.props.enableSelection()
  }
  render(){
    return <NewStepContainer>
      <NewStepBody>
        <a href="#" onClick={this.enableSelection}>new +</a>
      </NewStepBody>
      </NewStepContainer>
  }
}