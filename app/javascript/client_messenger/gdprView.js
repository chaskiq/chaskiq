import React from 'react'
import styled from '@emotion/styled'

import tw from 'twin.macro'

export const Wrapper = styled.div`
	top: 0px;
	z-index: 999999;
	position: fixed;
	width: 100%;
	height: 100vh;
	background: white;
	//font-size: .92em;
	//line-height: 1.5em;
	//color: #eee;
`

export const Padder = tw.div`px-4 py-5 sm:p-6 overflow-auto h-full`
export const Title = tw.div`text-lg leading-6 font-medium text-gray-900`
export const TextContent = tw.div`space-y-4 mt-2 max-w-xl text-sm text-gray-800`
export const ButtonWrapped = tw.div`my-3 text-sm flex justify-between items-center`
export const Link = tw.a`font-medium text-gray-600 hover:text-gray-500`
export const Button = tw.button`inline-flex items-center justify-center px-4 
py-2 border border-transparent font-medium rounded-md text-green-700 bg-green-100 
hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
focus:ring-green-500 sm:text-sm`

export const ButtonCancel = tw.button`inline-flex items-center justify-center px-4 
py-2 border border-transparent font-medium rounded-md text-gray-700 bg-gray-100 
hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
focus:ring-gray-500 sm:text-sm`

export default function View ({ confirm, cancel, t, app }) {
  return (
    <Wrapper>

      <Padder>
        <Title>
					{t('gdpr_title')}
        </Title>
        <TextContent dangerouslySetInnerHTML={
          { __html: t('gdpr', { name: app.name }) }
        }>

        </TextContent>

        <ButtonWrapped>

          <Button onClick={confirm}>
        		{t('gdpr_ok')}
          </Button>

          <ButtonCancel onClick={cancel}>
            {t('gdpr_nok')}
          </ButtonCancel>

        </ButtonWrapped>

        {/*<Link href="#">
					View our privacy police here <span aria-hidden="true">&rarr;</span>
        </Link>*/}
      </Padder>

    </Wrapper>
  )
}
