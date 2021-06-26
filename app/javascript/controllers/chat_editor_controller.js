import { Controller } from 'stimulus';
import React from 'react';
import { render } from 'react-dom';
import ConversationEditor from '../src/pages/conversations/Editor'
import { post } from '@rails/request.js'

export default class extends Controller {
  //static targets = ['contentframe'];

  connect() {
		console.log("editor!!!!!!")

		this.actionPath = this.element.dataset.editorActionPath

		render(
				<ConversationEditor
					insertNode={this.insertNote.bind(this)}
					insertComment={this.insertComment.bind(this)}
					typingNotifier={this.typingNotifier.bind(this)}  
				/>,
			this.element
		);
  }

	insertNote(formats, cb){
		cb && cb()
	}

	async insertComment(formats, cb){
		const response = await post(
			this.actionPath, { 
				body: JSON.stringify(formats)
			})
		if (response.ok) {
			cb && cb()
			setTimeout(()=>{
				this.scrollToBottom()
			},200)
		}
	}

	scrollToBottom (){
		const overflow = document.getElementById('conversation-overflow')
		overflow.scrollTop = overflow.scrollHeight
	}
	
	typingNotifier(){
		console.log("NOTIFY TYPING")
	}

}
