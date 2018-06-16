import React from 'react';
import styled from 'styled-components';
import { Grid, GridColumn } from '@atlaskit/page';
import { gridSize } from '@atlaskit/theme';

const Padding = styled.div`
  //margin: ${gridSize() * 2}px ${gridSize() * 2}px;
  //padding-bottom: ${gridSize() * 3}px;
`;

export default ({ children }) => (
  <Grid>
    <GridColumn>
     <Padding>{children}</Padding>
     {/*children*/}
    </GridColumn>
  </Grid>
)