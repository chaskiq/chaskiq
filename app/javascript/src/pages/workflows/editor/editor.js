import React, { useState } from 'react'

import EmailEditor from './email'
import BannerEditor from './banner'
import PostEditor from './post'
import TourEditor from './tour'
import BotEditor from './bot'
import RuleEditor from './rule'

export default function Renderer ({ data, update }) {
  function handleRender () {
    switch (data.type) {
      case 'rules':
        return <RuleEditor update={update} data={data}/>
      case 'chat':
        return <ChatEditor update={update} data={data}/>
      case 'post':
        return <PostEditor update={update} data={data}/>
      case 'email':
        return <EmailEditor update={update} data={data}/>
      case 'bot':
        return <BotEditor update={update} data={data}/>
      case 'banner':
        return <BannerEditor update={update} data={data}/>
      case 'tour':
        return <TourEditor update={update} data={data}/>
      default:
        break
    }
  }

  return (
    <div className="m-4">
      {handleRender(data)}
    </div>
  )
}

function ChatEditor ({ data, update }) {
  return <p>custom chat</p>
}
