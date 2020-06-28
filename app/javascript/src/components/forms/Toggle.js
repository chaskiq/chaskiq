import React from 'react'
import tw from 'tailwind.macro'
import styled from '@emotion/styled'

const ToggleStyle = styled.div`

  .switch {
    ${tw`relative inline-block align-middle cursor-pointer select-none bg-transparent`}
  }

  .track {
    transition-property: all;
    ${tw`w-12 h-6 bg-gray-600 rounded-full shadow-inner`}
  }

  .thumb {
    ${tw`absolute top-0 w-6 h-6 bg-white border-2 border-gray-600 rounded-full`}
  }

  input[type='checkbox']:checked ~ .thumb {

    --transform-translate-x: 100%;
    --transform-translate-x: 0;
    --transform-translate-y: 0;
    --transform-rotate: 0;
    --transform-skew-x: 0;
    --transform-skew-y: 0;
    --transform-scale-x: 1;
    --transform-scale-y: 1;
    transform: translateX(var(--transform-translate-x)) translateY(var(--transform-translate-y)) rotate(var(--transform-rotate)) skewX(var(--transform-skew-x)) skewY(var(--transform-skew-y)) scaleX(var(--transform-scale-x)) scaleY(var(--transform-scale-y));

    ${tw` border-green-500`}
  }

  input[type='checkbox']:checked ~ .track {

      transition-property: background-color, border-color, color, fill, stroke;
      --transform-translate-x: 0;
      --transform-translate-y: 0;
      --transform-rotate: 0;
      --transform-skew-x: 0;
      --transform-skew-y: 0;
      --transform-scale-x: 1;
      --transform-scale-y: 1;
      transform: translateX(var(--transform-translate-x)) translateY(var(--transform-translate-y)) rotate(var(--transform-rotate)) skewX(var(--transform-skew-x)) skewY(var(--transform-skew-y)) scaleX(var(--transform-scale-x)) scaleY(var(--transform-scale-y));

    ${tw`bg-green-500`}
  }

  input[type='checkbox']:disabled ~ .track {
    ${tw`bg-gray-500`}
  }

  input[type='checkbox']:disabled ~ .thumb {
    ${tw`bg-gray-100 border-gray-500`}
  }

  input[type='checkbox']:focus + .track,
  input[type='checkbox']:active + .track {
    ${tw`shadow-outline`}
  }


`

export default function Toggle ({ 
  id,
  text,
  disabled,
  checked,
  onChange
}) {

  //const [checked, setChecked] = React.useState(false)

  function handleChecked (e){
    //setChecked(!checked)
    onChange && onChange(e)
  }

  const checkedClass = checked ? 'left-0' : 'right-0'

  return <ToggleStyle>
    <label htmlFor={id}>
      <div className="switch">
        <input id={id}
          name={id}
          type="checkbox"
          className="sr-only"
          onChange={handleChecked}
          disabled={disabled}
          checked={checked}
        />
        <div className="track"></div>
        <div className={`thumb ${checkedClass} transition-all duration-300 ease-in-out`}></div>
      </div>
      <span className="ml-2 cursor-pointer">
        {text}
      </span>
    </label>
  </ToggleStyle>
}
