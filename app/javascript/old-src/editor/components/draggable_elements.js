
import React from 'react';

// INLINE TOOLTIP

const style = {
  position: "fixed",
  zIndex: 2000,
  top: '0px',
  left: '0px',
  width: '100px',
  backgroundColor: 'red',
  height: '100%'
}

export default function(){

  const startDrag = (event, data) => {
    event.dataTransfer.dropEffect = 'move'; // eslint-disable-line no-param-reassign
    // declare data and give info that its an existing key and a block needs to be moved
    event.dataTransfer.setData('text', JSON.stringify(data));
  }

  return  <div style={style} >
              <ul>
                <li draggable={true} onDragStart={(e)=> startDrag(e, {type: "embed"})}>
                  embed
                </li>
                <li draggable={true} onDragStart={(e)=> startDrag(e, {type: "column", data: {className: "col-sm-12"}})}>
                  column 12
                </li>
                <li draggable={true} onDragStart={(e)=> startDrag(e, {type: "column", data: {className: "col-sm-4"}})}>
                  column 4
                </li>
                <li draggable={true} onDragStart={(e)=> startDrag(e, {type: "column", data: {className: "col-sm-6"}})}>
                  column 6
                </li>
                <li draggable={true} onDragStart={(e)=> startDrag(e, {type: "card"})}>
                  card
                </li>
                <li draggable={true} onDragStart={(e)=> startDrag(e, {type: "jumbo"})}>
                  jumbo
                </li>

              </ul>
          </div>
}