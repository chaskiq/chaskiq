import React, {Component} from 'react'
import styled from '@emotion/styled'

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

const HomePanel = ()=>{


  return (


    <div style={{
      position: 'absolute',
      top: '0',
      bottom: '0',
      left: '0',
      right: '0',
      overflow: 'scroll'
    }}>

      <ArticleList>

        ooooe
      
        {
          articles.map((article, i)=>(
            <ArticleCard key={i} article={article}/>
          ))
        }
      
      </ArticleList>
    </div>
  )
}

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