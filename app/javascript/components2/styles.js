import styled from 'styled-components'

const dante_font_family_serif = `'freight-text-pro', 'Merriweather', Georgia, Cambria, "Times New Roman", Times, serif;`
const dante_font_family_sans = `'jaf-bernino-sans', 'Open Sans', "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Geneva, Verdana, sans_serif;`
const dante_font_family_mono = `Menlo, Monaco, Consolas, "Courier New", "Courier", monospace;`

const dante_font_family_base = dante_font_family_sans;
const dante_font_size_base =  '12px';
const line_height_base =     '1.428571429'; // 20/14


const tooltip_color = '0,0,0';
const tooltip_color_opacity = '0.44';
const tooltip_color_opacity_hover = '0.9';
const tooltip_background_opacity = '0';
const tooltip_border_width = '1px';
const tooltip_border_radius = '999em';

const tooltip_button_spacing = '5px';
const tooltip_menu_spacing = 22;

const tooltip_items = 10; // Fix this and remove it
const tooltip_item_delay = 30;
const tooltip_size = 32;
const tooltip_line_height = tooltip_size;

const tooltip_default_transition = '100ms border-color, 100ms color';
const tooltip_forward_transition = 'transform 100ms';
const tooltip_backward_transition = 'transform 250ms';

const dante_font_family_sans_serif = 'comic-sans';
const dante_visual_debugger = 'false';
const dante_text_color = '#eee';
const dante_inversed_color = '#FFFFFF';
const dante_accent_color = '#5BD974';
const dante_control_color = '#333333';
const dante_popover_color = '#FFFFFF';
// Editor
const dante_editor_font_size = '18px' ;
const dante_editor_line_height = '1.9' ;
// Menu
const dante_menu_height = 42 ;
const dante_menu_background = dante_control_color ;
const dante_menu_color = dante_inversed_color ;
const dante_menu_border_radius = '5px' ;
const dante_menu_box_shadow = '1px 2px 3px 2px #222' ;
const dante_menu_icon_size = '16px' ;
const dante_menu_icon_color = dante_inversed_color ;
const dante_menu_icon_accent = dante_accent_color ;
const dante_menu_border_width = '0px' ;
const dante_menu_border_color = 'none' ;
const dante_menu_caret_size = 8 ;

const Container = styled.div`
  
  @import url('//fonts.googleapis.com/css?family=Merriweather:400,700,400italic,700italic|Open+Sans:400,300,800');
  /*width: 320px;*/
  font-family: ${dante_font_family_serif};
  letter-spacing: 0.01rem;
  font-weight: 400;
  font-style: normal;
  font-size: ${dante_editor_font_size};
  line-height: ${dante_editor_line_height};
  color: ${dante_text_color};

  @media (max-width: 500px) {

    .postContent {
      font-size: ${dante_editor_font_size - 6};
      line-height: ${dante_editor_line_height};
    }

  }

  .graf--h2,
  .graf--h3,
  .graf--h4,
  .graf--h5,
  .graf--h6,
  .graf--h7,
  .postList,
  .graf--hr,
  .graf--figure,
  .graf--blockquote,
  .graf--pullquote,
  .graf--p,
  .graf--pre {
    margin: 0;
    //position:relative;
  }

  .graf--code {
    background: transparent;
    position:relative;
    overflow: visible;
    .dante-code-syntax{
      position: absolute;
      top: -17px;
      right: -18px;
      width: 165px;
    }
  }

  .graf--pre {
      background: #000 !important;
      font-family: ${dante_font_family_mono};
      font-size: 16px;
      margin-bottom: 20px;
      padding: 20px;
      white-space: pre-wrap;
      color: #fff !important;
  }

  .postList {
    margin-bottom: 30px;
  }

  .graf--p,
  .graf--blockquote,
  .graf--pullquote {
    margin-bottom: 30px;
  }

  .graf--code {
    line-height: 1em;
  }

  .graf--p.dante--spinner{
    position:relative;
  }

  .graf--hr {
    hr{
      border: 1px solid #ccc;
      margin: 26px;
    }
  }

  .graf--h1 {
    font-family: ${dante_font_family_sans};
    font-size: 3.6em;
    font-style: normal;
    font-weight: 700;
    letter-spacing: -0.04em;
    line-height: 1;
    margin-bottom: .4em;
    margin-left: -3px;
    margin-top: 40px;
    padding-top: 0;
  }
  .graf--h2 {
    font-family: ${dante_font_family_sans};
    letter-spacing: -0.02em;
    font-weight: 700;
    font-style: normal;
    font-size: 2.1em;
    margin-left: -1.8px;
    line-height: 1.2;
    margin-top: 40px;
    margin-bottom: .7em;
  }
  .public-DraftStyleDefault-pre{
    overflow: inherit;
  }
  .graf--h3 {
    font-family: ${dante_font_family_sans};
    letter-spacing: -0.02em;
    font-weight: 300;
    font-style: normal;
    font-size: 1.5em;
    margin-left: -1.5px;
    line-height: 1.2;
    color: rgba(0,0,0,0.44);
    margin-top: 40px;
    margin-bottom: .6em;
  }

  .section--first .graf--h1.graf--first,
  .section--first .graf--h2.graf--first,
  .section--first .graf--h3.graf--first {
    margin-top: 0;
    padding-top: 0;
  }

  .graf--h1 + .graf--h1 {
    margin-top: -8px;
  }

  .graf--h1 + .graf--h2,
  .graf--h1 + .graf--h3 {
    margin-top: -6px;
  }

  .graf--h2 + .graf--h3,
  .graf--h3 + .graf--h1 {
    margin-top: 2px;
  }

  .graf--h2 + .graf--h3,
  .graf--h3 + .graf--h2 {
    margin-top: -2px;
  }

  .graf--h1 + .postList,
  .graf--h2 + .postList,
  .graf--h3 + .postList {
    margin-top: 10px;
  }

  .graf--h1 + .graf--p.graf--empty,
  .graf--h2 + .graf--p.graf--empty,
  .graf--h3 + .graf--p.graf--empty {
    margin-bottom: -7px;
    margin-top: -7px;
  }

  .graf--h1 + .graf--p.graf--empty + .graf--h1,
  .graf--h2 + .graf--p.graf--empty + .graf--h1,
  .graf--h3 + .graf--p.graf--empty + .graf--h1 {
    margin-top: -5px;
  }

  .graf--h1 + .graf--p.graf--empty + .graf--h2,
  .graf--h2 + .graf--p.graf--empty + .graf--h2,
  .graf--h3 + .graf--p.graf--empty + .graf--h2,
  .graf--h1 + .graf--p.graf--empty + .graf--h3,
  .graf--h2 + .graf--p.graf--empty + .graf--h3,
  .graf--h3 + .graf--p.graf--empty + .graf--h3 {
    margin-top: -8px;
  }


  .graf--blockquote, blockquote {
    font-family: ${dante_font_family_serif};
    border-left: 3px solid rgba(0, 0, 0, .8);

    font-style: italic;
    font-weight: 400;
    letter-spacing: 0.16px;
    letter-spacing: 0.02rem;
    margin-left: -17px;
    padding-left: 15px;
    margin-bottom: 25px;
    font-size: 1.2em;
    line-height: 1.9em;
    margin-top: 20px;

  }
  .graf--blockquote + .graf--blockquote {
    margin-top: -30px;
    padding-top: 30px;
  }

  .graf--pullquote {
    line-height: 1.4;
    text-align: center;
    font-size: 3.2em;
    margin: 48px -160px;
    border: none;
    padding: 0;
    font-family: ${dante_font_family_serif};
    letter-spacing: 0.01rem;
    font-weight: 400;
    font-style: italic;
    -webkit-transition: margin 100ms;
    transition: margin 100ms;
  }

  .graf--pre + .graf--pre {
    margin-top: -20px;
  }

  .graf--figure {
  
    box-sizing: border-box;
    clear: both;
    margin-bottom: 30px;
    outline: medium none;
    position: relative;

    &.is-mediaFocused .graf-image,
    &.is-mediaFocused iframe {
      box-shadow: 0 0 0 3px #57ad68;
    }
  }

  .graf--mixtapeEmbed {
    a {
      text-decoration: none;
    }
    &.is-mediaFocused {
      box-shadow: 0 0 0 1px #57ad68;
    }

    .graf--media-embed-close{
      position: absolute;
      top: 1px;
      display: inline-block;
      font-size: 2em;
      width: 20px;
      right: 10px;
      text-shadow: 0px 0px 0px white;
    }
  }



  .graf--h4 + .graf--figure,
  .graf--h3 + .graf--figure,
  .graf--h2 + .graf--figure {
    margin-top: 15px;
  }

  .graf--first {
    margin-top: 0;
    padding-top: 0;
  }

  /*.graf--empty {
    margin-bottom: -7px;
    margin-top: -7px;
  }*/

  p[data-align="center"],
  .graf--h2[data-align="center"],
  .graf--h3[data-align="center"],
  .graf--h4[data-align="center"],
  .graf--blockquote[data-align="center"] {
    text-align: center;
  }

  .markup--anchor,
  .graf--sectionCaption {
      cursor: text;
  }
  .markup--anchor {
    text-decoration: underline;
    color: inherit;
  }

  @media (max-width: 500px) {

    .graf--h2 {
      font-size: 2.6em;
    }
    .graf--h3 {
      font-size: 1.6em;
    }
    .graf--h4 {
      font-size: 1.4em;
    }

  }

  .graf--divider span{
    text-align: center;
    width: 100%;
    display: block;
  }

  .graf--divider span:before {
    line-height: 1;
    user-select: none;
    font-weight: 400;
    font-size: 25px;
    letter-spacing: 18px;
    content: "...";
    display: inline-block;
    margin-left: .6em;
    position: relative;
    color: #757575;
    top: -3px;
  }



  .graf--layoutOutsetLeft {
      margin-left: -160px;
  }

  .graf--layoutFillWidth {
      margin-left: -200px;
      margin-right: -200px;
  }

  .graf--layoutOutsetLeft {
      width: 75%;
  }
  .graf--layoutInsetLeft, .graf--layoutOutsetLeft {
      float: left;
      margin-right: 30px;
      padding-top: 10px;
      padding-bottom: 10px;
  }


  .aspectRatioPlaceholder {
      margin: 0 auto;
      position: relative;
      width: 100%;
  }

  .graf-image:before,
  .iframeContainer:before {
    .is-postEditMode & {
      bottom: 0;
      content: "";
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
      z-index: 500;
    }
  }

  .aspectRatioPlaceholder.is-locked .graf-image, 
  .aspectRatioPlaceholder.is-locked .graf-imageAnchor {
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;
  }

  .graf-image,
  .graf-imageAnchor,
  .iframeContainer > iframe,
  .iframeContainer {
    box-sizing: border-box;
    display: block;
    margin: auto;
    max-width: 100%;
  }

.aspectRatioPlaceholder {
  .image-upoader-loader{
    position: absolute;
    bottom: 0px;
    left: 0%;
    background-color: #fff;
    width: 100%;
    /* height: 3px; */
    text-align: center;
    top: 0px;
    vertical-align: text-bottom;
    opacity: 0.7;
    p{
      line-height: 5px;
      /* font-weight: 700; */
      /* text-transform: uppercase; */
      font-size: 14px;
      margin-top: 49%;
    }
  }
}


.imageCaption {

  top: 0;
  text-align: center;
  margin-top: 0;
  font-family: ${dante_font_family_sans};
  letter-spacing: 0;
  font-weight: 400;
  font-size: 13px;
  line-height: 1.4;
  color: #ccc;
  outline: 0;
  z-index: 300;
  margin-top: 10px;
  position:relative;

  .danteDefaultPlaceholder{
    margin-bottom: -18px !important;
    display: block;
  }
}

div[contenteditable="false"] {
  .danteDefaultPlaceholder{
    display:none;
  }
}

@media (max-width: 1200px) {
  .imageCaption,
  .postField--outsetCenterImage > .imageCaption {
    position: relative;
    width: 100%;
    text-align: center;
    left: 0;
    margin-top: 10px;
  }
}

figure.graf--layoutOutsetLeft {
  .imageCaption,
  .postField--outsetCenterImage > .imageCaption {
    position: relative;
    width: 100%;
    text-align: center;
    left: 0;
    margin-top: 10px;
  }
}

figure.is-defaultValue .imageCaption,
.graf--sectionCaption.is-defaultValue {
  display: none;
}

.graf--figure.is-mediaFocused .imageCaption,
.graf--figure.is-defaultValue.is-selected .imageCaption,
section.is-mediaFocused .graf--sectionCaption,
.graf--sectionCaption.is-defaultValue.is-selected {
  display: block;
}


.graf.graf--mixtapeEmbed {


  border-color: rgba(0,0,0,0.15);
  border-radius: 5px;
  border-style: solid;
  border-width: 1px;
  box-sizing: border-box;
  color: rgba(0,0,0,0.6);
  font-family: ${dante_font_family_sans};
  font-size: 10px;
  font-style: normal;
  font-weight: 300;
  -webkit-letter-spacing: -0.02em;
  -moz-letter-spacing: -0.02em;
  -ms-letter-spacing: -0.02em;
  letter-spacing: -0.02em;
  margin-bottom: 40px;
  margin-top: 40px;
  max-height: 291px;
  overflow: hidden;
  padding: 11px;
  position: relative;
  background: #fff;
  border-width: 0;

  .is-postEditMode iframe {
      border: 3px solid rgba(255, 255, 255, 0);
  }

  .mixtapeImage {
      background-position: center center;
      background-repeat: no-repeat;
      background-size: cover;
      float: right;
      height: 310px;
      margin: -30px -30px 0 25px;
      width: 116px;
  }

  .mixtapeImage--empty {
      height: 0;
      width: 0;
  }

  .markup--mixtapeEmbed-strong {
      color: #000;
      display: block;
      font-family: $dante-font-family-sans;
      font-size: 24px;
      font-style: normal;
      font-weight: 300;
      letter-spacing: -0.02em;
      line-height: 1.2;
      margin-bottom: 0px;
  }

  .markup--mixtapeEmbed-em {
    display: block;
    font-size: 17px;
    font-style: normal;
    margin-bottom: 10px;
    max-height: 120px;
    overflow: hidden;
  }
}

`

export default Container