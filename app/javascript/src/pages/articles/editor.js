
import React, { Component } from 'react'

import TextEditor from '../../components/textEditor'

export default class ArticleEditor extends Component {
  constructor (props) {
    super(props)

    this.state = {
      read_only: false,
      data: {},
      status: '',
      statusButton: 'inprogress'
    }
  }

  saveContent = (content) => {
    this.props.updateState({
      status: 'saving...',
      statusButton: 'success',
      content: {
        html: content.html,
        serialized: content.serialized
      }
    })
  };

  isLoading = () => {
    return this.props.loading // || !this.props.article.content
  };

  render () {
    //! this.state.loading &&
    // if(this.props.loading) //|| !this.props.article.content)
    //  return <CircularProgress/>

    const content = this.props.article.content

    const serializedContent = content ? content.serialized_content : null

    return (
      <TextEditor
        campaign={true}
        uploadHandler={this.props.uploadHandler}
        loading={this.isLoading()}
        read_only={this.state.read_only}
        toggleEditable={() => {
          this.setState({
            read_only: !this.state.read_only
          })
        }}
        serializedContent={serializedContent}
        data={{
          serialized_content: serializedContent
        }}
        styles={{
          lineHeight: '2em',
          fontSize: '1.2em'
        }}
        updateState={({ _status, _statusButton, content }) => {
          console.log('get content', content)
          this.saveContent(content)
        }}
      />
    )
  }
}
