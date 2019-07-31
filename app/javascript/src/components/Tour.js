import React, {Component} from 'react'
import styled from '@emotion/styled'
import axios from 'axios'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

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
const StepsContainer = styled.div`
  width: 50%;
  overflow:scroll;
  display: flex;
`

const Body = styled.div`
  padding: 30px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
`

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

class TourManager extends Component {
  
  state = {
    enabledTour: false,
    steps: []
  }

  componentDidMount() {
    window.TourManagerEnabled = () => {
      return this.state.enabledTour //alert("oaoaoaoa")
    }

    window.TourManagerMethods = {
      update: this.updateData
    }
  }

  componentWillUnmount() {
    window.TourManagerEnabled = null
    window.TourManagerMethods = null
  }

  updateData = (data)=>{
    console.log("DDDDD", data)
    const csrfToken = document.querySelector("meta[name=csrf-token]").content
    axios.defaults.headers.common['X-CSRF-Token'] = csrfToken
    axios.put(`${this.props.url}?mode=${this.props.mode}`, {
      campaign: {
        steps: data
      }
    })
    //
  }

  openTourManager = ()=>{
    this.setState({
      enabledTour: true
    }, () => {
      /*var winFeature =
        'location=no,toolbar=no,menubar=no,scrollbars=yes,resizable=yes';
      open("/tester", 'null', winFeature)*/
      open(`/tester/${this.props.app.key}`)
    })
  }

  render(){
    return <Body>

            <StepsContainer>
              {
                this.state.steps.map((o) => {
                  return <TourStep step={o}
                    key={o.target}>
                    //removeItem={this.removeItem}
                    //enableEditMode={this.enableEditMode}>
                  </TourStep>
                }
                )
              }

              <NewTourStep
                openTourManager={this.openTourManager}>
              </NewTourStep>

            </StepsContainer>

          </Body>
  }
}


class NewTourStep extends Component {
  enableSelection = (e) => {
    e.preventDefault()
    this.props.openTourManager()
  }
  render() {
    return <NewStepContainer>
      <NewStepBody>
        <a href="#" onClick = {this.enableSelection}>new +</a>
      </NewStepBody>
    </NewStepContainer>
  }
}

class TourStep extends Component {

  removeItem = (e)=>{
    e.preventDefault()
  }

  enableEditMode = (e)=>{
    e.preventDefault()

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


function mapStateToProps(state) {

  const { auth, app } = state
  const { loading, isAuthenticated } = auth

  return {
    app,
    loading,
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(TourManager))

