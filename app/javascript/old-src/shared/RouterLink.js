import React from 'react'
import {
  Link as RouterLink
} from 'react-router-dom'


import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Link from '@material-ui/core/Link'

const AdapterLink = React.forwardRef((props, ref) => <RouterLink innerRef={ref} {...props} />);

export const LinkButton = props => <Button {...props} component={Link} />;
export const LinkIconButton = props => <IconButton {...props} component={Link} />;
export const AnchorLink = props => <Link {...props} component={AdapterLink} to={props.to}> {props.children} </Link>