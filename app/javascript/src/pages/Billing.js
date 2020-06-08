import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ContentHeader from '../components/PageHeader'
import Content from '../components/Content'
import Button from '../components/Button'
import { 
  setCurrentSection, 
  setCurrentPage 
} from "../actions/navigation";

function Billing ({ current_user, dispatch }) {

  React.useEffect(()=>{
    dispatch(setCurrentPage('Billing'));
    dispatch(setCurrentSection("Settings"));

    Paddle.Setup({
      vendor: 115475 // Replace with your Vendor ID.
    });

    Paddle.Checkout.open({
      method: "inline",
      email: current_user.email,
      product: 596123, // Replace with your Product or Plan ID
      allowQuantity: false,
      disableLogout: true,
      frameTarget: "checkout-container", // The className of your checkout <div>
      frameInitialHeight: 366,
      frameStyle: "width:100%; background-color: transparent; border: none;"
    });

  }, [])

  return <div>
    <Content>
      <ContentHeader
        title={
          <div className="justify-around items-center">
            <div className="flex items-center">
              <div className="mr-2">
              Checkout
              </div>
              create your Chaskiq subscription
            </div>
          </div>
        }
        //actions={}
      />

      <div className="checkout-container"></div>

    </Content>

  </div>
}

function mapStateToProps (state) {
  const { auth, app, current_user } = state
  const { isAuthenticated } = auth
  // const { sort, filter, collection , meta, loading} = conversations

  return {
    app,
    current_user,
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(Billing))
