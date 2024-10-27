import { getViteConfig } from '../../utils/getViteConfig';
import react from '@vitejs/plugin-react';

export default getViteConfig('@lun-web/react', {
  plugins: [react()],
});
