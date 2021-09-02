import React from 'react';
import { Link } from 'react-router-dom';

import Button from './Button';

/* const AdapterLink = React.forwardRef((props, ref) => (
  <Link innerRef={ref} {...props} />
)) */

export const LinkButton = (props) => <Button {...props} component={Link} />;
// export const LinkIconButton = props => <IconButton {...props} component={Link} />;

type AnchorLinkType = {
  to?: string;
  children?: React.ReactChild;
  key?: any;
  color?: any;
  variant?: any;
  onClick?: any;
};

export const AnchorLink = ({ to, children, ...props }: AnchorLinkType) => (
  <Link
    {...props}
    // component={AdapterLink}
    to={to}
  >
    {' '}
    {children}{' '}
  </Link>
);
