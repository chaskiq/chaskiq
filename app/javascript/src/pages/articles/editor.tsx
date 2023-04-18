import React, { Component } from 'react';

// import TextEditor from '@chaskiq/components/src/components/textEditor';
import TextEditor from '@chaskiq/components/src/components/danteEditor';

type ArticleEditorProps = {
  updateState: (val: any) => void;
  uploadHandler: any;
  loading: boolean;
  article: any;
  theme: any;
};

type ArticleEditorState = {
  read_only: boolean;
  data: any;
  status: string;
  statusButton: 'inprogress';
};
export default class ArticleEditor extends Component<
  ArticleEditorProps,
  ArticleEditorState
> {
  constructor(props) {
    super(props);

    this.state = {
      read_only: false,
      data: {},
      status: '',
      statusButton: 'inprogress',
    };
  }

  saveContent = (content) => {
    this.props.updateState({
      status: 'saving...',
      statusButton: 'success',
      content: {
        html: content.html,
        serialized: JSON.stringify(content.serialized),
      },
    });
  };

  isLoading = () => {
    return this.props.loading; // || !this.props.article.content
  };

  render() {
    //! this.state.loading &&
    // if(this.props.loading) //|| !this.props.article.content)
    //  return <CircularProgress/>

    const content = this.props.article.content;
    const serializedContent = content ? content.serialized_content : null;

    return (
      <TextEditor
        allowedEditorFeature={() => true}
        campaign={true}
        uploadHandler={this.props.uploadHandler}
        loading={this.isLoading()}
        read_only={this.state.read_only}
        toggleEditable={() => {
          this.setState({
            read_only: !this.state.read_only,
          });
        }}
        inlineTooltipConfig={{
          fixed: true,
          sticky: true,
          placement: 'up',
        }}
        data={{
          serialized_content: serializedContent,
        }}
        theme={this.props.theme}
        styles={{
          lineHeight: '2em',
          fontSize: '1.2em',
        }}

        updateState={(editor: any) => {
          this.saveContent({
            html: editor.getHTML(),
            serialized: editor.getJSON(),
          });
        }}

      />
    );
  }
}
