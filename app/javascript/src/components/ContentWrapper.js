import React from 'react';
import styled from '@emotion/styled';
/*import { Grid, GridColumn } from '@atlaskit/page';
import { gridSize } from '@atlaskit/theme';

const Padding = styled.div`
  margin: ${gridSize() * 2}px ${gridSize() * 2}px;
  padding-bottom: ${gridSize() * 3}px;
`;

export default ({ children }) => (
  <Grid>
    <GridColumn>
     <Padding>{children}</Padding>
    </GridColumn>
  </Grid>
)*/

export default ({ children }) => (
  <div id="awe" >{children}</div>
)