import type { iPopover } from '@lun/components';

describe('Input', () => {
  it('auto attach by attr', () => {
    cy.l<iPopover>('popover', {
      autoAttachAttr: 'data-target',
      children: [
        ['l-button', { label: 'target1', 'data-target': 'target1', id: 'target1' }],
        ['l-button', { label: 'button2', id: 'default' }],
        ['l-button', { label: 'target2', 'data-target': 'target2', id: 'target2' }],
        ['div', { textContent: 'popover1', slot: 'target1', id: 'pop1' }],
        ['div', { textContent: 'popover2', slot: 'target2', id: 'pop2' }],
        ['div', { textContent: 'default', slot: 'pop-content', id: 'pop' }],
      ],
    }).then(([ce]) => {
      cy.get('#pop1').should('not.be.visible');
      cy.get('#pop2').should('not.be.visible');
      cy.get('#pop').should('not.be.visible');

      const options = { bubbles: true, composed: true };
      cy.get('#target1').trigger('mouseenter', options);
      cy.get('#pop1').should('be.visible');
      cy.get('#pop2').should('not.be.visible');
      cy.get('#pop').should('not.be.visible');

      cy.get('#default').trigger('mouseenter', options);
      cy.get('#pop1').should('not.be.visible');
      cy.get('#pop2').should('not.be.visible');
      cy.get('#pop').should('be.visible');

      cy.get('#target2').trigger('mouseenter', options);
      cy.get('#pop1').should('not.be.visible');
      cy.get('#pop2').should('be.visible');
      cy.get('#pop').should('not.be.visible');

      cy.get('#target2').click();
      cy.get('#pop1').should('not.be.visible');
      cy.get('#pop2').should('be.visible');
      cy.get('#pop').should('not.be.visible');
    });
  });
});
