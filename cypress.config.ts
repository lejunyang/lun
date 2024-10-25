import { defineConfig } from "cypress";
import setupCoverage from '@cypress/code-coverage/task'

export default defineConfig({
  component: {
    setupNodeEvents(on, config) {
      setupCoverage(on, config);
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    },
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
  },
});
