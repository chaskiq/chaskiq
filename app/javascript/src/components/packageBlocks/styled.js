import styled from '@emotion/styled'
import tw from 'twin.macro'
import { keyframes } from '@emotion/core'
import React from 'react'

const spin = keyframes`
  100% { 
    transform: rotate(360deg); 
  } 
`

export const LoaderWrapper = styled.div`
  ${() => tw`flex justify-center items-center`}
`

export const Loader = styled.div`
  animation: ${spin} 0.5s infinite linear;
  border-top-color: white !important;
  
  ${() => tw`
    ease-linear rounded-full border-2 
    border-t-2 border-gray-900 h-4 w-4
    mx-auto
    my-2
  `}
`

export function Progress ({ _size }) {
  return (
    <LoaderWrapper>
      <Loader/>
    </LoaderWrapper>
  )
}
