import React from "react";
import { Link } from "react-router-dom";

import Button from "../components/Button";

const AdapterLink = React.forwardRef((props, ref) => (
  <Link innerRef={ref} {...props} />
));

export const LinkButton = (props) => <Button {...props} component={Link} />;
// export const LinkIconButton = props => <IconButton {...props} component={Link} />;
export const AnchorLink = (props) => (
  <Link {...props} component={AdapterLink} to={props.to}>
    {" "}
    {props.children}{" "}
  </Link>
);
