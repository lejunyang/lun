// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

import { mount } from 'cypress/vue';

import { ComponentKey, GlobalStaticConfig, VueElement, defineAllComponents } from '@lun/components';
import {
  importAllColors,
  importBasicTheme,
  importCommonTheme,
  importGhostTheme,
  importOutlineTheme,
  importSoftTheme,
  importSolidTheme,
  importSurfaceTheme,
} from '@lun/theme';
import { createElement } from '@lun/utils';
import { ComponentInternalInstance } from 'vue';

// import { getContainerEl } from 'cypress/mount-utils';
// not able to import from cypress/mount-utils, [vite] Internal server error: No known conditions for "./mount-utils" specifier in "cypress" package

export const ROOT_SELECTOR = '[data-cy-root]';
/**
 * Gets the root element used to mount the component.
 * @returns {HTMLElement} The root element
 * @throws {Error} If the root element is not found
 */
export const getContainerEl = () => {
  const el = document.querySelector(ROOT_SELECTOR);
  if (el) {
    return el;
  }
  throw Error(
    `No element found that matches selector ${ROOT_SELECTOR}. Please add a root element with data-cy-root attribute to your "component-index.html" file so that Cypress can attach your component to the DOM.`,
  );
};

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      l: <T extends VueElement = VueElement>(
        componentName: ComponentKey,
        props?: Record<string, any> & { children?: (ComponentKey | [ComponentKey, Record<string, any>])[] },
      ) => Bluebird.Promise<
        {
          ce: T;
          shadow: ShadowRoot;
          vm: ComponentInternalInstance;
        } & [T, ShadowRoot, ComponentInternalInstance]
      >;
    }
  }
}

Cypress.Commands.add('mount', mount);

const lunId = '__lun__element__';
const cleanup = () => {
  Cypress.$(`#${lunId}`).remove();
};
Cypress.Commands.add('l', (componentName, props) => {
  if (!(componentName in GlobalStaticConfig.defaultProps)) {
    console.warn(`Component ${componentName} is not defined.`);
    return;
  }
  const wholeTagName = GlobalStaticConfig.namespace + '-' + componentName;
  cleanup();
  importAllColors();
  importCommonTheme();
  importBasicTheme();
  importSurfaceTheme();
  importOutlineTheme();
  importSolidTheme();
  importSoftTheme();
  importGhostTheme();
  defineAllComponents();
  return Cypress.Promise.resolve(customElements.whenDefined(wholeTagName)).then(() => {
    const container = getContainerEl();
    const ce = createElement(wholeTagName as any, {
      ...props,
      id: lunId,
    });
    container.append(ce);
    return {
      ce,
      shadow: ce.shadowRoot!,
      get vm() {
        return (ce as any)._instance as ComponentInternalInstance;
      },
      [Symbol.iterator]: function* () {
        yield this.ce;
        yield this.shadowRoot;
        yield this.vm;
      },
    } as any;
  });
});
