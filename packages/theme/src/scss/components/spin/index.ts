import { GlobalStaticConfig } from "@lun/components";
import { processStringStyle } from "../../../utils";
import style from './index.scss?inline';

export function importSpinStyle() {
  GlobalStaticConfig.styles.spin.push(processStringStyle(style));
}