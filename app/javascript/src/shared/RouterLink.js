import React from 'react'
import {
  Link
} from 'react-router-dom'

import {
  IconButton,
  Button
} from '@material-ui/core'

export const LinkButton = props => <Button {...props} component={Link} />;
export const LinkIconButton = props => <IconButton {...props} component={Link} />;