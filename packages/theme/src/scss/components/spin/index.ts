import { GlobalStaticConfig, processStringStyle } from "@lun/components";
import style from './index.scss?inline';

export function importSpinStyle() {
  GlobalStaticConfig.styles.spin.push(processStringStyle(style));
}