import React, {Component} from 'react'

export default class NewArticleForm extends Component {

  render(){
    return (
      <form>
        <div className="form-group">
          <label htmlFor="i1">Title</label>
          <input 
            className="form-control" 
            id="i1" 
            aria-describedby="emailHelp" 
            placeholder="Enter article title"
            ref="article_title"
          />
          <small id="emailHelp" className="form-text text-muted">
            We'll never share your email with anyone else.
          </small>
        </div>

        <div className="form-check">
          <label className="form-check-label">
            <input type="checkbox" className="form-check-input"/>
            Keep this article private
          </label>
        </div>
      </form>
    )
  }
}