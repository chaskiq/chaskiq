

export function setImageZoom(data){
  return (dispatch, getState)=>{
    dispatch(setImage(data))
  }
}

function setImage(data) {
  return { 
    type: "SET_ZOOM_IMAGE", 
    data: data 
  }
}

const initialState = {}

// Reducer
export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case "SET_ZOOM_IMAGE":
      return action.data
    default: return state
  }
}