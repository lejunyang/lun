import { getViteConfig } from '../../utils/getViteConfig';
import react from '@vitejs/plugin-react';

export default getViteConfig('@lun/react', {
  plugins: [react()],
});
