import React, {Component, useState, useEffect} from 'react'
import styled from '@emotion/styled'
import {
  AnchorButton,
  FadeRightAnimation,
  FadeBottomAnimation,
  Spinner,
  CountBadge
} from './styles/styled'
import sanitizeHtml from 'sanitize-html';
import {CommentsItemComp} from './conversation'
import {textColor} from './styles/utils'
import Loader from './loader'

//import graphql from './graphql/client'
import {
  ARTICLES,
  SEARCH_ARTICLES
} from './graphql/queries'

import { lighten, darken } from "polished";


const HomePanel = ({
  viewConversations,
  displayNewConversation,
  updateHeader,
  transition,
  displayArticle,
  appData,
  agents,
  t,
  graphqlClient,
  displayConversation,
  conversations,
  getConversations,
  lang,
  newMessages
})=>{

  const [loading, setLoading] = useState(false)
  const [articles, setArticles] = useState([])

  const [conversationLoading, setConversationLoading] = useState(false)

  const [meta, setMeta] = useState({})

  let textInput = React.createRef();

  useEffect(()=>(
    updateHeader(
      {
        translateY: -25, 
        opacity: 1, 
        height: '212px' 
      }
    )
  ), [])

  useEffect(()=> { 
    if(appData.articleSettings.subdomain)
      getArticles()
  }, [])

  useEffect(()=> {
    //if(!appData.inboundSettings.enabled )
    setConversationLoading(true)

    getConversations({page: 1 , per: 1}, ()=> {
      setConversationLoading(false)
    })
  }, [] )

  function shouldDisplayArticles(){
    return appData.enableArticlesOnWidget
  }

  const getArticles = ()=>{

    if(!shouldDisplayArticles()){
      return
    }

    setLoading(true)

    graphqlClient.send(ARTICLES, {
      domain: appData.articleSettings.subdomain,
      lang: lang,
      page: 1,
      per: 5,
    }, {
      success: (data)=>{
        const {collection, meta} = data.helpCenter.articles
        setArticles(collection)
        setLoading(false)
        setMeta(meta)
      },
      error: (err)=>{
        console.log("ERR" , err)
        setLoading(false)
        //debugger
      }
    })
  }

  const handleScroll = (e)=>{
    window.a = e.target
    const target = e.target
    const val = 1 - normalize(target.scrollTop, target.offsetHeight, 0 )
    const pge = percentage(target.scrollTop, target.offsetHeight)
    //console.log(val)
    const opacity = val === 1 ? val : val * 0.3

    updateHeader({
      translateY: - pge - 25, 
      opacity: opacity, 
      height: '212px' 
    })
  }

  const normalize = (val, max, min)=> { 
    return (val - min) / (max - min)
  }

  const percentage = (partialValue, totalValue)=>{
    return (100 * partialValue) / totalValue;
  }

  function handleSearch(e) {
    console.log(textInput.value)
    if(e.keyCode === 13){
      searchArticles(textInput.value)
    } 
  }

  function searchArticles(term){
    setLoading(true)
    graphqlClient.send(SEARCH_ARTICLES, {
      domain: appData.articleSettings.subdomain,
      term: term,
      lang: lang,
      page: 1,
      per: 5,
    }, {
      success: (data)=>{
        const {collection, meta} = data.helpCenter.search
        setArticles(collection)
        setMeta(meta)
        setLoading(false)
      },
      error: ()=>{
        setLoading(true)
      }
    })
  }

  function renderAvailability(){
    if(!appData.inBusinessHours){
      return <React.Fragment>
                {
                  appData.businessBackIn && aa()
                }
              </React.Fragment>
    }else {
      return <p/>
    }
  }

  function aa(){
    const val = Math.floor(appData.businessBackIn.days)
    const at = new Date(appData.businessBackIn.at)
    const nextDay = at.getDay()
    const today = new Date(Date.now()).getDay()

    const TzDiff = Math.ceil(( at - Date.now() ) / (1000 * 3600 * 24)) 

    const sameDay = nextDay === today
    const nextWeek = TzDiff >= 6 && sameDay

    if(nextWeek) return <Availability><p>{t("availability.next_week")}</p></Availability>
    if(sameDay) return <Availability><p>{t("availability.aprox", {time: at.getHours() })}</p></Availability>

    const out = text(val, sameDay, at)

    return <Availability>{out}</Availability>
  }

  function text(val, sameDay, at){
    switch (val) {
      case 1:
        return <p>{t("availability.tomorrow")}</p>
      case 2:
      case 3:
      case 4:
      case 5:
        return <p>{t("availability.days", {val: val})}</p>
      case 6:
        return <p>{t("availability.next_week")}</p>
      default:
        if(val === 0){
          if(sameDay){
            return <p>{t("availability.back_from", {hours: at.getHours() })}</p>
          } else {
            return <p>{t("availability.tomorrow_from", {hours: at.getHours() })}</p>
          }
        }
        return null
    }
  }

  function replyTimeMessage(){
    return appData.replyTime && <ReplyTime>
      {t(`reply_time.${appData.replyTime}`)}
    </ReplyTime>
  }

  function sanitizeMessageSummary(message){
    if(!message) return
    const sanitized = sanitizeHtml(message)
    return sanitized.length > 100 ? `${sanitized.substring(0, 100)} ...` : sanitized
  }

  function renderLastConversation(){
    return <CardContent>
        {
          conversationLoading && <Loader xs={true}/>
        }
        {
          !conversationLoading && conversations.map((o, i) => {
            const message = o.lastMessage
            return <CommentsItemComp
              key={`comments-item-comp-${o.key}`}
              message={message}
              o={o}
              index={i}
              t={t}
              displayConversation={displayConversation}
              sanitizeMessageSummary={sanitizeMessageSummary}
            />
          })
        }
      </CardContent>
  }

  return (

    <Panel onScroll={handleScroll}>
      
      {
        appData.inboundSettings.enabled &&
        <ConversationInitiator in={transition}>
        
          <CardPadder>
            <h2>{t("start_conversation")}</h2>

            {renderAvailability()}
            
            {replyTimeMessage()}
        
            <CardContent>
              <ConnectedPeople>
                {
                  agents.map((agent, i)=>(
                    <Avatar key={`home-agent-${i}-${agent.id}`}>
                      <img src={agent.avatarUrl} title={agent.name}/>
                    </Avatar>
                  ))
                }
              </ConnectedPeople>

              <CardButtonsGroup>

                { /*
                  conversations.length > 0 ?
                  <h2>{t("conversations")}</h2> : 
                  <AnchorButton href="#" onClick={displayNewConversation}>
                    {t("start_conversation")}
                  </AnchorButton>
                */ }


                <AnchorButton href="#" onClick={displayNewConversation}>
                  {t("start_conversation")}
                </AnchorButton>
               
                <a href="#" onClick={viewConversations}>
                  {t("see_previous")}
                </a>

              </CardButtonsGroup>
            </CardContent>

          </CardPadder>

          { conversations.length > 0 && <React.Fragment>
              {renderLastConversation()}
            </React.Fragment> 
          }

        </ConversationInitiator> 
      }

      {
        !appData.inboundSettings.enabled &&
          <ConversationsBlock in={transition}>
            <CardButtonsGroup style={{padding: '2em'}}>
              <h2>{t("conversations")}</h2>

              { newMessages > 0 && 
                <CountBadge section={'home'}>
                  {newMessages}
                </CountBadge>
              }

              <a href="#" onClick={viewConversations}>
                {t("see_previous")}
              </a>
            </CardButtonsGroup>
            {renderLastConversation()}
          </ConversationsBlock> 
      }

      {
        shouldDisplayArticles() &&
          <Card in={transition}>
            <p>{t("search_article_title")}</p>
            <ButtonWrapper>
              <input ref={(ref)=> textInput = ref} 
                placeholder={ t("search_articles") } 
                onKeyDown={handleSearch}
              /> 
              <button onClick={()=> searchArticles(textInput.value)}>
                {loading ? <Spinner/> : 'go' }
              </button>
            </ButtonWrapper>
          </Card>
      }

      { loading && <Loader xs></Loader>}

      {  articles.length > 0 && <ArticleList>

          <ArticlePadder>
            <h2>
              {t("latest_articles")}
            </h2>
          
            {
              articles.map((article, i)=>(
                <ArticleCard key={`article-card-${article.id}`} 
                  article={article} 
                  displayArticle={displayArticle}
                />
              ))
            }

          </ArticlePadder>
        
        </ArticleList> 
      }
    
      </Panel>
  )
}

const ArticleCard = ({article, displayArticle})=>{
  return (

    <ArticleCardWrapper onClick={(e)=> displayArticle(e, article) }>
    
      <ArticleCardTitle>
        {article.title}
      </ArticleCardTitle>

      <ArticleCardContent>
        {article.description}
      </ArticleCardContent>
    
    </ArticleCardWrapper>

  )
}

const Panel = styled.div`
  position: fixed;
  top: 34px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  overflow: scroll;
  width: 100%;
  height: 97%;
  z-index: 1000;
`

const Availability = styled.div`
  //background: #ecf94c;
  //padding: .5em;
  border-radius: 7px;
  font-weight: 300;
  p{
    margin: 0px;
  }
`

const ReplyTime = styled.p`
  color: #969696;
  font-weight: 300;
  font-size: .8rem;
`

const ButtonWrapper = styled.div`
  display: flex;

  input{
    padding: 1em;
    flex-grow: 2;
    border: 1px solid #ccc;
    border-right: 0px solid #ccc;
  }

  button{
    border: 0px solid #ccc;
    padding: 1.2em;
    border-bottom-right-radius: 6px;
    border-top-right-radius: 6px;
    color: ${(props)=> textColor( props.theme.palette.secondary )};
    background: ${(props)=> props.theme.palette.secondary };
  }
`

const CardButtonsGroup = styled.div`
  margin-top: 1em;
  align-items: center;
  justify-content: space-between;
  display: flex;
  a, a:link, a:visited, a:focus, a:hover, a:active{
    color: ${(props)=> props.theme.palette.secondary};
    text-decoration:none; 
    //cursor: crosshair;
  }

`

const Avatar = styled.div`
  -webkit-box-flex: 0;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
  align-self: center;
  img {
    width: 50px;
    height: 50px;
    text-align: center;
    border-radius: 50%;
    border: 3px solid white;
  }
`

const Card = styled.div`
  margin-bottom: 17px;
  background-color: #fff;
  border-radius: 3px;
  font-size: 14px;
  line-height: 1.4;
  color: #000;
  overflow: hidden;
  position: relative;
  //-webkit-box-shadow: 0 4px 15px 0 rgba(0,0,0,.1), 0 1px 2px 0 rgba(0,0,0,.1), inset 0 2px 0 0 rgba(48, 71, 236, 0.5);
  box-shadow: 0 4px 15px 0 rgba(0,0,0,.1), 0 1px 2px 0 rgba(0,0,0,.1), inset 0 2px 0 0 ${(props)=>{lighten(0.1, props.theme.palette.secondary)}};

  margin: 1em;
  padding: 2em;

  ${(props)=> FadeRightAnimation(props)}

`


const ConversationInitiator = styled(Card)`
  margin-top: 10em;
  padding: 0;
  h2{
    font-size: 1.2em;
    font-weight: 500;
    margin: .4em 0 0.4em 0em;
  }
`

const CardPadder = styled.div`
  padding: 2em;
`

const ConversationsBlock = styled(Card)`
  margin-top: 10em;
  padding: 0px;
  h2{
    margin: .4em 0 0.4em 0em;
  }
`

const CardContent = styled.div`
`

const ConnectedPeople = styled.div`
  display: flex;
  div{
    margin-right: -10px;
  }
`

const ArticleList = styled.div`
  
  background: white;
  h2{
    font-size: 1.2em;
  }
`

const ArticlePadder = styled.div`
  padding: .8em;
`

const ArticleCardWrapper = styled.div`
  cursor: pointer;
  background: white;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(193, 203, 212, 0.7) 0px 0px 0px 1px inset, rgb(193, 203, 212) 0px -1px 0px 0px inset;
  transform: translateZ(0px);
  border-width: initial;
  border-style: none;
  border-color: initial;
  border-image: initial;
  transition: all 550ms cubic-bezier(0.23, 1, 0.32, 1) 0s;
  text-decoration: none;
  padding: 20px 20px 22px;
  margin-bottom: 0.3em;
  &:hover{
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(193, 203, 212, 0.7) 0px 0px 0px 1px inset, rgb(193, 203, 212) 0px -1px 0px 0px inset;
    transform: translate(0px, -2px);
    border-width: initial;
    border-style: none;
    border-color: initial;
    border-image: initial;
  }
  &:after{
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 40px 0px;
    content: "";
    height: 100%;
    left: 0px;
    opacity: 0;
    position: absolute;
    top: 0px;
    transform: translateZ(0px);
    width: 100%;
    z-index: -1;
    border-radius: 4px;
    transition: all 200ms linear 0s;
  }
`

const ArticleCardTitle = styled.div`
  color: ${(props)=> (props.theme.palette.secondary)};
  font-weight: bold;
  line-height: 1.5;
  margin-bottom: 7px;
  transition: all 200ms linear 0s;
`

const ArticleCardContent = styled.div`

`


export default HomePanel