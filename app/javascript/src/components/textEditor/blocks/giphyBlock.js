
import React from "react"

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

import { 
  updateDataOfBlock, 
  addNewBlockAt , 
  resetBlockWithType
} from 'Dante2/package/es/model/index.js'

import Giphy from './giphy'

const giphyApiKey = "97g39PuUZ6Q49VdTRBvMYXRoKZYd1ScZ"

const GiphyLogo = ()=>{
  return <svg width='20' height='20' viewBox='0 1 20 20' xmlns='http://www.w3.org/2000/svg'>
    <g id='Page-1' fill='none' fillRule='evenodd'>
        <g id='giphy-ar21' transform='translate(-8 -6)'>
            <g id='Group' transform='translate(8.569 6.763)'>
                <path d='M6.68649946,11.474 L9.32049946,11.474 C9.32649946,11.552 9.32649946,11.618 9.32649946,11.708 C9.32649946,13.196 8.18649946,14.09 6.95649946,14.09 C5.61249946,14.09 4.59849946,13.04 4.59849946,11.762 C4.59849946,10.436 5.66649946,9.476 6.97449946,9.476 C8.03649946,9.476 8.94849946,10.19 9.19449946,11.048 L7.92249946,11.048 C7.74849946,10.736 7.42449946,10.472 6.94449946,10.472 C6.38649946,10.472 5.73249946,10.886 5.73249946,11.762 C5.73249946,12.692 6.39249946,13.094 6.95049946,13.094 C7.51449946,13.094 7.89249946,12.812 8.01249946,12.38 L6.68649946,12.38 L6.68649946,11.474 Z M10.2894998,14 L10.2894998,9.56 L11.4234998,9.56 L11.4234998,14 L10.2894998,14 Z M12.6025002,14 L12.6025002,9.56 L15.0265002,9.56 L15.0265002,10.556 L13.6885002,10.556 L13.6885002,11.312 L14.9785002,11.312 L14.9785002,12.308 L13.6885002,12.308 L13.6885002,14 L12.6025002,14 Z'
                id='GIF' fill='#00000070' />
                <polygon id='Path' fill='#00000070' transform='rotate(-1.52 1.653 11.39)' points='0.52516176 2.58609459 2.78104613 2.58609459 2.78104613 20.1949155 0.52516176 20.1949155'
                />
                <polygon id='Path' fill='#00000070' transform='rotate(-1.52 17.506 13.227)'
                points='16.3763287 6.67947428 18.6350224 6.67947428 18.6350224 19.7737175 16.3763287 19.7737175'
                />
                <polygon id='Path' fill='#00000070' transform='rotate(-1.52 9.813 21.107)'
                points='0.78567191 19.9778258 18.841174 19.9778258 18.841174 22.2365195 0.78567191 22.2365195'
                />
                <polygon id='Path' fill='#00000070' transform='rotate(-1.52 5.902 1.342)' points='0.259918091 0.212569605 11.544958 0.212569605 11.544958 2.47126329 0.259918091 2.47126329'
                />
                <polygon id='Path' fill='#00000070' points='11.6923919 6.82945814 18.4628543 6.64966162 18.4038586 4.39377726 16.1451649 4.45277299 16.0861692 2.19688863 13.8302848 2.25588436 13.7712891 0 11.5125954 0.0589957305'
                />
                <polygon id='Path' fill='#00000070' transform='rotate(-1.52 17.365 7.809)'
                points='16.2354766 6.67956253 18.4941703 6.67956253 18.4941703 8.93825622 16.2354766 8.93825622'
                />
            </g>
        </g>
    </g>
</svg>
}

export default class GiphyBlock extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      embed_data: this.defaultData(),
      open: true
    }
  }

  componentDidMount(){
    console.log(this.props)
    this.props.blockProps.toggleEditable()
  }

  defaultData =() =>{
    const existing_data = this.props.block.getData().toJS()
    return existing_data.embed_data || {}
  }

  deleteSelf = (e)=>{
    e.preventDefault()
    const { block, blockProps } = this.props
    const { getEditorState, setEditorState } = blockProps
    const data = block.getData()
    const newData = data.merge(this.state)
    return setEditorState(resetBlockWithType(getEditorState(), 'unstyled', {}))
  }

  getAspectRatio = (w, h)=> {
    let maxWidth = 1000
    let maxHeight = 1000
    let ratio = 0
    let width = w // Current image width
    let height = h // Current image height

    // Check if the current width is larger than the max
    if (width > maxWidth) {
      ratio = maxWidth / width // get ratio for scaling image
      height = height * ratio // Reset height to match scaled image
      width = width * ratio // Reset width to match scaled image

      // Check if current height is larger than max
    } else if (height > maxHeight) {
      ratio = maxHeight / height // get ratio for scaling image
      width = width * ratio // Reset width to match scaled image
      height = height * ratio // Reset height to match scaled image
    }

    let fill_ratio = height / width * 100
    let result = { width, height, ratio: fill_ratio }
    // console.log result
    return result
  }

  selectImage = (giphyblock)=>{
    const { block, blockProps } = this.props
    const { getEditorState, setEditorState } = blockProps
    const data = block.getData()

    const {url, height, width} = giphyblock.images.original
    const newData = {
      url: url,
      aspect_ratio: this.getAspectRatio(width, height),
      forceUpload: true
    } 

    this.props.blockProps.toggleEditable()
    //data.merge(this.state)
    return setEditorState(
      resetBlockWithType(getEditorState(), 
      'image', 
      newData)
     )
  }


  render(){
    //console.log(this.state.collection)
    return <div 
            className="dante-giphy-wrapper">
              <Dialog
                open={this.state.open}
                onClose={()=>{
                  this.setState({
                    open: !this.state.open
                  }, this.props.blockProps.toggleEditable ) 
                }}
                maxWidth={'sm'}
                fullWidth={true}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  Compose a new message
                </DialogTitle>
                
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                  
                  <Giphy 
                    apiKey={giphyApiKey}
                    handleSelected={(data)=>{
                      this.selectImage(data)
                    }}
                  />

                  </DialogContentText>
                </DialogContent>
        
                <DialogActions>
                  
                </DialogActions>
        
              </Dialog>     
          </div>
  }
}

export const GiphyBlockConfig = (options={})=>{

  let config =  {
    title: 'add an image',
    type: 'giphy',
    icon: GiphyLogo,
    block: GiphyBlock,
    editable: false,
    renderable: true,
    breakOnContinuous: true,
    wrapper_class: "graf graf--figure",
    selected_class: "is-selected is-mediaFocused",
    widget_options: {
      displayOnInlineTooltip: true,
      insertion: "insertion",
      insert_block: "giphy",
      //insertion: "func",
      //funcHandler: options.handleFunc,
    },
    options: {
      placeholder: 'Search any gif on giphy'
    }
  }
  
  return Object.assign(config, options)
}


