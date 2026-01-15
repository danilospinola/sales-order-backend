import { join } from 'path';
import moduleAlias from 'module-alias';

const baseDir = join(__dirname, '..');

moduleAlias.addAliases({
  '@': baseDir,
  '@cds-models': join(__dirname, '../../@cds-models'),
  '@models': join(baseDir, 'models'),
  '@controllers': join(baseDir, 'controllers'),
  '@services': join(baseDir, 'services'),
  '@repositories': join(baseDir, 'repositories'),
  '@factories': join(baseDir, 'factories'),
  '@configs': join(baseDir, 'configs'),
});