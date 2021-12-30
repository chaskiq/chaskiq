export function allowedAccessTo(app, section, verb = 'read') {
  const userRole = app.currentAppRole;

  if (!userRole) return null;
  const roleName = userRole.name;

  const role_definition = app.availableRoles[roleName];
  const res =
    role_definition['manage'].includes('all') ||
    role_definition['manage'].includes(section) ||
    role_definition[verb].includes(section);

  console.log('PERMISSION CHECK FOR:', verb, section, res);
  return res;
  // you can disable this behavior by returning true
  //return true
}

function get(role_definition, role_name) {
  switch (role_definition[role_name]) {
    case null:
    case undefined:
      return [];
    default:
      return role_definition[role_name];
  }
}
