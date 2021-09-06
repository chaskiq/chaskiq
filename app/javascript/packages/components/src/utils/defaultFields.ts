// TODO, deprecate this, use AppType#searchableFields
type DataProp = {
  name: string;
  type: string;
};

const defaultData: Array<DataProp> = [
  { name: 'name', type: 'string' },
  { name: 'first_name', type: 'string' },
  { name: 'last_name', type: 'string' },
  { name: 'email', type: 'string' },
  { name: 'lang', type: 'string' },
  { name: 'tags', type: 'string' },
  { name: 'phone', type: 'string' },
  //{ name: 'type', type: 'string' },
  { name: 'last_visited_at', type: 'date' },
  { name: 'referrer', type: 'string' },
  { name: 'state', type: 'string' },
  { name: 'ip', type: 'string' },
  { name: 'city', type: 'string' },
  { name: 'region', type: 'string' },
  { name: 'country', type: 'string' },
  { name: 'lat', type: 'string' },
  { name: 'lng', type: 'string' },
  { name: 'postal', type: 'string' },
  { name: 'web_sessions', type: 'string' },
  { name: 'timezone', type: 'string' },
  { name: 'browser', type: 'string' },
  { name: 'browser_version', type: 'string' },
  { name: 'os', type: 'string' },
  { name: 'os_version', type: 'string' },
  { name: 'browser_language', type: 'string' },
];

export default defaultData;
