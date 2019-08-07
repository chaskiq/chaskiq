import React from 'react'
import {
  Link as RouterLink
} from 'react-router-dom'

import {
  IconButton,
  Button,
  Link
} from '@material-ui/core'

const AdapterLink = React.forwardRef((props, ref) => <RouterLink innerRef={ref} {...props} />);

export const LinkButton = props => <Button {...props} component={Link} />;
export const LinkIconButton = props => <IconButton {...props} component={Link} />;
export const AnchorLink = props => <Link component={AdapterLink} to={props.to}> {props.children} </Link>