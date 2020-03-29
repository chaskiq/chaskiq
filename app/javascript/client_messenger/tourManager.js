import React, {Component} from 'react'
import styled from '@emotion/styled'
import Simmer from 'simmerjs'
import TextEditor from './textEditor/index'
import StyledFrame from './styledFrame'
import DraftRenderer from './textEditor/draftRenderer'
import DanteContainer from './textEditor/editorStyles'
import theme from './textEditor/theme'
import { ThemeProvider } from 'emotion-theming'
import Tour from 'reactour-emotion'

import EditorStylesExtend from 'Dante2/package/es/styled/base'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import GlobalStyle from './tour/globalStyle'
//import TourHelper from './tour/tourHelper'

const EditorStylesForTour = styled(EditorStylesExtend)`
.postContent{
  font-size: 12px;
  overflow: scroll;
  max-height: 200px;
}
`

const simmer = new Simmer(window, { 
  depth: 20
 })

const TourManagerContainer = styled.div`
  box-shadow: 1px -1px 6px 0px #313030b0;
`
const Body = styled.div`
  padding: 10px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
`
const Footer = styled.div`
  background: black;
  padding: 13px;
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
    max-height: 88px;
    box-shadow: 0 2px 8px 0 rgba(0,0,0,.05);
    border: 1px solid rgba(0,0,0,.1);
    border-radius: 5px;
    overflow: hidden;
    max-width: 140px;
    padding: 1em;
    transition: 0.3s;
    &:hover{
      background: #f5f2f2
    }
`
const StepHeader = styled.div`
  padding: 16px 24px;
`
const StepMessage = styled.div``

const CssPathIndicator = styled.div`
  color: white;
`
const EventBlocker = styled.div`
    position: fixed;
    height: 100%;
    width: 100%;
    top: 0px;
    left: 0px;
    opacity: 0.2;
    background: red;
    box-sizing: border-box;
    pointer-events: none;
    z-index: 100000000000;
`
const StepsContainer = styled.div`
  width: 100%;
  overflow:scroll;
  display: flex;
`
const Link = styled.a`
color: #000;
`
const DeleteButton = styled(Link)`
  float: right;
  display: block;
  width: 20px;
  height: 20px;
  color: #bdbdbd;
  background: #f3f3f37d;
  border-radius: 50%;
  text-indent: 6px;
  text-decoration: none;
  border: 1px solid #c1b8b8;
  box-shadow: 0px 1px 1px #ccc;
`
const Button = styled.button`
  text-align: center;
  display: inline-block;
  position: relative;
  -webkit-text-decoration: none;
  text-decoration: none;
  color: #040404;
  text-transform: capitalize;
  font-size: 12px;
  padding: 7px 11px;
  /* width: 150px; */
  border-radius: 4px;
  overflow: hidden;
  margin-left: 10px;
  background: aqua;
  border: none;
  cursor: pointer;
  &:hover{

  }
`

const TourFooter = styled.div`
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #ccc;
  padding: 12px 0px 1px 0px;
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
      if(this.state.run) return
      if (!this.state.selectionMode) return
      if (!this.state.selecting) return
      if (this.state.selectionMode === "edit") return
      //debugger
      
      e.stopPropagation()
      e.preventDefault()
      e.stopImmediatePropagation()

    }, false)

    document.addEventListener('mousedown', (e) => {
      if(this.state.run) return
      if (!this.state.selectionMode) return
      if (!this.state.selecting) return
      if (this.state.selectionMode === "edit") return
      //debugger
      
      e.stopPropagation()
      e.preventDefault()
      e.stopImmediatePropagation()

      //this.sleep(1000)

      e = e || window.event;
      var target = e.target || e.srcElement,
        text = target.textContent || target.innerText;

      const cssPath = simmer(target)

      let path = {
        target: cssPath,
        content: 'default text',
        serialized_content: null,
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
        },  ()=>{
          this.enableEditMode(path)
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

    window.addEventListener('message', (e)=> {
      if(e.data.type === "steps_receive"){
        console.log("EVENTO TOUR!", e)
        this.setState({
          steps: e.data.tourManagerEnabled, 
          ev: e
        })
      }

      if(e.data.type === "GET_TOUR"){
        console.log("GET_STEPS")
        this.setState({steps: e.data.data.steps})
      }

    } , false);

    this.getSteps()
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
    this.setState({
      steps: this.state.steps.filter((o)=>( o.target != item.target )),
      selectionMode: false,
      editElement: null
    }, ()=>{
      this.disableSelection()
    })
  }

  enableSelectionMode = ()=>{
    this.setState({
      selectionMode: true,
    }, ()=> setTimeout(() => this.enableSelection(), 500 ))
  }

  saveContent = (value, element)=>{
    const newSteps = this.state.steps.map((o)=>{
      if(o.target === element.target){
        o.serialized_content = value.serialized;
        o.html = value.html
        return o
      } else {
        return o
      }
    })

    this.setState({
      steps: newSteps
    })
  }

  handleDirectUpload = (file, imageBlock, input)=>{
    let a = window.addEventListener('message', (e)=> {
      if(e.data.type === "UPLOAD_COMPLETED"){
        imageBlock.uploadCompleted(e.data.data.serviceUrl)
        a = null
      }
    } , false);

    this.props.ev.source.postMessage(
      {
        type: "UPLOAD_IMAGE",
        file: file,
        //imageBlock: imageBlock,
        input: input
    }, this.props.ev.origin)
  }

  handleUrlUpload = (file, imageBlock, input)=>{
    let a = window.addEventListener('message', (e)=> {
      if(e.data.type === "URL_UPLOAD_COMPLETED"){
        imageBlock.uploadCompleted(e.data.data.serviceUrl)
        a = null
      }
    } , false);

    this.props.ev.source.postMessage(
      {
        type: "URL_UPLOAD",
        file: file,
        //imageBlock: imageBlock,
        input: input
    }, this.props.ev.origin)

  }

  enableEditMode = (editElement)=>{

    let newEl = {
      target: editElement.target,
      selector: editElement.target,
      disableBeacon: true,
      content: <EditorStylesForTour campaign={true}>
                  <TextEditor
                    data={{}}
                    domain={this.props.domain}
                    handleUrlUpload={this.handleUrlUpload}
                    handleDirectUpload={this.handleDirectUpload}
                    styles={
                      {
                        lineHeight: '2em',
                        fontSize: '0.9em',
                        marginLeft: '31px'
                      }
                    }
                    saveHandler={this.saveContent} 
                    updateState={({status, statusButton, content})=> {
                      this.saveContent(content, editElement )
                    }
                      //console.log("update here!", uno, dos, tres)
                    }
                    serializedContent={editElement.serialized_content}
                    target={editElement.target}
                    loading={false}>
                  </TextEditor>

                  <TourFooter>
                    <Button onClick={this.handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={this.handleSaveTour}>
                      save!
                    </Button>
                  </TourFooter>

                  {/*
                    <select name={"next_trigger"}>
                      <option value="click">on Click</option>
                      <option value="hover">on Hover</option>
                      <option value="fill">fill</option>
                    </select>
                    <button>save</button>
                  */}

                </EditorStylesForTour>,
      save: this.handleSaveTour,
      close: this.handleCancel,
      serialized_content: editElement.serialized_content
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
    }, () => setTimeout(() => {
      //this.enableSelection()
    }, 500))
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
      const newSteps = this.state.steps.map((o)=>{
        if( o.target === this.state.editElement.target){
          //this.state.editElement
          return o
        } else {
          return o
        }
         
      })
        this.setState({ steps: newSteps })
    })
  }

  prepareJoyRidyContent = ()=>{
    return this.state.steps && this.state.steps.map((o, index)=>{
      o.disableBeacon = index === 0
      o.selector = o.target
      o.content = <EditorStylesForTour campaign={true}>
                    <DraftRenderer
                      domain={this.props.domain}
                      raw={JSON.parse(o.serialized_content)}
                    />
                  </EditorStylesForTour>
      return o
    })
  }

  handleSaveTour = ()=>{
    this.props.ev.source.postMessage(
      {
        type: "SAVE_TOUR",
        steps: this.state.steps.map( (o)=> { 
            return { 
              target: o.target, 
              serialized_content: o.serialized_content
            }
        })
    }, this.props.ev.origin)

    this.setState({
      selecting: false,
      selectionMode: false,
    })
  }

  handleCancel = ()=>{
    this.setState({
      selecting: false,
      selectionMode: false,
    })
  }

  getSteps = ()=>{
    this.props.ev.source.postMessage(
      {type: "GET_TOUR"}, 
      this.props.ev.origin)
  }

  handleMouseOut = (event)=>{
    this.enableSelection()
  }

  isCollapsed = ()=>{
    return this.state.selectionMode || this.state.run
  }

  disableBody = target => disableBodyScroll(target)
  
  enableBody = target => enableBodyScroll(target)

  render(){

    return (
      <div>

      <GlobalStyle/>

      <ThemeProvider 
        theme={ theme }>
        
          {
            this.state.selectionMode !== "edit" && this.state.run ?
          
              <Tour
                steps={this.prepareJoyRidyContent(this.state.steps)}
                isOpen={this.state.run}
                onRequestClose={ this.disablePreview } 
                showNavigation={true}
                disableInteraction={true}
                onAfterOpen={this.disableBody}
                onBeforeClose={this.enableBody}
                //CustomHelper={TourHelper}
              />

              : null
          }

          {
            this.state.editElement && this.state.selectionMode == "edit" ? 
              <Tour
                steps={[this.state.editElement]}
                isOpen={true}
                onRequestClose={(e, a)=>{
                  this.disableEditMode()
                 }
                } 
                closeWithMask={false}
                showNavigation={false}
                showButtons={false}
                disableInteraction={true}
                onAfterOpen={this.disableBody}
                onBeforeClose={this.enableBody}
                
                /*children={
                  <div>
                    this shi goeas jeje
                    <button onClick={this.handleSaveTour}>
                      save!
                    </button>
                  </div>
                }*/
              />
              : null
          }

        </ThemeProvider>

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
        
        <StyledFrame style={
            { 
              zIndex: '100000000',
              position: 'fixed',
              bottom: '0px',
              border: 'none',
              width: '100%',
              height: this.isCollapsed() ? '47px' : '219px' 
            }
          }>
          <React.Fragment>

            <TourManagerContainer
              onMouseOver={this.disableSelection}
              onMouseLeave={this.handleMouseOut}
              collapsedEditor={ this.state.selectionMode || this.state.run ? true : undefined }
            >

              <div>

                {
                  !this.state.selectionMode && !this.state.run &&
                
                    <Body>

                      <StepsContainer>
                      {
                        this.state.steps && this.state.steps.map((o) => {
                          return <TourStep step={o}
                                          key={o.target}
                                          domain={this.props.domain}
                                          removeItem={this.removeItem}
                                          enableEditMode={this.enableEditMode}>
                                </TourStep>
                        }
                      )}
                      

                      <NewTourStep 
                        enableSelection={this.enableSelectionMode}>
                      </NewTourStep>

                      </StepsContainer>

                    </Body>
                }

                <Footer>


                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
              
                    <CssPathIndicator>
                      {this.state.cssPath}
                    </CssPathIndicator>  

                    {
                      this.state.selectionMode === "edit" ? 
                      <FooterRight>
                        <div>
                          { //<button onClick={this.disableEditMode}>cancel</button>
                            //<button onClick={this.updateChanges}>save step</button>
                          }
                        </div>
                      </FooterRight> : null
                    }

                    {
                      this.state.selectionMode != "edit" ? 
                      <FooterRight>
                        {
                          this.state.run ?
                            <Button onClick={this.disablePreview}>
                              {'< exit preview'}
                            </Button>
                            : 
                          <div appearance="warning">
                            <Button onClick={this.activatePreview}>preview</Button>
                            <Button onClick={this.handleSaveTour}>save tour</Button>
                          </div>
                        }
                      </FooterRight> : null
                    }
                  </div>

                </Footer>

              </div>

            </TourManagerContainer>

          </React.Fragment>
        </StyledFrame>

      </div>
    )
  }
}


class TourStep extends Component {

  removeItem = (e)=>{
    e.preventDefault()
    e.stopPropagation()
    this.props.removeItem(this.props.step)
  }

  enableEditMode = (e)=>{
    e.preventDefault()
    this.props.enableEditMode(this.props.step)
  }

  render(){
    return <StepContainer>
           <StepBody onClick={this.enableEditMode}>

              <DeleteButton href="#" onClick={this.removeItem}>
                &times;
              </DeleteButton>

              <StepHeader>
                
              </StepHeader>

              <StepMessage>
                <ThemeProvider 
                  theme={ theme }>
                  <DanteContainer>
                    <DraftRenderer
                      raw={JSON.parse(this.props.step.serialized_content)}
                      domain={this.props.domain}
                    />
                  </DanteContainer>
                </ThemeProvider>
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
        <Link href="#" onClick={this.enableSelection}>new + .</Link>
      </NewStepBody>
      </NewStepContainer>
  }
}