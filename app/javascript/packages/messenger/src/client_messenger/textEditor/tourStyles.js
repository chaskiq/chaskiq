

import styled from '@emotion/styled'
import EditorContainer from 'Dante2/package/esm/editor/styled/base'

export const EditorStylesExtend = styled(EditorContainer)`
@import url('https://fonts.googleapis.com/css?family=Inter:100,200,300,400,500,600,700,800,900&display=swap');

font-family: 'Inter', sans-serif;

line-height: ${() => '2em'};
font-size: ${() => '1.2em'};

.graf--p {
	line-height: ${() => '2em'};
	font-size: ${() => '1.2em'};
	margin-bottom: 0px;
}

.dante-menu {
	z-index: 2000;
}

blockquote {
	margin-left: 20px;
}
`