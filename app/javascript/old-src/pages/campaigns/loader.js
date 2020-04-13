import React from 'react'

export default class Loader extends React.Component {
  constructor(props){
    super(props)
  }

  render(){
    return(
      <div className="mx-auto" style={{width: "95%"}}>

        <div className="jumbotron" style={{backgroundColor: "#fff"}}>

          <div className="row">
            <div className="col-3">
              <svg id='L3' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
                <circle fill='none' stroke='#000' strokeWidth='4' cx='50' cy='50' r='44'
                opacity='0.5' />
                <circle fill='#000' stroke='#e74c3c' strokeWidth='3' cx='8' cy='54' r='6'
                transform='rotate(51.27 50 48.57)'>
                    <animateTransform attributeName='transform' dur='2s' type='rotate' from='0 50 48'
                    to='360 50 52' repeatCount='indefinite' />
                </circle>
              </svg>
            </div>
            <div className="col-9">
              <h1 className="display-3">Loading Data</h1>
              <p className="lead">wait a few seconds please</p>
              <hr className="my-4"/>
            {/*<img src={"https://loading.io/spinners/ball/lg.bouncing-circle-loading-icon.gif"} />*/}
            </div>
          </div>

        </div>
      </div>
    )
  }
}