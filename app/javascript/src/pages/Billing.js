import React from 'react'
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

function Billing ({current_user}) {
  function openCheckout () {
    Paddle.Checkout.open({ 
      product: 596123 ,
      email: current_user.email
    })
  }

  function handleClick () {
    openCheckout()
  }

  return <div>
    <a href="#!" id="buy" onClick={handleClick}>Buy now!</a>
  </div>
}



function mapStateToProps(state) {
  const { auth, app, current_user } = state;
  const { isAuthenticated } = auth;
  //const { sort, filter, collection , meta, loading} = conversations

  return {
    app,
    current_user,
    isAuthenticated,
  };
}

export default withRouter(connect(mapStateToProps)(Billing));
