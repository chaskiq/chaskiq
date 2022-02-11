import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

import React from 'react';
import StyledFrame from '../styledFrame';
import { darken } from 'polished';
import { textColor } from './utils';
import tw from 'twin.macro';
export const mainColor = '#0a1a27'; // "#42a5f5";

const rotate = keyframes`
  from {
    transform: rotate(-45deg);
    translateY(-30);
  }

  to {
    transform: rotate(0deg);
    transform: translateY(-8px);
  }
`;

const appear = keyframes`
  from {
    transform: translateY(1000px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const Bounce = keyframes`
  0%,
  80%,
  100% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }
  40% {
    -webkit-transform: scale(1.0);
    transform: scale(1.0);
  }
`;

export const FadeInBottom = keyframes`
    0% {
      -webkit-transform: translateY(50px);
              transform: translateY(50px);
      opacity: 0;
    }
    100% {
      -webkit-transform: translateY(0);
              transform: translateY(0);
      opacity: 1;
    }
`;

export const FadeInRight = keyframes`
  0% {
    transform: translateX(50px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const FadeOutBottom = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(50px);
    opacity: 0;
  }
`;

export const FadeOutRight = keyframes`
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(50px);
    opacity: 0;
  }
`;

export type ContainerProps = {
  isMobile?: boolean;
  appear?: string;
};

export type NewConvoBtnContainerProps = {
  styles?: React.CSSProperties | string;
};

export type ThemeProps = {
  palette: any;
  isMessengerActive?: boolean;
};

export type UserAutoMessageStyledFrameProps = {
  isMinimized?: boolean;
  theme: ThemeProps;
  children: React.ReactChild;
};

export type InlineProps = {
  isInline?: boolean;
};

export type IsHiddenProps = {
  isHidden?: boolean;
};

export type IsReverseProps = {
  isReverse?: boolean;
};

export type OpacityProps = {
  displayOpacity?: boolean;
};

export type TransitionProps = {
  in?: 'in' | 'out';
};

export const Container = styled.div<ContainerProps>`
  animation: ${appear} 0.6s cubic-bezier(0.39, 0.575, 0.565, 1) both;

  ${(props) =>
    props.isMobile
      ? `min-height: 250px;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 5px 40px;
      opacity: 1;
      z-index: 100000;
      width: 100%;
      height: 100%;
      max-height: none;
      top: 0px;
      left: 0px;
      right: 0px;
      bottom: 0px;
      position: fixed;
      overflow: hidden;
      border-radius: 0px;`
      : `z-index: 2147483000;
      position: fixed;
      bottom: 91px;
      right: 20px;
      width: 376px;
      min-height: 250px;
      max-height: 704px;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 5px 40px;
      opacity: 1;
      height: calc(100% - 120px);
      border-radius: 8px;
      overflow: hidden;`}
`;

export const AssigneeStatus = styled.span<{ theme: ThemeProps }>`
  font-size: 11px;
  color: ${(props) => textColor(props.theme.palette.primary)};
`;

export const AssigneeStatusWrapper = styled.span`
  display: flex;
  flex-flow: column;
  align-items: start;
  justify-content: center;
  margin-left: 10px;
  p {
    margin: 0px 0px 6px 0px;
  }
`;

export const ShowMoreWrapper = styled.div<TransitionProps>`
  z-index: 10000;
  position: absolute;
  width: 315px;
  display: flex;
  justify-content: space-between;

  ${(props) => FadeBottomAnimation(props)}

  button {
    padding: 9px;
    box-shadow: -1px 1px 1px #00000036;
    border-radius: 11px;
    background: #a6aeceaa;
    border: none;
    color: white;
    cursor: pointer;
  }

  button.close {
  }
`;

export const DisabledElement = styled.div`
  padding: 1.2em !important;
  ${() => tw`w-full p-4 flex justify-center text-sm font-light`}
`;

export const SuperDuper = styled('div')`
  width: 100%;
  height: 100%;
  position: absolute;
`;

export const Overflow = styled.div`
  z-index: 9900000;
  position: fixed;
  width: 545px;
  height: 100vh;
  bottom: 0px;
  right: 0px;
  content: '';
  pointer-events: none;
  background: radial-gradient(
    at right bottom,
    rgba(29, 39, 54, 0.16) 9%,
    rgba(0, 0, 0, 0) 72%
  );
`;

export const UserAutoMessageStyledFrame = styled(StyledFrame)<
  UserAutoMessageStyledFrameProps & { theme: ThemeProps }
>`
  display: block;
  border: 0px;
  z-index: 1000;
  width: 350px;
  position: absolute;

  ${(props) => {
    return props.isMinimized ? 'height: 73px;' : 'height: 70vh;';
  }}

  ${(props) => {
    return props.theme.isMessengerActive
      ? `
        bottom: 49px;
        right: 6px;
      `
      : `
        bottom: 0px;
        right: 0px;
      `;
  }}
`;

export const CloseButtonWrapper = styled.div`
  position: absolute;
  right: 21px;
  z-index: 30000;
  top: 29px;
  button {
    border: none;
    background: transparent;
    cursor: pointer;
  }
`;

export const SuperFragment = styled.div`
    -webkit-box-pack: start;
    -ms-flex-pack: start;
    justify-content: flex-start;
    overflow: hidden;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    font-family: "Inter", Helvetica, Arial, sans-serif, "Apple Color Emoji";

    .fade-in-bottom {
      -webkit-animation: ${FadeInBottom} 0.6s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
              animation: ${FadeInBottom} 0.6s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
    }

    .fade-in-right {
      animation: ${FadeInRight} 0.6s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
    }

    .fade-out-bottom {
      animation: ${FadeOutBottom} 0.7s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    }

    .fade-out-right {
      animation: ${FadeOutRight} 0.7s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    }
}
`;

export const FadeRightAnimation = (props: TransitionProps) => {
  return props.in === 'in'
    ? `animation: ${FadeInRight.name} 0.6s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;      `
    : `animation: ${FadeOutRight.name} 0.7s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;`;
};

export const FadeBottomAnimation = (props: TransitionProps) => {
  return props.in === 'in'
    ? `animation: ${FadeInBottom.name} 0.6s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;`
    : `animation: ${FadeOutBottom.name} 0.7s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;`;
};

export const MessageSpinner = styled.div`
  display: inline-block;
  padding: 15px 20px;
  font-size: 14px;
  color: #ccc;
  border-radius: 30px;
  line-height: 1.25em;
  font-weight: 200;
  opacity: 0.2;
  margin: 0;
  width: 80px;
  text-align: center;

  & > div {
    width: 10px;
    height: 10px;
    border-radius: 100%;
    display: inline-block;
    -webkit-animation: ${Bounce} 1.4s infinite ease-in-out both;
    animation: ${Bounce} 1.4s infinite ease-in-out both;
    background: rgba(0, 0, 0, 1);
  }

  .bounce1 {
    -webkit-animation-delay: -0.32s;
    animation-delay: -0.32s;
  }

  .bounce2 {
    -webkit-animation-delay: -0.16s;
    animation-delay: -0.16s;
  }
`;

export const UserAutoMessageFlex = styled(({ isMinimized, ...rest }) => (
  <div {...rest} />
))`
  display: flex;
  flex-direction: column;

  ${(props) => {
    return props.isMinimized ? 'height: 70vh;' : 'height: 92vh;';
  }}

  justify-content: space-between;
`;

export const MessageCloseBtn = styled.a`
  position: absolute;
  right: 8px;
  display: inline-block;
  padding: 4px;
  background: #73737394;
  border-radius: 3px;
  font-size: 0.8em;
  -webkit-text-decoration: none;
  -webkit-text-decoration: none;
  text-decoration: none;
  float: right;
  color: white;
  text-transform: uppercase;
  font-weight: 100;
`;

export const ConversationEventContainer = styled.div<InlineProps>`
  border-radius: 7px;
  background: gold;
  display: flex;
  justify-content: center;
  margin: 6px 4.2em;
  padding: 0.7em;
  font-size: 0.8em;
  box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.1);

  ${(props) => {
    return props.isInline
      ? 'box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.36), 0 1px 2px 0 rgba(0, 0, 0, 0.61)'
      : '';
  }}
`;

export const AppPackageBlockContainer = styled.div<IsHiddenProps>`
  padding-top: 1em;
  padding-bottom: 1em;
  border-radius: 7px;
  margin: 0.7em;
  background: #fff;
  ${(props) => (props.isHidden ? 'display:none;' : '')}

  box-shadow: 0 4px 15px 0 rgba(0,0,0,.1), 0 1px 2px 0 rgba(0,0,0,.1);
  fieldset {
    width: 100%;
  }
  p {
    font-size: 0.8em;
    font-weight: 300;
    color: gray;
    line-height: 1.4em;
  }

  .form-group {
  }

  form.form {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    .form-group {
      display: flex;
      flex-direction: column;
      &.error {
        input {
          border: 1px solid red;
        }
      }
      .errors {
        font-size: 0.7em;
        color: red;
        margin-left: 4px;
      }
    }

    label {
      margin: 3px;
      display: inline-block;
      margin-bottom: 0.5rem;
    }
    input {
      margin: 3px;
      display: block;
      padding: 0.375rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5;
      color: #495057;
      background-color: #fff;
      background-clip: padding-box;
      border: 1px solid #ced4da;
      border-radius: 0.25rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }
    button:not(:disabled):not(.disabled) {
      cursor: pointer;
    }
    [type='reset'],
    [type='submit'],
    button,
    html [type='button'] {
      -webkit-appearance: button;
    }
    .elementsContainer {
      display: flex;
      flex-direction: column;
    }

    button.tuti {
      color: #fff;
      background-color: #007bff;
      border-color: #007bff;

      display: inline-block;
      font-weight: 400;
      text-align: left;
      white-space: break-word;
      vertical-align: middle;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      border: 1px solid transparent;
      padding: 0.375rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5;
      border-radius: 0.25rem;
      transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
        border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }
  }
`;

export const AppPackageBlockButtonItem = styled.div`
  ${() => tw`flex justify-end mx-4 my-1.5 `}
`;

export const AppPackageBlockTextItem = styled.div`
  ${() => tw`text-right mx-4 my-1.5 text-sm text-gray-400 font-light`}
  a {
    ${() => tw`text-sm text-gray-600 font-normal hover:text-gray-900`}
  }
`;

export const UserAutoMessage = styled.div`
  box-shadow: -1px 3px 3px 3px rgba(158, 191, 208, 0.09);
  border: 1px solid #f3f0f0;
  height: 100vh;
  width: 96vw;
  overflow: scroll;
  border-radius: 5px;
  background: #fff;
  /* -webkit-flex: 1; */
  -ms-flex: 1;
  /* flex: 1; */
  /* align-self: end; */
  margin-bottom: 10px;
`;

export const UserAutoMessageBlock = styled.div`
  height: 16px;
  width: 96vw;
  background: transparent;
  margin-bottom: 10px;
`;

export const AvatarSection = styled.div`
  /* stylelint-disable value-no-vendor-prefix */
  -ms-grid-row: 1;
  -ms-grid-column: 1;
  /* stylelint-enable */
  grid-area: avatar-area;
  margin-right: 8px;
`;

export const EditorSection = styled.div<InlineProps>`
  /* stylelint-disable value-no-vendor-prefix */
  -ms-grid-row: 1;
  -ms-grid-column: 2;
  /* stylelint-enable */
  grid-area: editor-area;
  ${(props) =>
    props.isInline
      ? `
    height: 69vh;
    overflow: auto;`
      : ''}
`;

export const InlineConversationWrapper = styled.div`
  border: 1px solid red;
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

  .inline-frame {
    z-index: 10000000;
    position: absolute;
    bottom: 89px;
    width: 335px;

    right: 20px;
    border: none;

    min-height: 174px;
  }
`;

export const EditorActions = styled.div`
  box-sizing: border-box;
  -webkit-box-pack: end;
  justify-content: flex-end;
  -webkit-box-align: center;
  align-items: center;
  display: flex;
  padding: 12px 1px;
`;

export const CommentsWrapper = styled.div<InlineProps & IsReverseProps>`
  ${(props) =>
    props.isInline ? 'padding-bottom: 0px;' : 'padding-bottom: 105px;'}
  flex-grow: 1;
  flex-shrink: 0;
  justify-content: space-between;
  overflow-anchor: none;
  height: auto;
  font-family: 'Inter', Helvetica, arial, sans-serif;

  ${(props) =>
    props.isReverse
      ? `
    flex-direction : column-reverse;`
      : `
      flex-direction: column;
    `}
  display: flex;
`;

export const CommentsItem = styled.div<OpacityProps>`
  padding: 12px;
  /* background-color: #ccc; */
  border-bottom: 1px solid #ececec;
  cursor: pointer;
  &:hover {
    background: aliceblue;
    border-bottom: 1px solid #ececec;
  }

  transition: all 0.4s ease-out;

  ${(props) => (props.displayOpacity ? 'opacity: 1;' : 'opacity: 0;')}
`;

export const Prime = styled.div<{ theme: ThemeProps }>`
  position: relative;
  display: block;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  text-align: center;
  margin: 0 0;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.14), 0 4px 8px rgba(0, 0, 0, 0.28);
  cursor: pointer;
  transition: all 0.1s ease-out;
  position: relative;
  z-index: 998;
  color: ${(props) => textColor(props.theme.palette.secondary)};
  background: ${(props) => props.theme.palette.secondary};
  float: right;
  margin: 16px 8px;
  animation: ${rotate} 0.3s cubic-bezier(0.39, 0.575, 0.565, 1) both;
`;

export const FooterAckInline = styled.div`
  width: 100%;
  padding-top: 4em;
  text-align: center;
  display: flex;
  justify-content: center;
  a {
    display: flex;
    align-items: center;
    font-size: 0.8em;
    color: #716f6f;
    text-decoration: none;
    padding: 5px 11px 5px 11px;
    &:hover {
      color: #343333;
      background-color: #f7f7f7;
      border-radius: 20px;
    }
    img {
      width: 16px;
      height: 16px;
      margin-right: 9px;
    }
  }
`;

export const FooterAck = styled(FooterAckInline)`
  position: absolute;
  width: 100%;
  bottom: 0px;
  z-index: 1000;
  padding: 3px 0px 4px 0px;
  box-shadow: 0px -2px 18px #38383840;
  background: white;
`;

export const CountBadge = styled.div<{
  section?:
    | 'article'
    | 'home'
    | 'conversations'
    | 'conversation'
    | 'appBlockAppPackage';
}>`

  ${() =>
    tw`h-6 w-6 rounded-full text-white text-center p-1 absolute bg-red-600 text-xs`}
  ${(props) =>
    props.section === 'home'
      ? `top: 42px;
    left: 15px;`
      : ''}

  top: 0px;
  left: -8px;

  ${(props) => (props.section === 'conversation' ? 'top: 13px;left: 7px;' : '')}

  ${(props) =>
    props.section === 'conversations' ? 'top: 13px;left: 7px;' : ''}
}

`;

export const Header = styled(({ isMobile, ...rest }) => (
  <header {...rest}></header>
))<{
  theme: ThemeProps;
}>`
  height: 75px;
  position: relative;
  min-height: 75px;
  background: ${(props) => props.theme.palette.primary};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.palette.primary} 0%,
    ${(props) => darken(0.2, props.theme.palette.primary)} 100%
  );
  color: ${(props) => textColor(props.theme.palette.primary)};
  -webkit-transition: height 160ms ease-out;
  transition: height 160ms ease-out;

  &:before {
    content: '';
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
    position: absolute;
    ${(props) => {
      return props.theme.palette.pattern
        ? `
        opacity: 0.38; 
        background-image: url(${props.theme.palette.pattern});
      `
        : '';
    }}
    background-size: 610px 610px, cover;
    pointer-events: none;
  }
`;

export const Body = styled.div`
  position: relative;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
  background-color: #fff;
  -webkit-box-shadow: inset 0 21px 4px -20px rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 21px 4px -20px rgba(0, 0, 0, 0.2);
`;

export const Footer = styled.div<{
  isInputEnabled: boolean;
  conversationState: string;
}>`
  z-index: 100000;
  text-align: center;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 0 0 6px 6px;
  /*pointer-events: none;*/
  background: -webkit-gradient(
    linear,
    left bottom,
    left top,
    from(#fff),
    to(rgba(255, 255, 255, 0))
  );
  background: linear-gradient(0deg, #fff, rgba(255, 255, 255, 0));
  margin: 25px 0 0px 0px;
  font-size: 0.8em;
  color: gray;
  padding: 11px 0px 0px 0px;

  ${({ conversationState }) =>
    conversationState == 'closed'
      ? `pointer-events: none; 
       height: 100%; 
       color: black; 
       font-weight: 700;`
      : 'height: 38px;'}

  &.inline {
    ${(props) => (!props.isInputEnabled ? 'height: 0px;' : '')}
    background: transparent;
    bottom: 9px;
    textarea {
      border-radius: 8px !important;
      box-shadow: 4px 4px 1px #00000061;
      bottom: -2px;
      left: 8px;
      width: 96%;
    }
    input[type='file'] {
      display: none;
    }
  }
`;

export const ConversationsFooter = styled.div`
  z-index: 100000;
  text-align: center;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 0 0 6px 6px;
  height: 90px;
  pointer-events: none;
  background: -webkit-gradient(linear,left bottom,left top,from(#fff),to(rgba(255,255,255,0)));
  background: linear-gradient(0deg,#fff,rgba(255,255,255,0));
}
`;

export const UserAutoChatAvatar = styled.div`
  display: flex;
  align-items: center;
  span {
    font-size: 0.8rem;
    margin-left: 10px;
    color: #b1b1b1;
  }
  img {
    width: 40px;
    height: 40px;
    background: white;
    text-align: center;
    border-radius: 50%;
  }
`;

export const ReadIndicator = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: red;
  left: 3px;
  top: 20px;
  border-radius: 50%;
`;

export const MessageItem = styled.div<
  { messageSourceType?: 'UserAutoMessage'; theme: ThemeProps } & InlineProps
>`
  position: relative;
  min-width: 25%;
  display: block;
  word-wrap: break-word;
  -webkit-animation: zoomIn 0.5s cubic-bezier(0.42, 0, 0.58, 1);
  animation: zoomIn 0.5s cubic-bezier(0.42, 0, 0.58, 1);
  clear: both;
  z-index: 999;
  margin: 0.7em 0;

  font-size: 15px;

  &.admin {
    align-self: flex-start;
    display: flex;
    flex-direction: row;
    .message-content-wrapper {
      word-break: break-word;

      background: #fff;
      padding: 16px;

      margin: 8px 13px 0px 5px;
      border-radius: 6px;
      min-width: 80px;

      line-height: 1.5;
      position: relative;
      border-radius: 5px 5px 5px 0px;

      box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.1),
        0 1px 2px 0 rgba(0, 0, 0, 0.1);

      ${(props) => {
        return props.isInline
          ? 'box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.36), 0 1px 2px 0 rgba(0, 0, 0, 0.61)'
          : '';
      }}
    }

    .text {
      p {
        color: #000;
      }
    }
  }

  &.user {
    .message-content-wrapper {
      word-break: break-word;
      background: linear-gradient(
        135deg,
        ${(props) => props.theme.palette.primary} 0%,
        ${(props) => darken(0.2, props.theme.palette.primary)} 100%
      );
      color: ${(props) => textColor(props.theme.palette.primary)};

      min-width: 80px;
      padding: 16px;
      margin: 5px;
      margin-right: 10px;
      border-radius: 6px;
      min-width: 80px;
      box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.1),
        0 1px 2px 0 rgba(0, 0, 0, 0.1);

      ${(props) => {
        return props.isInline
          ? 'box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.36), 0 1px 2px 0 rgba(0, 0, 0, 0.61)'
          : '';
      }}

      line-height: 1.5;
      height: 100%;
      position: relative;
      border-radius: 5px 5px 0px 5px;
    }

    // hack on image from user, not use position absolute
    .graf-image {
      position: inherit !important;
    }

    ${(props) =>
      props.messageSourceType === 'UserAutoMessage'
        ? `
        align-self: center;
        border: 1px solid #f1f0f0;
      `
        : `
        align-self: flex-end;
        display: flex;
        flex-direction: row-reverse;

      `}

    a {
      color: white;
    }

    color: #eceff1;

    .text {
      p {
        color: #fff;
      }
    }
  }

  .text {
    margin-bottom: 1em;
    color: #eceff1;
    p {
      font-size: 0.86rem;
      margin: 0px;
      padding: 0px;
    }
  }

  .status {
    display: flex;
    justify-content: flex-end;
    color: #b1afaf;
    font-size: 10px;
    text-align: right;
  }
`;

export const HeaderOption = styled.div<TransitionProps>`
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
  ${(props) => FadeRightAnimation(props)}
`;

export const HeaderTitle = styled.span<TransitionProps>`
  ${() => tw`space-y-2`}
  .title {
    ${() => tw`text-3xl antialiased font-bold`}
  }
  p.tagline {
    ${() => tw`text-sm antialiased font-light mb-3`}
  }
`;

export const HeaderAvatar = styled.div<{ theme: ThemeProps }>`
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  align-self: center;
  color: ${(props) => textColor(props.theme.palette.primary)};

  img {
    width: 40px;
    height: 40px;
    text-align: center;
    border-radius: 50%;
  }

  div {
    display: flex;
    flex-flow: column;
    margin-left: 0.6em;
    p {
      padding: 0px;
      margin: 0px;
    }
  }
`;

export const ChatAvatar = styled.div`
  align-self: flex-end;
  img {
    width: 40px;
    height: 40px;
    background: white;
    text-align: center;
    border-radius: 50%;
  }
`;

export const AnchorButton = styled.a<{ theme: ThemeProps }>`
  text-decoration: none;
  background-color: ${(props) => props.theme.palette.secondary};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: 40px;
  color: ${(props) => textColor(props.theme.palette.secondary)} !important;
  font-size: 13px;
  line-height: 14px;
  pointer-events: auto;
  cursor: pointer;
  border-radius: 40px;
  display: inline-flex;
  align-items: center;
  padding: 0 24px;
  display: inline-flex;
  align-items: center;
`;

export const NewConvoBtnContainer = styled.div<NewConvoBtnContainerProps>`
  position: absolute;
  bottom: 77px;
  width: 100%;
  padding: 0 37px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const NewConvoBtn = styled(AnchorButton)<TransitionProps>``;

export const ConversationSummary = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  align-content: stretch;
  position: relative;
  padding: 6px;
`;

export const ConversationSummaryAvatar = styled.div`
  flex: 0 0 auto;
  align-self: flex-end;
  margin-left: 15px;
  img {
    width: 40px;
    height: 40px;
    background: white;
    text-align: center;
    border-radius: 50%;
  }
`;

export const ConversationSummaryBody = styled.div`
  flex: 1;
  padding-left: 16px;
`;

export const ConversationSummaryBodyMeta = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const ConversationSummaryBodyItems = styled.div`
  display: flex;
  font-size: 12px;
  .you {
    margin-right: 5px;
  }
`;
export const ConversationSummaryBodyContent = styled.div`
  color: #656464;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
  font-weight: 300;
  p {
    margin: 0px;
  }
`;

export const Autor = styled.div`
  font-weight: 500;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #575656;
`;

export const Hint = styled.p`
  /*  padding: 29px;
    color: rgb(136, 136, 136);
    background: #f9f9f9;
    margin: 0px;
    height: 100%;*/

  ${() => tw`text-sm leading-5 text-gray-600 h-full p-8 bg-gray-100`}
`;

export const SpinnerAnim = keyframes`
  to {transform: rotate(360deg);}
`;

export const Spinner = styled.div`
  &:before {
    content: '';
    box-sizing: border-box;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid #ccc;
    border-top-color: #000;
    animation: ${SpinnerAnim} 0.6s linear infinite;
    display: inline-block;
  }
`;
