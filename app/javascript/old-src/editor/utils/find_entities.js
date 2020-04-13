import { Entity } from 'draft-js'

//TODO: what the f*ck is happening here? ;-;
const findEntities = (entityType, instance, contentBlock, callback) => {
  return contentBlock.findEntityRanges((function(_this) {
    return function(character) {
      var entityKey, opts, res
      let contentState = instance.state.editorState.getCurrentContent()
      entityKey = character.getEntity()
      return (res = entityKey !== null && contentState.getEntity(entityKey).getType() === entityType, res ? (opts = {
        showPopLinkOver: instance.showPopLinkOver,
        hidePopLinkOver: instance.hidePopLinkOver
      }, contentState.mergeEntityData(entityKey, opts)) : void 0, res)
    }
  })(this), callback)
}

export default findEntities