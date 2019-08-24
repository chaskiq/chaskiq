import React, {Component} from 'react'
import styled from '@emotion/styled'
import {
  AnchorButton
} from './styles/styled'

const articles = [
  { 
    id: 1,
    title: "hey ho",
    content: "hola gogogo "
  },
  { 
    id: 2,
    title: "good byt",
    content: "hola gogogo "
  },
  { 
    id: 3,
    title: "how to",
    content: "hola gogogo agaga "
  },
]

const agents = [
  {
    name: "abott",
    url: 'https://api.adorable.io/avatars/285/abott@adorable.png',
  },
  {
    name: "juan",
    url: 'https://api.adorable.io/avatars/285/juan@adorable.png',
  },
  {
    name: "paco",
    url: 'https://api.adorable.io/avatars/285/paco@adorable.png',
  },
]

const HomePanel = ({
  viewConversations,
  displayNewConversation
})=>{


  return (

    <div style={{
      position: 'absolute',
      top: '0',
      bottom: '0',
      left: '0',
      right: '0',
      overflow: 'scroll'
    }}>

      <ConversationInitiator>
      
        <h2>Start a conversation</h2>
        <p>people connected</p>

        <CardContent>

          <ConnectedPeople>
            {
              agents.map((agent)=>(
                <Avatar>
                  <img src={agent.url} title={agent.name}/>
                </Avatar>
              ))
            }
          </ConnectedPeople>

          <CardButtonsGroup>

            <AnchorButton onClick={displayNewConversation}>
              start conversation
            </AnchorButton>

            <a href="#" onClick={viewConversations}>
              see previous
            </a>

          </CardButtonsGroup>
        
        </CardContent>
      
      </ConversationInitiator>

      <Card>
        search shits
        <ButtonWrapper>
          <input placeholder={"search articles"}/> 
          <button>go</button>
        </ButtonWrapper>
      </Card>

      <ArticleList>

        <h2>
          Our latest articles
        </h2>
      
        {
          articles.map((article, i)=>(
            <ArticleCard key={i} article={article}/>
          ))
        }
      
      </ArticleList>
    </div>
  )
}

const ButtonWrapper = styled.div`
  display: flex;

  input{
    padding: 1em;
    flex-grow: 2;
    border: 1px solid #ccc;
    border-right: 0px solid #ccc;
  }

  button{
    border: 1px solid #ccc;
    padding: 1.2em;
    border-bottom-right-radius: 6px;
    border-top-right-radius: 6px;
    background: aliceblue;
  }
`

const CardButtonsGroup = styled.div`
  margin-top: 1em;
  align-items: center;
  justify-content: space-evenly;
  display: flex;
`

const Avatar = styled.div`
  -webkit-box-flex: 0;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
  align-self: center;
  img {
    width: 40px;
    height: 40px;
    text-align: center;
    border-radius: 50%;
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
  box-shadow: 0 4px 15px 0 rgba(0,0,0,.1), 0 1px 2px 0 rgba(0,0,0,.1), inset 0 2px 0 0 rgba(48, 71, 236, 0.5);

  margin: 1em;
  padding: 2em;

`

const ConversationInitiator = styled(Card)`
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
  margin: .8em;
`

const ArticleCardWrapper = styled.div`
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
  color: rgb(0, 119, 204);
  line-height: 1.5;
  margin-bottom: 7px;
  transition: all 200ms linear 0s;
`

const ArticleCardContent = styled.div`

`

const ArticleCard = ({article})=>{
  return (

    <ArticleCardWrapper>
    
      <ArticleCardTitle>
        {article.title}
      </ArticleCardTitle>

      <ArticleCardContent>
        {article.content}
      </ArticleCardContent>
    
    </ArticleCardWrapper>

  )
}


export default HomePanel