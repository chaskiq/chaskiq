import React from 'react';
import styled from '@emotion/styled';
import tw from 'twin.macro';

export const BrowserSimulatorWrap = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  background: #fafafa;
  border: 1px solid #dde1eb;
  -webkit-box-shadow: 0 4px 8px 0 hsla(212, 9%, 64%, 0.16),
    0 1px 2px 0 rgba(39, 45, 52, 0.08);
  box-shadow: 0 4px 8px 0 hsla(212, 9%, 64%, 0.16),
    0 1px 2px 0 rgba(39, 45, 52, 0.08);
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
`;
export const BrowserSimulatorHeader = styled.div`
  background: rgb(199, 199, 199);
  background: linear-gradient(
    0deg,
    rgba(199, 199, 199, 1) 0%,
    rgba(223, 223, 223, 1) 55%,
    rgba(233, 233, 233, 1) 100%
  );
  border-bottom: 1px solid #b1b0b0;
  padding: 10px;
  display: flex;
`;
export const BrowserSimulatorButtons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 43px;

  .r {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #fc635e;
    border: 1px solid #dc4441;
  }
  .y {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #fdbc40;
    border: 1px solid #db9c31;
  }
  .g {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #35cd4b;
    border: 1px solid #24a732;
  }
`;
export const EditorMessengerEmulator = styled.div<EditorMessengerProps>`
  ${(props) =>
    props.mode === 'user_auto_messages'
      ? `
  display:flex;
  justify-content: flex-end;`
      : ''}
`;

type EditorMessengerProps = {
  mode?: 'user_auto_messages' | 'banners';
};

export const EditorMessengerEmulatorWrapper = styled.div<EditorMessengerProps>`
  //position: relative;

  ${({ mode }) =>
    mode === 'user_auto_messages'
      ? tw`bg-white dark:bg-black rounded-lg shadow-lg p-8 pt-0 mb-6 mr-8 border border-gray-300`
      : ''}

  ${({ mode }) =>
    mode === 'user_auto_messages'
      ? `
    width: 380px;
    .icon-add{
      margin-top: -2px;
      margin-left: -2px;
    }
    `
      : ''}
`;

export const EditorPad = styled.div<EditorMessengerProps>`
  ${(props) =>
    props.mode === 'user_auto_messages' &&
    ` display:flex;
				justify-content: flex-end;
				flex-flow: column;
				height: 90vh;

				.postContent {
					height: 440px;
					overflow: auto;
				}
			`}

  ${(props) =>
    props.mode === 'banners' &&
    ` display:flex;
				justify-content: flex-end;
				flex-flow: column;
				height: 40vh;
				position:relative;

				.postContent {
					height: auto !important;
					overflow: auto;
				}
			`}

	${(props) =>
    props.mode !== 'banners' &&
    props.mode !== 'user_auto_messages' &&
    `
			padding: 2em;
			//background-color: white;
			//margin: 2em;
			//border: 1px solid #ececec;

			@media all and (min-width: 1024px) and (max-width: 1280px) {
				margin: 4em;
			}

			@media (max-width: 640px){
				margin: 2em;
			}
			`}
`;

export const EditorMessengerEmulatorHeader = styled.div<EditorMessengerProps>`
  ${(props) =>
    props.mode === 'user_auto_messages'
      ? 'padding: 1em; border-bottom: 1px solid #ccc;'
      : ''}
`;

export default function BrowserSimulator({ children, mode }) {
  return (
    <BrowserSimulatorWrap>
      <BrowserSimulatorHeader>
        <BrowserSimulatorButtons>
          <div className={'circleBtn r'}></div>
          <div className={'circleBtn y'}></div>
          <div className={'circleBtn g'}></div>
        </BrowserSimulatorButtons>
      </BrowserSimulatorHeader>

      <EditorPad mode={mode} className="bg-white dark:bg-black">
        <EditorMessengerEmulator mode={mode}>
          <EditorMessengerEmulatorWrapper mode={mode}>
            <EditorMessengerEmulatorHeader mode={mode} />

            {children}
          </EditorMessengerEmulatorWrapper>
        </EditorMessengerEmulator>
      </EditorPad>
    </BrowserSimulatorWrap>
  );
}
