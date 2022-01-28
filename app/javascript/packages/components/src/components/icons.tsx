import React from 'react';

// import tw from 'tailwind.macro'
import tw from 'twin.macro';
import styled from '@emotion/styled';

type BaseIconType = {
  variant?: 'small' | 'rounded';
};

const BaseIcon = styled.svg<BaseIconType>`
  ${(props) => {
    switch (props.variant) {
      case 'small':
        return tw`h-4 w-4 outline-none`;
      case 'rounded':
        return tw`m-3 h-3 w-3 outline-none`;
      default:
        return tw`h-5 w-5 outline-none`;
    }
  }};
`;

export function KeyIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
      role="presentation"
    >
      <path
        d="M.5 14.5l8-8m-6 6l2 2m0-4l2 2m4.5-5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"
        stroke="currentColor"
      ></path>
    </BaseIcon>
  );
}

export function WidgetsIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      tabindex="-1"
      title="Widgets"
    >
      <path d="M13 13v8h8v-8h-8zM3 21h8v-8H3v8zM3 3v8h8V3H3zm13.66-1.31L11 7.34 16.66 13l5.66-5.66-5.66-5.65z"></path>
    </BaseIcon>
  );
}

export function ApiIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      viewBox="0 0 30 30"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M 4 5 C 2.895 5 2 5.895 2 7 L 2 23 C 2 24.105 2.895 25 4 25 L 26 25 C 27.105 25 28 24.105 28 23 L 28 7 C 28 5.895 27.105 5 26 5 L 4 5 z M 7.2519531 11 L 9.7421875 11 L 12.431641 19 L 10.214844 19 L 9.7148438 17.242188 L 7.1035156 17.242188 L 6.5878906 19 L 4.5683594 19 L 7.2519531 11 z M 14 11 L 17.503906 11 C 19.222906 11 20.386719 12.120844 20.386719 13.839844 C 20.386719 15.541844 19.161812 16.654297 17.382812 16.654297 L 16.033203 16.654297 L 16.033203 19 L 14 19 L 14 11 z M 23 11 L 25.033203 11 L 25.033203 19 L 23 19 L 23 11 z M 16.035156 12.5625 L 16.035156 15.119141 L 16.955078 15.119141 C 17.820078 15.119141 18.330078 14.67475 18.330078 13.84375 C 18.329078 13.00075 17.825797 12.5625 16.966797 12.5625 L 16.035156 12.5625 z M 8.3671875 12.802734 L 7.4902344 15.779297 L 9.3320312 15.779297 L 8.4726562 12.802734 L 8.3671875 12.802734 z"></path>
    </BaseIcon>
  );
}

export function ChartsIcons(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="-3 0 20 20"
      aria-hidden="true"
      role="presentation"
    >
      <path
        d="M.5 14.5H0v.5h.5v-.5zm6-9l.4-.3a.5.5 0 00-.816.023L6.5 5.5zm3 4l-.4.3a.5.5 0 00.807-.01L9.5 9.5zM0 0v14.5h1V0H0zm.5 15H15v-1H.5v1zm2.416-3.223l4-6-.832-.554-4 6 .832.554zM6.1 5.8l3 4 .8-.6-3-4-.8.6zm3.807 3.99l5-7-.814-.58-5 7 .814.58z"
        fill="currentColor"
      ></path>
    </BaseIcon>
  );
}

export function MapIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"></path>
    </BaseIcon>
  );
}

export function ColumnsIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M10 18h5V5h-5v13zm-6 0h5V5H4v13zM16 5v13h5V5h-5z"></path>
    </BaseIcon>
  );
}

export function LeftArrow(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z"></path>
    </BaseIcon>
  );
}

export function UpArrow(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </BaseIcon>
  );
}

export function DownArrow(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </BaseIcon>
  );
}

export function Facebook(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M2,1.99079514 C2,0.891309342 2.89706013,0 4.00585866,0 L14.9931545,0 C15.5492199,0 16,0.443864822 16,1 L16,2 L5.00247329,2 C4.44882258,2 4,2.44386482 4,3 C4,3.55228475 4.44994876,4 5.00684547,4 L16.9931545,4 C17.5492199,4 18,4.44463086 18,5.00087166 L18,18.0059397 C18,19.1072288 17.1054862,20 16.0059397,20 L3.99406028,20 C2.8927712,20 2,19.1017876 2,18.0092049 L2,1.99079514 Z M6,4 L10,4 L10,12 L8,10 L6,12 L6,4 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function Twitter(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M2,1.99079514 C2,0.891309342 2.89706013,0 4.00585866,0 L14.9931545,0 C15.5492199,0 16,0.443864822 16,1 L16,2 L5.00247329,2 C4.44882258,2 4,2.44386482 4,3 C4,3.55228475 4.44994876,4 5.00684547,4 L16.9931545,4 C17.5492199,4 18,4.44463086 18,5.00087166 L18,18.0059397 C18,19.1072288 17.1054862,20 16.0059397,20 L3.99406028,20 C2.8927712,20 2,19.1017876 2,18.0092049 L2,1.99079514 Z M6,4 L10,4 L10,12 L8,10 L6,12 L6,4 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function Instagram(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M2,1.99079514 C2,0.891309342 2.89706013,0 4.00585866,0 L14.9931545,0 C15.5492199,0 16,0.443864822 16,1 L16,2 L5.00247329,2 C4.44882258,2 4,2.44386482 4,3 C4,3.55228475 4.44994876,4 5.00684547,4 L16.9931545,4 C17.5492199,4 18,4.44463086 18,5.00087166 L18,18.0059397 C18,19.1072288 17.1054862,20 16.0059397,20 L3.99406028,20 C2.8927712,20 2,19.1017876 2,18.0092049 L2,1.99079514 Z M6,4 L10,4 L10,12 L8,10 L6,12 L6,4 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function LinkedIn(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M2,1.99079514 C2,0.891309342 2.89706013,0 4.00585866,0 L14.9931545,0 C15.5492199,0 16,0.443864822 16,1 L16,2 L5.00247329,2 C4.44882258,2 4,2.44386482 4,3 C4,3.55228475 4.44994876,4 5.00684547,4 L16.9931545,4 C17.5492199,4 18,4.44463086 18,5.00087166 L18,18.0059397 C18,19.1072288 17.1054862,20 16.0059397,20 L3.99406028,20 C2.8927712,20 2,19.1017876 2,18.0092049 L2,1.99079514 Z M6,4 L10,4 L10,12 L8,10 L6,12 L6,4 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function LaunchIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"></path>
    </BaseIcon>
  );
}

export function LangGlobeIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
      title="en"
    >
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"></path>
    </BaseIcon>
  );
}

export function BookMarkIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M2,1.99079514 C2,0.891309342 2.89706013,0 4.00585866,0 L14.9931545,0 C15.5492199,0 16,0.443864822 16,1 L16,2 L5.00247329,2 C4.44882258,2 4,2.44386482 4,3 C4,3.55228475 4.44994876,4 5.00684547,4 L16.9931545,4 C17.5492199,4 18,4.44463086 18,5.00087166 L18,18.0059397 C18,19.1072288 17.1054862,20 16.0059397,20 L3.99406028,20 C2.8927712,20 2,19.1017876 2,18.0092049 L2,1.99079514 Z M6,4 L10,4 L10,12 L8,10 L6,12 L6,4 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function DockerIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path
        fill="none"
        d="M-74 29h48v48h-48V29zM0 0h24v24H0V0zm0 0h24v24H0V0z"
      ></path>
      <path d="M13 12h7v1.5h-7zm0-2.5h7V11h-7zm0 5h7V16h-7zM21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15h-9V6h9v13z"></path>
    </BaseIcon>
  );
}

export function PaintIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z"></path>
      <path fillOpacity=".36" d="M0 20h24v4H0z"></path>
    </BaseIcon>
  );
}

export function QueueIcon(_props) {
  return (
    <BaseIcon
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
      />
    </BaseIcon>
  );
}

export function GestureIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M4.59 6.89c.7-.71 1.4-1.35 1.71-1.22.5.2 0 1.03-.3 1.52-.25.42-2.86 3.89-2.86 6.31 0 1.28.48 2.34 1.34 2.98.75.56 1.74.73 2.64.46 1.07-.31 1.95-1.4 3.06-2.77 1.21-1.49 2.83-3.44 4.08-3.44 1.63 0 1.65 1.01 1.76 1.79-3.78.64-5.38 3.67-5.38 5.37 0 1.7 1.44 3.09 3.21 3.09 1.63 0 4.29-1.33 4.69-6.1H21v-2.5h-2.47c-.15-1.65-1.09-4.2-4.03-4.2-2.25 0-4.18 1.91-4.94 2.84-.58.73-2.06 2.48-2.29 2.72-.25.3-.68.84-1.11.84-.45 0-.72-.83-.36-1.92.35-1.09 1.4-2.86 1.85-3.52.78-1.14 1.3-1.92 1.3-3.28C8.95 3.69 7.31 3 6.44 3 5.12 3 3.97 4 3.72 4.25c-.36.36-.66.66-.88.93l1.75 1.71zm9.29 11.66c-.31 0-.74-.26-.74-.72 0-.6.73-2.2 2.87-2.76-.3 2.69-1.43 3.48-2.13 3.48z"></path>
    </BaseIcon>
  );
}

export function MessageBubbleIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M10,15 L18.0092049,15 C19.1017876,15 20,14.1019465 20,12.9941413 L20,3.00585866 C20,1.89706013 19.1086907,1 18.0092049,1 L1.99079514,1 C0.898212381,1 0,1.89805351 0,3.00585866 L0,12.9941413 C0,14.1029399 0.891309342,15 1.99079514,15 L6,15 L6,19 L10,15 Z M5,7 L7,7 L7,9 L5,9 L5,7 Z M9,7 L11,7 L11,9 L9,9 L9,7 Z M13,7 L15,7 L15,9 L13,9 L13,7 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function ShuffleIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M6.58578644,12.8284271 L4.41028736,15.0039262 C3.83091964,15.5832939 2.81955537,16 2.00104344,16 L0,16 L0,14 L2.00104344,14 C2.29046199,14 2.79273472,13.7930517 2.9960738,13.5897126 L5.17157288,11.4142136 L6.58578644,12.8284271 L6.58578644,12.8284271 Z M16,6 L13.9998075,6 C13.7100858,6 13.2055579,6.20865568 13.0039262,6.41028736 L10.8284271,8.58578644 L10.8284271,8.58578644 L9.41421356,7.17157288 L11.5897126,4.9960738 C12.1666986,4.41908781 13.1800499,4 13.9998075,4 L16,4 L16,1 L20,5 L16,9 L16,6 Z M16,16 L13.9998075,16 C13.1800499,16 12.1666986,15.5809122 11.5897126,15.0039262 L2.9960738,6.41028736 C2.79273472,6.20694828 2.29046199,6 2.00104344,6 L0,6 L0,4 L2.00104344,4 C2.81955537,4 3.83091964,4.41670608 4.41028736,4.9960738 L13.0039262,13.5897126 C13.2055579,13.7913443 13.7100858,14 13.9998075,14 L16,14 L16,11 L20,15 L16,19 L16,16 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function ConversationIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M14,11 L8.00585866,11 C6.89706013,11 6,10.1081436 6,9.00798298 L6,1.99201702 C6,0.900176167 6.89805351,0 8.00585866,0 L17.9941413,0 C19.1029399,0 20,0.891856397 20,1.99201702 L20,9.00798298 C20,10.0998238 19.1019465,11 17.9941413,11 L17,11 L17,14 L14,11 Z M14,13 L14,15.007983 C14,16.1081436 13.1029399,17 11.9941413,17 L6,17 L3,20 L3,17 L2.00585866,17 C0.898053512,17 0,16.0998238 0,15.007983 L0,7.99201702 C0,6.8918564 0.897060126,6 2.00585866,6 L4,6 L4,8.99349548 C4,11.2060545 5.78916089,13 7.99620271,13 L14,13 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function CogIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M3.93830521,6.49683865 C3.63405147,7.02216933 3.39612833,7.5907092 3.23599205,8.19100199 L5.9747955e-16,9 L9.6487359e-16,11 L3.23599205,11.808998 C3.39612833,12.4092908 3.63405147,12.9778307 3.93830521,13.5031614 L2.22182541,16.363961 L3.63603897,17.7781746 L6.49683865,16.0616948 C7.02216933,16.3659485 7.5907092,16.6038717 8.19100199,16.7640079 L9,20 L11,20 L11.808998,16.7640079 C12.4092908,16.6038717 12.9778307,16.3659485 13.5031614,16.0616948 L16.363961,17.7781746 L17.7781746,16.363961 L16.0616948,13.5031614 C16.3659485,12.9778307 16.6038717,12.4092908 16.7640079,11.808998 L20,11 L20,9 L16.7640079,8.19100199 C16.6038717,7.5907092 16.3659485,7.02216933 16.0616948,6.49683865 L17.7781746,3.63603897 L16.363961,2.22182541 L13.5031614,3.93830521 C12.9778307,3.63405147 12.4092908,3.39612833 11.808998,3.23599205 L11,0 L9,0 L8.19100199,3.23599205 C7.5907092,3.39612833 7.02216933,3.63405147 6.49683865,3.93830521 L3.63603897,2.22182541 L2.22182541,3.63603897 L3.93830521,6.49683865 L3.93830521,6.49683865 Z M10,13 C11.6568542,13 13,11.6568542 13,10 C13,8.34314575 11.6568542,7 10,7 C8.34314575,7 7,8.34314575 7,10 C7,11.6568542 8.34314575,13 10,13 L10,13 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function FolderIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path>
    </BaseIcon>
  );
}

export function FlagIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <polygon
        id="Combined-Shape"
        points="7.66666667 12 2 12 2 20 0 20 0 0 1 0 12 0 12.3333333 2 20 2 17 8 20 14 8 14 7.66666667 12"
      ></polygon>
    </BaseIcon>
  );
}

export function FactoryIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M10.5,20 L5.5,20 L0,20 L0,7 L5,10.3333333 L5,7 L10,10.3333333 L10,7 L15,10.3333333 L15,0 L20,0 L20,20 L15.5,20 L10.5,20 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function LogoutIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 15 15">
      <path
        d="M13.5 7.5l-3 3.25m3-3.25l-3-3m3 3H4m4 6H1.5v-12H8"
        stroke="currentColor"
      ></path>
    </BaseIcon>
  );
}

export function LoadBalancerIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path d="M17 12h-6v4h1v4H8v-4h1v-4H3v4h1v4H0v-4h1v-4a2 2 0 0 1 2-2h6V6H7V0h6v6h-2v4h6a2 2 0 0 1 2 2v4h1v4h-4v-4h1v-4z"></path>
    </BaseIcon>
  );
}

export function LabelIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 15 15"
      aria-hidden="true"
      role="presentation"
      title="fontSize small"
    >
      <path
        d="M.5 7.5l-.354-.354a.5.5 0 000 .708L.5 7.5zm7 7l-.354.354a.5.5 0 00.708 0L7.5 14.5zm7-7l.354.354A.5.5 0 0015 7.5h-.5zm-7-7V0a.5.5 0 00-.354.146L7.5.5zM.146 7.854l7 7 .708-.708-7-7-.708.708zm7.708 7l7-7-.708-.708-7 7 .708.708zM15 7.5v-6h-1v6h1zM13.5 0h-6v1h6V0zM7.146.146l-7 7 .708.708 7-7-.708-.708zM15 1.5A1.5 1.5 0 0013.5 0v1a.5.5 0 01.5.5h1zM10.5 5a.5.5 0 01-.5-.5H9A1.5 1.5 0 0010.5 6V5zm.5-.5a.5.5 0 01-.5.5v1A1.5 1.5 0 0012 4.5h-1zm-.5-.5a.5.5 0 01.5.5h1A1.5 1.5 0 0010.5 3v1zm0-1A1.5 1.5 0 009 4.5h1a.5.5 0 01.5-.5V3z"
        fill="currentColor"
      ></path>
    </BaseIcon>
  );
}

/* export function MapIcon (props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M0,0 L6,4 L14,0 L20,4 L20,20 L14,16 L6,20 L0,16 L0,0 Z M7,6 L13,3 L13,14 L7,17 L7,6 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  )
} */

export function LocationIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M0,0 L6,4 L14,0 L20,4 L20,20 L14,16 L6,20 L0,16 L0,0 Z M7,6 L13,3 L13,14 L7,17 L7,6 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function NotificationsIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      &lt;
      <path
        d="M14,8 C14,5.790861 12.209139,4 10,4 C7.790861,4 6,5.790861 6,8 L6,15 L14,15 L14,8 Z M8.02739671,2.33180314 C5.68271203,3.14769073 4,5.37733614 4,8 L4,14 L1,16 L1,17 L19,17 L19,16 L16,14 L16,8 C16,5.37733614 14.317288,3.14769073 11.9726033,2.33180314 C11.9906226,2.22388264 12,2.11303643 12,2 C12,0.8954305 11.1045695,0 10,0 C8.8954305,0 8,0.8954305 8,2 C8,2.11303643 8.0093774,2.22388264 8.02739671,2.33180314 L8.02739671,2.33180314 Z M12,18 C12,19.1045695 11.1045695,20 10,20 C8.8954305,20 8,19.1045695 8,18 L12,18 L12,18 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function TagIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M0,10 L0,2 L2,0 L10,0 L20,10 L10,20 L0,10 Z M4.5,6 C5.32842712,6 6,5.32842712 6,4.5 C6,3.67157288 5.32842712,3 4.5,3 C3.67157288,3 3,3.67157288 3,4.5 C3,5.32842712 3.67157288,6 4.5,6 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function ThumbsUpIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M11.0010436,0 C9.89589787,0 9.00000024,0.886706352 9.0000002,1.99810135 L9,8 L1.9973917,8 C0.894262725,8 0,8.88772964 0,10 L0,12 L2.29663334,18.1243554 C2.68509206,19.1602453 3.90195042,20 5.00853025,20 L12.9914698,20 C14.1007504,20 15,19.1125667 15,18.000385 L15,10 L12,3 L12,0 L11.0010436,0 L11.0010436,0 Z M17,10 L20,10 L20,20 L17,20 L17,10 L17,10 Z"
        id="Fill-97"
      ></path>
    </BaseIcon>
  );
}

export function ThumbsDownIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M11.0010436,20 C9.89589787,20 9.00000024,19.1132936 9.0000002,18.0018986 L9,12 L1.9973917,12 C0.894262725,12 0,11.1122704 0,10 L0,8 L2.29663334,1.87564456 C2.68509206,0.839754676 3.90195042,8.52651283e-14 5.00853025,8.52651283e-14 L12.9914698,8.52651283e-14 C14.1007504,8.52651283e-14 15,0.88743329 15,1.99961498 L15,10 L12,17 L12,20 L11.0010436,20 L11.0010436,20 Z M17,10 L20,10 L20,0 L17,0 L17,10 L17,10 Z"
        id="Fill-97"
      ></path>
    </BaseIcon>
  );
}

export function TileIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M0,0 L9,0 L9,9 L0,9 L0,0 Z M2,2 L7,2 L7,7 L2,7 L2,2 Z M0,11 L9,11 L9,20 L0,20 L0,11 Z M2,13 L7,13 L7,18 L2,18 L2,13 Z M11,0 L20,0 L20,9 L11,9 L11,0 Z M13,2 L18,2 L18,7 L13,7 L13,2 Z M11,11 L20,11 L20,20 L11,20 L11,11 Z M13,13 L18,13 L18,18 L13,18 L13,13 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function TuningIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M17,16 L19,16 L19,13 L13,13 L13,16 L15,16 L15,20 L17,20 L17,16 Z M1,9 L7,9 L7,12 L1,12 L1,9 Z M7,5 L13,5 L13,8 L7,8 L7,5 Z M3,0 L5,0 L5,8 L3,8 L3,0 Z M15,0 L17,0 L17,12 L15,12 L15,0 Z M9,0 L11,0 L11,4 L9,4 L9,0 Z M3,12 L5,12 L5,20 L3,20 L3,12 Z M9,8 L11,8 L11,20 L9,20 L9,8 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function SwapIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 6a4 4 0 1 1 8 0v8h3l-4 4-4-4h3V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8a4 4 0 1 1-8 0V6H0l4-4 4 4H5v8a2 2 0 0 0 2 2 2 2 0 0 0 2-2V6z"></path>
    </BaseIcon>
  );
}

export function SendIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M0,0 L20,10 L0,20 L0,0 Z M0,8 L10,10 L0,12 L0,8 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function SaveDiskIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M0,1.99079514 C0,0.891309342 0.894513756,0 1.99406028,0 L16,0 L20,4 L20,18.0059397 C20,19.1072288 19.1017876,20 18.0092049,20 L1.99079514,20 C0.891309342,20 0,19.1017876 0,18.0092049 L0,1.99079514 Z M5,2 L15,2 L15,8 L5,8 L5,2 Z M11,3 L14,3 L14,7 L11,7 L11,3 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function UserIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M4.99999861,5.00218626 C4.99999861,2.23955507 7.24419318,0 9.99999722,0 C12.7614202,0 14.9999958,2.22898489 14.9999958,5.00218626 L14.9999958,6.99781374 C14.9999958,9.76044493 12.7558013,12 9.99999722,12 C7.23857424,12 4.99999861,9.77101511 4.99999861,6.99781374 L4.99999861,5.00218626 Z M1.11022272e-16,16.6756439 C2.94172855,14.9739441 6.3571245,14 9.99999722,14 C13.6428699,14 17.0582659,14.9739441 20,16.6756471 L19.9999944,20 L0,20 L1.11022272e-16,16.6756439 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function UserWalkIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M11,7 L12.4428885,9.16433275 C12.7547607,9.63214111 13.4519098,10 14.0093689,10 L17,10 L17,8 L14,8 L12.5571115,5.83566725 C12.2452393,5.36785889 11.625859,4.75057268 11.1643327,4.4428885 L9.83566725,3.5571115 C9.36785889,3.24523926 8.61517502,3.23089499 8.14046936,3.51571839 L4,6 L4,11 L6,11 L6,7 L8,6 L5,20 L7,20 L9.35294118,12.3529412 L11,14 L11,20 L13,20 L13,12 L10.2941176,9.29411765 L11,7 Z M12,4 C13.1045695,4 14,3.1045695 14,2 C14,0.8954305 13.1045695,0 12,0 C10.8954305,0 10,0.8954305 10,2 C10,3.1045695 10.8954305,4 12,4 L12,4 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function PlusIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
    </BaseIcon>
  );
}

export function DeleteForever(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path fill="none" d="M0 0h24v24H0V0z"></path>
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"></path>
    </BaseIcon>
  );
}

export function DeleteForeverRounded(_props) {
  return (
    <BaseIcon
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"></path>
    </BaseIcon>
  );
}

export function HomeIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M17,10 L20,10 L10,0 L0,10 L3,10 L3,20 L17,20 L17,10 Z M8,14 L12,14 L12,20 L8,20 L8,14 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function BuildingIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
        clipRule="evenodd"
      />
    </BaseIcon>
  );
}

export function CheckmarkIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <polygon id="Path-126" points="0 11 2 9 7 14 18 3 20 5 7 18"></polygon>
    </BaseIcon>
  );
}

export function PictureInPicture(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 22 23">
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z" />
    </BaseIcon>
  );
}

export function PinIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M3,-1.41345269e-14 L17,-1.41345269e-14 L17,1 L14,2 L14,10 L17,11 L17,12 L3,12 L3,11 L6,10 L6,2 L3,1 L3,-1.41345269e-14 L3,-1.41345269e-14 Z M9,12 L11,12 L11,19 L10,20 L9,19 L9,12 L9,12 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function EnvelopeIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M14.8780488,10.097561 L20,14 L20,16 L13.627451,11.0980392 L10,14 L6.37254902,11.0980392 L0,16 L0,14 L5.12195122,10.097561 L0,6 L0,4 L10,12 L20,4 L20,6 L14.8780488,10.097561 Z M18.0092049,2 C19.1086907,2 20,2.89451376 20,3.99406028 L20,16.0059397 C20,17.1072288 19.1017876,18 18.0092049,18 L1.99079514,18 C0.891309342,18 0,17.1054862 0,16.0059397 L0,3.99406028 C0,2.8927712 0.898212381,2 1.99079514,2 L18.0092049,2 Z"
        id="Combined-Shape"
      ></path>
    </BaseIcon>
  );
}

export function SaveIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 22 22">
      <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"></path>
    </BaseIcon>
  );
}

export function DeleteIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
        clipRule="evenodd"
      ></path>
    </BaseIcon>
  );
}

export function EditIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
    </BaseIcon>
  );
}

export function CheckIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
    </BaseIcon>
  );
}

export function FilterFramesIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z"></path>
    </BaseIcon>
  );
}

export function ClearAll(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z"></path>
    </BaseIcon>
  );
}

export function VisibilityRounded(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path fill="none" d="M0 0h24v24H0V0z"></path>
      <path d="M12 4C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
    </BaseIcon>
  );
}

export function EmailIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
    </BaseIcon>
  );
}

export function Pause(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
    </BaseIcon>
  );
}

export function TourIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M20 4h-4l-4-4-4 4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H4V6h4.52l3.52-3.5L15.52 6H20v14zM18 8H6v10h12"></path>
    </BaseIcon>
  );
}

export function MessageIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"></path>
    </BaseIcon>
  );
}

export function DeleteOutlineRounded(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path fill="none" d="M0 0h24v24H0V0z"></path>
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v10zM9 9h6c.55 0 1 .45 1 1v8c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1v-8c0-.55.45-1 1-1zm6.5-5l-.71-.71c-.18-.18-.44-.29-.7-.29H9.91c-.26 0-.52.11-.7.29L8.5 4H6c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1h-2.5z"></path>
    </BaseIcon>
  );
}

export function CheckCircleIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </BaseIcon>
  );
}

export function ArchiveIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      viewBox="0 0 24 24"
      width="18px"
      height="18px"
    >
      <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z" />
      <path d="M0 0h24v24H0z" fill="none" />
    </BaseIcon>
  );
}

export function BlockIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      height="24"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z" />
    </BaseIcon>
  );
}

export function UnsubscribeIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      height="24"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M18.5 13c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zm2 4h-4v-1h4v1zm-6.95 0c-.02-.17-.05-.33-.05-.5 0-2.76 2.24-5 5-5 .92 0 1.76.26 2.5.69V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h8.55zM12 10.5L5 7V5l7 3.5L19 5v2l-7 3.5z" />
    </BaseIcon>
  );
}

export function SendkkkIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path fill="none" d="M0 0h24v24H0V0z"></path>
      <path d="M3.4 20.4l17.45-7.48c.81-.35.81-1.49 0-1.84L3.4 3.6c-.66-.29-1.39.2-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z"></path>
    </BaseIcon>
  );
}

export function CheckCircle(props) {
  return (
    <BaseIcon
      {...props}
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
    </BaseIcon>
  );
}

export function DragHandle(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </BaseIcon>
  );
}

export function CopyContentIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
    </BaseIcon>
  );
}

export function AddIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
        clipRule="evenodd"
      ></path>
    </BaseIcon>
  );
}

export function SeachIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </BaseIcon>
  );
}

export function CloseIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
    </BaseIcon>
  );
}

export function Call(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      tabindex="-1"
      title="Call"
    >
      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"></path>
    </BaseIcon>
  );
}

export function CallEnd(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      tabindex="-1"
      title="CallEnd"
    >
      <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"></path>
    </BaseIcon>
  );
}

export function MicIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      tabindex="-1"
      title="Mic"
    >
      <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"></path>
    </BaseIcon>
  );
}

export function MicOffIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      tabindex="-1"
      title="MicOff"
    >
      <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"></path>
    </BaseIcon>
  );
}

export function CameraIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      tabindex="-1"
      title="Videocam"
    >
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"></path>
    </BaseIcon>
  );
}

export function CameraOffIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      tabindex="-1"
      title="Videocam"
    >
      <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"></path>
    </BaseIcon>
  );
}

export function FullScreenIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      tabindex="-1"
      title="Fullscreen"
    >
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path>
    </BaseIcon>
  );
}

export function FullScreenExitIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      tabindex="-1"
      title="FullscreenExit"
    >
      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path>
    </BaseIcon>
  );
}

export function ScreenShareIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      tabindex="-1"
      title="ScreenShare"
    >
      <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zm-7-3.53v-2.19c-2.78 0-4.61.85-6 2.72.56-2.67 2.11-5.33 6-5.87V7l4 3.73-4 3.74z"></path>
    </BaseIcon>
  );
}

export function ScreenShareExitIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      tabindex="-1"
      title="ScreenShare"
    >
      <path d="M21.22 18.02l2 2H24v-2h-2.78zm.77-2l.01-10c0-1.11-.9-2-2-2H7.22l5.23 5.23c.18-.04.36-.07.55-.1V7.02l4 3.73-1.58 1.47 5.54 5.54c.61-.33 1.03-.99 1.03-1.74zM2.39 1.73L1.11 3l1.54 1.54c-.4.36-.65.89-.65 1.48v10c0 1.1.89 2 2 2H0v2h18.13l2.71 2.71 1.27-1.27L2.39 1.73zM7 15.02c.31-1.48.92-2.95 2.07-4.06l1.59 1.59c-1.54.38-2.7 1.18-3.66 2.47z"></path>
    </BaseIcon>
  );
}

export function MoreIcon(props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
    </BaseIcon>
  );
}

export function CardIcon(props) {
  return (
    <BaseIcon {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
    </BaseIcon>
  );
}

export function AttachmentIcon(_props) {
  return (
    <BaseIcon
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"></path>
    </BaseIcon>
  );
}

export function WebhooksIcon(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      width="1em"
      height="1em"
      ariaHidden="true"
      transform="rotate(360)"
      viewBox="0 0 24 24"
    >
      <path d="M10.46 19C9 21.07 6.15 21.59 4.09 20.15c-2.05-1.44-2.53-4.31-1.09-6.4a4.585 4.585 0 013.58-1.98l.05 1.43c-.91.07-1.79.54-2.36 1.36-1 1.44-.69 3.38.68 4.35 1.38.96 3.31.59 4.31-.84.31-.45.49-.94.56-1.44v-1.01l5.58-.04.07-.11c.53-.92 1.68-1.24 2.58-.72a1.9 1.9 0 01.68 2.6c-.53.91-1.69 1.23-2.59.71-.41-.23-.7-.6-.83-1.02l-4.07.02a4.96 4.96 0 01-.78 1.94m7.28-7.14c2.53.31 4.33 2.58 4.02 5.07-.31 2.5-2.61 4.27-5.14 3.96a4.629 4.629 0 01-3.43-2.21l1.24-.72a3.22 3.22 0 002.32 1.45c1.75.21 3.3-.98 3.51-2.65.21-1.67-1.03-3.2-2.76-3.41-.54-.06-1.06.01-1.53.18l-.85.44-2.58-4.77h-.22a1.906 1.906 0 01-1.85-1.95c.03-1.04.93-1.85 1.98-1.81 1.05.06 1.88.91 1.85 1.95-.02.44-.19.84-.46 1.15l1.9 3.51c.62-.2 1.3-.27 2-.19M8.25 9.14c-1-2.35.06-5.04 2.37-6.02 2.32-.98 5 .13 6 2.48.59 1.37.47 2.87-.2 4.07l-1.24-.72c.42-.81.49-1.8.09-2.73-.68-1.6-2.49-2.37-4.04-1.72-1.56.66-2.26 2.5-1.58 4.1.28.66.75 1.17 1.32 1.51l.39.21-3.07 4.99c.03.05.07.11.1.19.49.91.15 2.06-.77 2.55-.91.49-2.06.13-2.56-.81-.49-.93-.15-2.08.77-2.57.39-.21.82-.26 1.23-.17l2.31-3.77c-.47-.43-.87-.97-1.12-1.59z"></path>
    </BaseIcon>
  );
}

export function IntegrationsIconDisabled(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M13 13v8h8v-8h-8zM3 21h8v-8H3v8zM3 3v8h8V3H3zm13.66-1.31L11 7.34 16.66 13l5.66-5.66-5.66-5.65z"></path>
    </BaseIcon>
  );
}

export function TeamIconNO(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M11.99 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm3.61 6.34c1.07 0 1.93.86 1.93 1.93 0 1.07-.86 1.93-1.93 1.93-1.07 0-1.93-.86-1.93-1.93-.01-1.07.86-1.93 1.93-1.93zm-6-1.58c1.3 0 2.36 1.06 2.36 2.36 0 1.3-1.06 2.36-2.36 2.36s-2.36-1.06-2.36-2.36c0-1.31 1.05-2.36 2.36-2.36zm0 9.13v3.75c-2.4-.75-4.3-2.6-5.14-4.96 1.05-1.12 3.67-1.69 5.14-1.69.53 0 1.2.08 1.9.22-1.64.87-1.9 2.02-1.9 2.68zM11.99 20c-.27 0-.53-.01-.79-.04v-4.07c0-1.42 2.94-2.13 4.4-2.13 1.07 0 2.92.39 3.84 1.15-1.17 2.97-4.06 5.09-7.45 5.09z"></path>
    </BaseIcon>
  );
}

export function SettingsIconNO(props) {
  return (
    <BaseIcon
      {...props}
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <path transform="scale(1.2, 1.2)" fill="none" d="M0 0h20v20H0V0z"></path>
      <path
        transform="scale(1.2, 1.2)"
        d="M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"
      ></path>
    </BaseIcon>
  );
}

// teensy icons:

export function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
    >
      <path
        d="M.5 3.498L7.5.5l7 2.998m-14 0l7 2.998m-7-2.998V3.5m14-.002l-7 2.998m7-2.998V11.5l-7 3m7-11.002L7.5 6.5v8m0-8.004V14.5m0-8.004L.5 3.5m7 11l-7-3v-8"
        stroke="currentColor"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
}
export function PlatformIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
    >
      <path
        d="M5.5 11.5H5v.5h.5v-.5zm5 0v.5h.5v-.5h-.5zm-4.5 0V11H5v.5h1zm4-.5v.5h1V11h-1zm.5 0h-5v1h5v-1zM8 9a2 2 0 012 2h1a3 3 0 00-3-3v1zm-2 2a2 2 0 012-2V8a3 3 0 00-3 3h1zm2-8a2 2 0 00-2 2h1a1 1 0 011-1V3zm2 2a2 2 0 00-2-2v1a1 1 0 011 1h1zM8 7a2 2 0 002-2H9a1 1 0 01-1 1v1zm0-1a1 1 0 01-1-1H6a2 2 0 002 2V6zM3.5 1h9V0h-9v1zm9.5.5v12h1v-12h-1zM12.5 14h-9v1h9v-1zM3 13.5v-12H2v12h1zm.5.5a.5.5 0 01-.5-.5H2A1.5 1.5 0 003.5 15v-1zm9.5-.5a.5.5 0 01-.5.5v1a1.5 1.5 0 001.5-1.5h-1zM12.5 1a.5.5 0 01.5.5h1A1.5 1.5 0 0012.5 0v1zm-9-1A1.5 1.5 0 002 1.5h1a.5.5 0 01.5-.5V0zM4 4H1v1h3V4zm0 6H1v1h3v-1z"
        fill="currentColor"
      ></path>
    </svg>
  );
}
export function ChatIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
    >
      <path
        d="M11.5 13.5l.157-.475-.218-.072-.197.119.258.428zm2-2l-.421-.27-.129.202.076.226.474-.158zm1 2.99l-.157.476a.5.5 0 00.631-.634l-.474.159zm-3.258-1.418c-.956.575-2.485.919-3.742.919v1c1.385 0 3.106-.37 4.258-1.063l-.516-.856zM7.5 13.99c-3.59 0-6.5-2.909-6.5-6.496H0a7.498 7.498 0 007.5 7.496v-1zM1 7.495A6.498 6.498 0 017.5 1V0A7.498 7.498 0 000 7.495h1zM7.5 1C11.09 1 14 3.908 14 7.495h1A7.498 7.498 0 007.5 0v1zM14 7.495c0 1.331-.296 2.758-.921 3.735l.842.54C14.686 10.575 15 8.937 15 7.495h-1zm-2.657 6.48l3 .99.314-.949-3-.99-.314.949zm3.631.357l-1-2.99-.948.316 1 2.991.948-.317z"
        fill="currentColor"
      ></path>
    </svg>
  );
}
export function ConversationChatIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
    >
      <path
        d="M3.5 11.493H4v-.5h-.5v.5zm0 2.998H3a.5.5 0 00.8.4l-.3-.4zm4-2.998v-.5h-.167l-.133.1.3.4zm-3-7.496H4v1h.5v-1zm6 1h.5v-1h-.5v1zm-6 1.998H4v1h.5v-1zm4 1H9v-1h-.5v1zM3 11.493v2.998h1v-2.998H3zm.8 3.398l4-2.998-.6-.8-4 2.998.6.8zm3.7-2.898h6v-1h-6v1zm6 0c.829 0 1.5-.67 1.5-1.5h-1c0 .277-.223.5-.5.5v1zm1.5-1.5V1.5h-1v8.994h1zM15 1.5c0-.83-.671-1.5-1.5-1.5v1c.277 0 .5.223.5.5h1zM13.5 0h-12v1h12V0zm-12 0C.671 0 0 .67 0 1.5h1c0-.277.223-.5.5-.5V0zM0 1.5v8.993h1V1.5H0zm0 8.993c0 .83.671 1.5 1.5 1.5v-1a.499.499 0 01-.5-.5H0zm1.5 1.5h2v-1h-2v1zm3-6.996h6v-1h-6v1zm0 2.998h4v-1h-4v1z"
        fill="currentColor"
      ></path>
    </svg>
  );
}
export function AssignmentIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
    >
      <path
        d="M2.5 1.5a1 1 0 11-2 0 1 1 0 012 0zm0 0h2a3 3 0 013 3v6a3 3 0 003 3h2m0 0a1 1 0 102 0 1 1 0 00-2 0z"
        stroke="currentColor"
      ></path>
    </svg>
  );
}
export function CampaignsIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
    >
      <path
        d="M14.5.5l.457.203A.5.5 0 0014.5 0v.5zM.5.5V0a.5.5 0 00-.5.5h.5zm14 9v.5a.5.5 0 00.457-.703L14.5 9.5zm-2-4.5l-.457-.203a.5.5 0 000 .406L12.5 5zm2-5H.5v1h14V0zM0 .5v9h1v-9H0zM.5 10h14V9H.5v1zm14.457-.703l-2-4.5-.914.406 2 4.5.914-.406zm-2-4.094l2-4.5-.914-.406-2 4.5.914.406zM1 15V9.5H0V15h1z"
        fill="currentColor"
      ></path>
    </svg>
  );
}
export function MailingIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
    >
      <path
        d="M.5 4.5l7 4 7-4m-13-3h12a1 1 0 011 1v10a1 1 0 01-1 1h-12a1 1 0 01-1-1v-10a1 1 0 011-1z"
        stroke="currentColor"
      ></path>
    </svg>
  );
}
export function AutoMessages() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
    >
      <path
        d="M7.713 11.493l-.035-.5.035.5zM1.5 1h12V0h-12v1zm12.5.5v12h1v-12h-1zM13.5 14h-12v1h12v-1zM1 13.5v-12H0v12h1zm.5.5a.5.5 0 01-.5-.5H0A1.5 1.5 0 001.5 15v-1zm12.5-.5a.5.5 0 01-.5.5v1a1.5 1.5 0 001.5-1.5h-1zM13.5 1a.5.5 0 01.5.5h1A1.5 1.5 0 0013.5 0v1zm-12-1A1.5 1.5 0 000 1.5h1a.5.5 0 01.5-.5V0zm6 12c.083 0 .166-.003.248-.009l-.07-.997A2.546 2.546 0 017.5 11v1zm-.823-.098c.264.064.54.098.823.098v-1c-.203 0-.4-.024-.589-.07l-.234.973zm.234-.972c-.969-.233-1.9-.895-2.97-1.586C2.924 8.687 1.771 8 .5 8v1c.938 0 1.858.512 2.899 1.184.987.638 2.099 1.434 3.278 1.719l.234-.973zm.837 1.061c1.386-.097 2.7-.927 3.865-1.632C12.843 9.616 13.922 9 15 9V8c-1.407 0-2.732.794-3.905 1.503-1.237.749-2.324 1.414-3.417 1.49l.07.998z"
        fill="currentColor"
      ></path>
    </svg>
  );
}
export function BannersIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
    >
      <path
        d="M4.5 6.5V6a.5.5 0 00-.5.5h.5zm10 0h.5a.5.5 0 00-.5-.5v.5zm0 6v.5a.5.5 0 00.5-.5h-.5zm-10 0H4a.5.5 0 00.5.5v-.5zM1 1v14h1V1H1zM0 4h15V3H0v1zm4.5 3h10V6h-10v1zm9.5-.5v6h1v-6h-1zm.5 5.5h-10v1h10v-1zm-9.5.5v-6H4v6h1zm1-9v3h1v-3H6zm6 0v3h1v-3h-1z"
        fill="currentColor"
      ></path>
    </svg>
  );
}
export function ToursIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
    >
      <path
        d="M5.5 11.493l.416-.278a.5.5 0 00-.416-.222v.5zm2 2.998l-.416.277a.5.5 0 00.832 0l-.416-.277zm2-2.998v-.5a.5.5 0 00-.416.222l.416.278zM7 8l-.354.354.378.377.352-.402L7 8zm-1.916 3.77l2 2.998.832-.555-2-2.998-.832.555zm2.832 2.998l2-2.998-.832-.555-2 2.998.832.555zM9.5 11.993h4v-1h-4v1zm4 0c.829 0 1.5-.67 1.5-1.5h-1c0 .277-.223.5-.5.5v1zm1.5-1.5V1.5h-1v8.994h1zM15 1.5c0-.83-.671-1.5-1.5-1.5v1c.277 0 .5.223.5.5h1zM13.5 0h-12v1h12V0zm-12 0C.671 0 0 .67 0 1.5h1c0-.277.223-.5.5-.5V0zM0 1.5v8.993h1V1.5H0zm0 8.993c0 .83.671 1.5 1.5 1.5v-1a.499.499 0 01-.5-.5H0zm1.5 1.5h4v-1h-4v1zm3.146-5.64l2 2 .708-.707-2-2-.708.708zm2.73 1.976l3.5-4-.752-.658-3.5 4 .752.658z"
        fill="currentColor"
      ></path>
    </svg>
  );
}
export function BotIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
    >
      <path
        d="M7.5 2.5a5 5 0 015 5v6a1 1 0 01-1 1h-8a1 1 0 01-1-1v-6a5 5 0 015-5zm0 0V0M4 11.5h7M.5 8v4m14-4v4m-9-2.5a1 1 0 110-2 1 1 0 010 2zm4 0a1 1 0 110-2 1 1 0 010 2z"
        stroke="currentColor"
      ></path>
    </svg>
  );
}
export function OutboundIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
    >
      <path
        d="M13.5 7.5l-3 3.25m3-3.25l-3-3m3 3H4m4 6H1.5v-12H8"
        stroke="currentColor"
      ></path>
    </svg>
  );
}
export function NewconversationIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
    >
      <path
        d="M10.5 7.5l-3 3.25m3-3.25l-3-3m3 3H1m6-6h6.5v12H7"
        stroke="currentColor"
      ></path>
    </svg>
  );
}
export function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
    >
      <path
        clipRule="evenodd"
        d="M5.944.5l-.086.437-.329 1.598a5.52 5.52 0 00-1.434.823L2.487 2.82l-.432-.133-.224.385L.724 4.923.5 5.31l.328.287 1.244 1.058c-.045.277-.103.55-.103.841 0 .291.058.565.103.842L.828 9.395.5 9.682l.224.386 1.107 1.85.224.387.432-.135 1.608-.537c.431.338.908.622 1.434.823l.329 1.598.086.437h3.111l.087-.437.328-1.598a5.524 5.524 0 001.434-.823l1.608.537.432.135.225-.386 1.106-1.851.225-.386-.329-.287-1.244-1.058c.046-.277.103-.55.103-.842 0-.29-.057-.564-.103-.841l1.244-1.058.329-.287-.225-.386-1.106-1.85-.225-.386-.432.134-1.608.537a5.52 5.52 0 00-1.434-.823L9.142.937 9.055.5H5.944z"
        stroke="currentColor"
        strokeLinecap="square"
        strokeLinejoin="round"
      ></path>
      <path
        clipRule="evenodd"
        d="M9.5 7.495a2 2 0 01-4 0 2 2 0 014 0z"
        stroke="currentColor"
        strokeLinecap="square"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
}
export function HelpCenterIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
    >
      <path
        d="M1.5.5V0a.5.5 0 00-.5.5h.5zm0 13H1a.5.5 0 00.5.5v-.5zM4 0v15h1V0H4zM1.5 1h10V0h-10v1zM13 2.5v9h1v-9h-1zM11.5 13h-10v1h10v-1zm-9.5.5V.5H1v13h1zm11-2a1.5 1.5 0 01-1.5 1.5v1a2.5 2.5 0 002.5-2.5h-1zM11.5 1A1.5 1.5 0 0113 2.5h1A2.5 2.5 0 0011.5 0v1zM7 5h4V4H7v1z"
        fill="currentColor"
      ></path>
    </svg>
  );
}
export function ArticlesIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
    >
      <path
        d="M10.5 14.5H10a.5.5 0 00.854.354L10.5 14.5zm0-4V10a.5.5 0 00-.5.5h.5zm4 0l.354.354A.5.5 0 0014.5 10v.5zM1.5 1h12V0h-12v1zM1 13.5v-12H0v12h1zm13-12v8.586h1V1.5h-1zM10.086 14H1.5v1h8.586v-1zm3.768-3.56l-3.415 3.414.707.707 3.415-3.415-.707-.707zM10.086 15a1.5 1.5 0 001.06-.44l-.707-.706a.5.5 0 01-.353.146v1zM14 10.086a.5.5 0 01-.146.353l.707.707a1.5 1.5 0 00.439-1.06h-1zM0 13.5A1.5 1.5 0 001.5 15v-1a.5.5 0 01-.5-.5H0zM13.5 1a.5.5 0 01.5.5h1A1.5 1.5 0 0013.5 0v1zm-12-1A1.5 1.5 0 000 1.5h1a.5.5 0 01.5-.5V0zM11 14.5v-4h-1v4h1zm-.5-3.5h4v-1h-4v1zm3.646-.854l-4 4 .708.708 4-4-.708-.708zM3 4h9V3H3v1z"
        fill="currentColor"
      ></path>
    </svg>
  );
}
export function CollectionsIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
    >
      <path
        d="M5 8.5h5M.5.5h14v4H.5v-4zm1 4v9a1 1 0 001 1h10a1 1 0 001-1v-9h-12z"
        stroke="currentColor"
      ></path>
    </svg>
  );
}
export function SettingsIconArticle() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
    >
      <path
        clipRule="evenodd"
        d="M5.944.5l-.086.437-.329 1.598a5.52 5.52 0 00-1.434.823L2.487 2.82l-.432-.133-.224.385L.724 4.923.5 5.31l.328.287 1.244 1.058c-.045.277-.103.55-.103.841 0 .291.058.565.103.842L.828 9.395.5 9.682l.224.386 1.107 1.85.224.387.432-.135 1.608-.537c.431.338.908.622 1.434.823l.329 1.598.086.437h3.111l.087-.437.328-1.598a5.524 5.524 0 001.434-.823l1.608.537.432.135.225-.386 1.106-1.851.225-.386-.329-.287-1.244-1.058c.046-.277.103-.55.103-.842 0-.29-.057-.564-.103-.841l1.244-1.058.329-.287-.225-.386-1.106-1.85-.225-.386-.432.134-1.608.537a5.52 5.52 0 00-1.434-.823L9.142.937 9.055.5H5.944z"
        stroke="currentColor"
        strokeLinecap="square"
        strokeLinejoin="round"
      ></path>
      <path
        clipRule="evenodd"
        d="M9.5 7.495a2 2 0 01-4 0 2 2 0 014 0z"
        stroke="currentColor"
        strokeLinecap="square"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
}
export function BillingIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
    >
      <path
        d="M.5 5.5h14M2 9.5h6m2 0h3M.5 3.5v8a1 1 0 001 1h12a1 1 0 001-1v-8a1 1 0 00-1-1h-12a1 1 0 00-1 1z"
        stroke="currentColor"
      ></path>
    </svg>
  );
}
export function IntegrationsIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
    >
      <path
        d="M7.5 1.5l.197-.46a.5.5 0 00-.394 0l.197.46zm-7 3l-.197-.46a.5.5 0 000 .92L.5 4.5zm7 3l-.197.46a.5.5 0 00.394 0L7.5 7.5zm7-3l.197.46a.5.5 0 000-.92l-.197.46zm-7 6l-.197.46.197.084.197-.084-.197-.46zm0 3l-.197.46.197.084.197-.084-.197-.46zM7.303 1.04l-7 3 .394.92 7-3-.394-.92zm-7 3.92l7 3 .394-.92-7-3-.394.92zm7.394 3l7-3-.394-.92-7 3 .394.92zm7-3.92l-7-3-.394.92 7 3 .394-.92zM.303 7.96l7 3 .394-.92-7-3-.394.92zm7.394 3l7-3-.394-.92-7 3 .394.92zm-7.394 0l7 3 .394-.92-7-3-.394.92zm7.394 3l7-3-.394-.92-7 3 .394.92z"
        fill="currentColor"
      ></path>
    </svg>
  );
}
export function TeamIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
    >
      <path
        d="M10.5 14.49v.5h.5v-.5h-.5zm-10 0H0v.5h.5v-.5zm14 .01v.5h.5v-.5h-.5zM8 3.498a2.499 2.499 0 01-2.5 2.498v1C7.433 6.996 9 5.43 9 3.498H8zM5.5 5.996A2.499 2.499 0 013 3.498H2a3.499 3.499 0 003.5 3.498v-1zM3 3.498A2.499 2.499 0 015.5 1V0A3.499 3.499 0 002 3.498h1zM5.5 1A2.5 2.5 0 018 3.498h1A3.499 3.499 0 005.5 0v1zm5 12.99H.5v1h10v-1zm-9.5.5v-1.996H0v1.996h1zm2.5-4.496h4v-1h-4v1zm6.5 2.5v1.996h1v-1.997h-1zm-2.5-2.5a2.5 2.5 0 012.5 2.5h1a3.5 3.5 0 00-3.5-3.5v1zm-6.5 2.5a2.5 2.5 0 012.5-2.5v-1a3.5 3.5 0 00-3.5 3.5h1zM14 13v1.5h1V13h-1zm.5 1H12v1h2.5v-1zM12 11a2 2 0 012 2h1a3 3 0 00-3-3v1zm-.5-3A1.5 1.5 0 0110 6.5H9A2.5 2.5 0 0011.5 9V8zM13 6.5A1.5 1.5 0 0111.5 8v1A2.5 2.5 0 0014 6.5h-1zM11.5 5A1.5 1.5 0 0113 6.5h1A2.5 2.5 0 0011.5 4v1zm0-1A2.5 2.5 0 009 6.5h1A1.5 1.5 0 0111.5 5V4z"
        fill="currentColor"
      ></path>
    </svg>
  );
}
export function MessengerIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
    >
      <path
        d="M5.5 11.493l.416-.278a.5.5 0 00-.416-.222v.5zm2 2.998l-.416.277a.5.5 0 00.832 0l-.416-.277zm2-2.998v-.5a.5.5 0 00-.416.222l.416.278zm-4.416.277l2 2.998.832-.555-2-2.998-.832.555zm2.832 2.998l2-2.998-.832-.555-2 2.998.832.555zM9.5 11.993h4v-1h-4v1zm4 0c.829 0 1.5-.67 1.5-1.5h-1c0 .277-.223.5-.5.5v1zm1.5-1.5V1.5h-1v8.994h1zM15 1.5c0-.83-.671-1.5-1.5-1.5v1c.277 0 .5.223.5.5h1zM13.5 0h-12v1h12V0zm-12 0C.671 0 0 .67 0 1.5h1c0-.277.223-.5.5-.5V0zM0 1.5v8.993h1V1.5H0zm0 8.993c0 .83.671 1.5 1.5 1.5v-1a.499.499 0 01-.5-.5H0zm1.5 1.5h4v-1h-4v1zM7 7h1V6H7v1zM4 7h1V6H4v1zm6 0h1V6h-1v1z"
        fill="currentColor"
      ></path>
    </svg>
  );
}
export function AppSettingsIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
    >
      <path
        d="M7.5 12.5V15m5-15v2.5M2.5 0v6.5m0 2V15m5-4.5V0m5 4.5V15m-2-10.5h4v-2h-4v2zm-5 8h4v-2h-4v2zm-5-4h4v-2h-4v2z"
        stroke="currentColor"
      ></path>
    </svg>
  );
}

export function LightModeIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
    >
      <path
        d="M7.5 1.5v-1m0 13.99v-.998m6-5.997h1m-13 0h-1m2-4.996l-1-1m12 0l-1 1m-10 9.993l-1 1m12 0l-1-1m-2-4.997a2.999 2.999 0 01-3 2.998 2.999 2.999 0 113-2.998z"
        stroke="currentColor"
        strokeLinecap="square"
      ></path>
    </svg>
  );
}

export function DarkModeIcon() {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
    >
      <path
        d="M1.66 11.362A6.5 6.5 0 007.693.502a7 7 0 11-6.031 10.86z"
        stroke="currentColor"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
}

export default {
  WidgetsIcon,
  ApiIcon,
  MapIcon,
  ColumnsIcon,
  LeftArrow,
  UpArrow,
  DownArrow,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  LaunchIcon,
  LangGlobeIcon,
  BookMarkIcon,
  DockerIcon,
  PaintIcon,
  QueueIcon,
  GestureIcon,
  MessageBubbleIcon,
  ShuffleIcon,
  ConversationIcon,
  CogIcon,
  FolderIcon,
  FlagIcon,
  FactoryIcon,
  LoadBalancerIcon,
  LabelIcon,
  LocationIcon,
  NotificationsIcon,
  TagIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  TileIcon,
  TuningIcon,
  SwapIcon,
  SendIcon,
  SaveDiskIcon,
  UserIcon,
  UserWalkIcon,
  PlusIcon,
  DeleteForever,
  DeleteForeverRounded,
  HomeIcon,
  BuildingIcon,
  CheckmarkIcon,
  PictureInPicture,
  PinIcon,
  EnvelopeIcon,
  SaveIcon,
  DeleteIcon,
  EditIcon,
  CheckIcon,
  FilterFramesIcon,
  ClearAll,
  VisibilityRounded,
  EmailIcon,
  Pause,
  TourIcon,
  MessageIcon,
  DeleteOutlineRounded,
  CheckCircleIcon,
  ArchiveIcon,
  BlockIcon,
  UnsubscribeIcon,
  SendkkkIcon,
  CheckCircle,
  DragHandle,
  CopyContentIcon,
  AddIcon,
  SeachIcon,
  CloseIcon,
  Call,
  CallEnd,
  MicIcon,
  MicOffIcon,
  CameraIcon,
  CameraOffIcon,
  FullScreenIcon,
  FullScreenExitIcon,
  ScreenShareIcon,
  ScreenShareExitIcon,
  MoreIcon,
  CardIcon,
  AttachmentIcon,
  WebhooksIcon,
  IntegrationsIconDisabled,
  TeamIconNO,
  SettingsIconNO,
  DashboardIcon,
  PlatformIcon,
  ChatIcon,
  ConversationChatIcon,
  AssignmentIcon,
  CampaignsIcon,
  MailingIcon,
  AutoMessages,
  BannersIcon,
  ToursIcon,
  BotIcon,
  OutboundIcon,
  NewconversationIcon,
  SettingsIcon,
  HelpCenterIcon,
  ArticlesIcon,
  CollectionsIcon,
  SettingsIconArticle,
  BillingIcon,
  IntegrationsIcon,
  TeamIcon,
  MessengerIcon,
  AppSettingsIcon,
  LightModeIcon,
  DarkModeIcon,
};
