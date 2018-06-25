import { updateDataOfBlock } from '../../model/index.js'

export const UpdateData = (t)=> {
  let { blockProps, block } = t.props
  let { getEditorState, setEditorState } = t.props.blockProps
  let data = block.getData()
  let newData = data.merge(t.state).merge({ forceUpload: false })
  return setEditorState(updateDataOfBlock(getEditorState(), block, newData))
}