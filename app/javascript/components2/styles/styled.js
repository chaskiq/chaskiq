import styled from 'styled-components';
import React from 'react'
export const mainColor = "#0a1a27"; //"#42a5f5";

export const Container = styled.div`
    /*position: fixed;*/
    /* right: 53px; */
    /*bottom: 92px;*/
    width: 100%;
    font-size: 12px;
    line-height: 22px;
    /*font-family: 'Roboto';*/
    font-weight: 500;
    opacity: ${props => props.open ? 1 : 0};
    -webkit-font-smoothing: antialiased;
    font-smoothing: antialiased;
    box-shadow: 1px 1px 100px 2px rgba(0,0,0,0.22);
    border-radius: 10px;
    -webkit-transition: all .2s ease-out;
    -webkit-transition: all .2s ease-in-out;
    -webkit-transition: all .2s ease-in-out;
    transition: all .6s ease-in-out;
    font-family: sans-serif;
    z-index: 1000;
`;

export const UserAutoMessage = styled.div`
  position: fixed;
  bottom: 0px;
  /* width: 320px; */
  font-size: 12px;
  line-height: 22px;
  font-family: 'Roboto';
  font-weight: 500;
  opacity: ${props => props.open ? 1 : 0};
  -webkit-font-smoothing: antialiased;
  font-smoothing: antialiased;
  
  border-radius: 10px;
  -webkit-transition: all .2s ease-out;
  -webkit-transition: all .2s ease-in-out;
  -webkit-transition: all .2s ease-in-out;
  -webkit-transition: all .6s ease-in-out;
  transition: all .6s ease-in-out;
  font-family: sans-serif;
  z-index: 100;
  width: 100%;
  left: 0px;
`

export const AvatarSection = styled.div`
  /* stylelint-disable value-no-vendor-prefix */
  -ms-grid-row: 1;
  -ms-grid-column: 1;
  /* stylelint-enable */
  grid-area: avatar-area;
  margin-right: 8px;
`;

export const EditorSection = styled.div`
  /* stylelint-disable value-no-vendor-prefix */
  -ms-grid-row: 1;
  -ms-grid-column: 2;
  /* stylelint-enable */
  grid-area: editor-area;
`;

export const EditorWrapper = styled.div`
  width: 376px;
  position: fixed;
  right: 14px;
  bottom: 14px;
  z-index: 90000000000000000;

  @media screen and (min-width: 320px) and (max-width: 480px) {
    width: 100%;
    right: 0px;
    bottom: 0px;
  }

`

export const EditorActions = styled.div`
  box-sizing: border-box;
  -webkit-box-pack: end;
  justify-content: flex-end;
  -webkit-box-align: center;
  align-items: center;
  display: flex;
  padding: 12px 1px;
`

export const CommentsWrapper = styled.div`
  min-height: 250px;
  overflow: auto;

  ${(props)=> ( props.isMobile ? 
  'min-height: 76vh; overflow: auto; max-height: 250px;' : 
  'height: 248px;' 
  )}
  
    
`

export const CommentsItem = styled.div`
    padding: 5px;
    /* background-color: #ccc; */
    border-bottom: 1px solid #ececec;
    cursor: pointer;
    &:hover{
      background: aliceblue;
      border-bottom: 1px solid #ececec;
    }
`

export const Prime = styled.div`
    display: block;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    text-align: center;
    color: #f0f0f0;
    margin: 0 0;
    box-shadow: 0 0 4px rgba(0,0,0,.14), 0 4px 8px rgba(0,0,0,.28);
    cursor: pointer;
    -webkit-transition: all .1s ease-out;
    -webkit-transition: all .1s ease-out;
    transition: all .1s ease-out;
    position: relative;
    z-index: 998;
    overflow: hidden;
    background: ${mainColor};
    float: right;
    margin: 5px 20px;
`

export const Header = styled(({isMobile, ...rest})=>(<div {...rest}></div>))`
  /* margin: 10px; */
  font-size: 13px;
  font-family: 'Roboto';
  font-weight: 500;
  color: #f3f3f3;
  height: 55px;
  background: ${mainColor};

  padding-top: 8px;

  border-top-left-radius: ${(props) => props.isMobile ? '0px' : '10px' };
  border-top-right-radius: ${(props) => props.isMobile ? '0px' : '10px' };
  
`

export const Body = styled.div`
  position: relative;
  background: #fff;
  margin: 0px 0 0px 0;
  //height: 300px;
  min-height: 0;
  font-size: 12px;
  line-height: 18px;
  //overflow-y: auto;
  width: 100%;
  float: right;
  //padding-bottom: 100px;
`

export const Footer = styled.div`
  width: 100%;
  display: inline-block;
  background: #fff;
  border-top: 1px solid #eee;
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
  display: flex;
  align-items: center;
  transition: background-color .2s ease,box-shadow .2s ease,-webkit-box-shadow .2s ease;
  box-shadow: 0px -6px 58px #ececec;
`

export const MessageItem = styled.div`
    position: relative;
    margin: 8px 0 15px 0;
    padding: 8px 10px;
    max-width: 60%;
    min-width: 25%;
    display: block;
    word-wrap: break-word;
    border-radius: 3px;
    -webkit-animation: zoomIn .5s cubic-bezier(.42, 0, .58, 1);
    animation: zoomIn .5s cubic-bezier(.42, 0, .58, 1);
    clear: both;
    z-index: 999;

    &.user {
      margin-left: 60px;
      float: left;
      background: rgba(0, 0, 0, 0.03);
      color: #666;      
    }

    &.admin {
      margin-right: 20px;
      float: right;
      background: ${mainColor};
      color: #eceff1; 
    }

    .text{
      margin-bottom: 1em;
    }

    .status {
      position: absolute;
      bottom: 2px;
      width: 100px;
      right: 6px;
      color: #b1afaf;
      font-size: 9px;
      text-align: right;
    }
`;

export const HeaderOption = styled.div`
  //float: left;
  font-size: 15px;
  list-style: none;
  position: relative;
  height: 100%;
  width: 100%;
  text-align: relative;
  margin-right: 10px;
  letter-spacing: 0.5px;
  font-weight: 400;
  display: flex;
  align-items: center;
`

export const ChatAvatar = styled.div`
    left: -52px;
    //background: rgba(0, 0, 0, 0.03);
    position: absolute;
    top: 0;

    img {
      width: 40px;
      height: 40px;
      text-align: center;
      border-radius: 50%;
    }
`

export const NewConvoBtn = styled.a`

    background-color: #242424;
    -webkit-box-shadow: 0 4px 12px rgba(0,0,0,.1);
    box-shadow: 0 4px 12px rgba(0,0,0,.1);
    position: absolute;
    bottom: 77px;
    left: 50%;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);

    height: 40px;
    color: rgb(255, 255, 255);
    font-size: 13px;
    line-height: 14px;
    pointer-events: auto;
    cursor: pointer;
    border-radius: 40px;
    text-align: center;
    -webkit-transition: all .12s;
    transition: all .12s;
    padding: 0 24px;
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
}`

export const ConversationSummary = styled.div`

    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    -ms-flex-wrap: nowrap;
    flex-wrap: nowrap;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-line-pack: stretch;
    align-content: stretch;
    position: relative;
    padding: 6px;

`

export const ConversationSummaryAvatar = styled.div`
      -webkit-box-flex: 0;
      -ms-flex: 0 0 auto;
      flex: 0 0 auto;
      align-self: flex-start;

      img {
        width: 40px;
        height: 40px;
        text-align: center;
        border-radius: 50%;
      }

`

export const ConversationSummaryBody = styled.div`
      -webkit-box-flex: 1;
      -ms-flex: 1;
      flex: 1;
      padding-left: 16px;    
`

export const ConversationSummaryBodyMeta = styled.div`
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    margin-bottom: 8px;   
`

export const ConversationSummaryBodyContent = styled.div`
      -webkit-box-flex: 1;
      -ms-flex: 1;
      flex: 1;
      //padding-left: 16px;    
`

export const Autor = styled.div`
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #8b8b8b;
`

export const Hint = styled.p`
    padding: 29px;
    color: rgb(136, 136, 136);
    background: #f9f9f9;
    margin: 0px;
`
