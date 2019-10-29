import fs from 'fs';
import * as path from 'path';
import lessToJs from 'less-vars-to-js';

const getVariables = (filename) => {
  const content = fs.readFileSync(path.join(__dirname, `../src/style/${filename}`), 'utf8')
  return lessToJs(content);
}

export default {
  ...getVariables('antd/12px.less'),
  ...getVariables('antd/theme.less'),
  ...getVariables('variables.less'),
}
