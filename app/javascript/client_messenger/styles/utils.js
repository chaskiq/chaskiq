import {readableColor} from "polished";

export function textColor(color){
  const lightReturnColor = "#121212"
  const darkReturnColor = "#f3f3f3"
  return readableColor(color, lightReturnColor, darkReturnColor)
}