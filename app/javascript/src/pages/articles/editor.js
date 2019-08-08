import PropTypes from 'prop-types';
import React, { Component } from 'react';

import EditorStyles from 'Dante2/package/es/styled/base'
import styled from '@emotion/styled'
//import _ from "lodash"
import TextEditor from '../../textEditor'

const EditorStylesExtend = styled(EditorStyles)`

  line-height: 2em;
  font-size: 1.2em; 

  .graf--p{
    line-height: 2em;
    font-size: 1.2em; 
  }

  .dante-menu{
    z-index: 2000;
  }

  blockquote {
    margin-left: 20px;
  }
`

export default class ArticleEditor extends Component {

  constructor(props) {
    super(props)

    this.ChannelEvents = null
    this.conn = null
    this.menuResizeFunc = null
    this.state = {
      loading: true,
      currentContent: null,
      diff: "",
      videoSession: false,
      selectionPosition: null,
      incomingSelectionPosition: [],
      data: {},
      status: "",
      statusButton: "inprogress"
    }
  }

  saveContent = (content)=>{

    this.props.updateState({
      status: "saving...",
      statusButton: "success",
      content: {
        html: content.html,
        serialized: content.serialized
      }
    })
  }

  saveHandler = (html3, plain, serialized) => {
    debugger
  }

  render() {
    // !this.state.loading &&
    /*if (this.state.loading) {
      return <Loader />
    }*/

    const serializedContent = this.props.article.content ? this.props.article.content.serialized_content : null

    return <TextEditor 
                      campaign={true} 
                      uploadHandler={this.props.uploadHandler}
                      serializedContent={serializedContent }
                      loading={this.props.loading}
                      data={
                          {
                            serialized_content: serializedContent
                          }
                        }
                      styles={
                        {
                          lineHeight: '2em',
                          fontSize: '1.2em'
                        }
                      }
                      saveHandler={this.saveHandler} 
                      updateState={({status, statusButton, content})=> {
                        console.log("get content", content)
                        this.saveContent(content )
                      }
                    }
                  />  
  }

}
