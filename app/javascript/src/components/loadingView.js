import styled from "@emotion/styled";

import React, { useState } from "react";

// taken from https://codepen.io/sabin42/pen/odjvKy
const LoadingWrapper = styled.div`
  .wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    min-width: 100vw;
    //background-color: #c89b7e;
  }
  .card {
    display: flex;
    padding: 24px;
    border-radius: 5px;
    /*box-shadow: 1px 4px 16px rgba(0,0,0,.4);
    min-height: 300px;
    min-width: 400px;
    background-color: #fbfbfb;*/
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loader {
    border-radius: 50%;
    position: relative;
    margin: 50px;
    display: inline-block;
    height: 0px;
    width: 0px;
  }

  .loader span {
    position: absolute;
    display: block;
    background: #ddd;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    top: -20px;
    perspective: 100000px;
  }
  .loader span:nth-child(1) {
    left: 60px;
    animation: bounce2 1s cubic-bezier(0.04, 0.35, 0, 1) infinite;
    animation-delay: 0s;
    background: #ff756f;
  }
  .loader span:nth-child(2) {
    left: 20px;
    animation: bounce2 1s cubic-bezier(0.04, 0.35, 0, 1) infinite;
    animation-delay: 0.2s;
    background: #ffde6f;
  }
  .loader span:nth-child(3) {
    left: -20px;
    animation: bounce2 1s cubic-bezier(0.04, 0.35, 0, 1) infinite;
    animation-delay: 0.4s;
    background: #01de6f;
  }
  .loader span:nth-child(4) {
    left: -60px;
    animation: bounce2 1s cubic-bezier(0.04, 0.35, 0, 1) infinite;
    animation-delay: 0.6s;
    background: #6f75ff;
  }

  @keyframes bounce2 {
    0%,
    75%,
    100% {
      transform: translateY(0px);
    }
    25% {
      transform: translateY(-30px);
    }
  }
`;

export default function LoadingView({ onClick }) {
  return (
    <LoadingWrapper>
      <section className="wrapper" onClick={onClick}>
        <div className="card">
          <div className="loader">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>
    </LoadingWrapper>
  );
}
