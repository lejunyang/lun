import type { iInput, InputEvents } from '@lun/components';

describe('Input', () => {
  it('type in input', () => {
    let value: string;
    const handlers: InputEvents = {
      onUpdate(e) {
        value = e.detail;
      },
    };
    const spy = cy.spy(handlers, 'onUpdate');
    cy.l<iInput>('input', handlers).then(([ce]) => {
      ce.focus();
      cy.wrap(ce.input)
        .realType('Hello')
        .then(() => {
          expect(value).to.equal('Hello');
          expect(spy).to.be.callCount(5);
        });
    });
  });

  it('navigation and delete of multiple input through keyboard', () => {
    let removed: (string | number)[], value: any;
    const handlers: InputEvents = {
      onUpdate(e) {
        value = e.detail;
      },
      onTagsRemove(e) {
        removed = e.detail;
      },
    };
    const updateSpy = cy.spy(handlers, 'onUpdate'),
      removeSpy = cy.spy(handlers, 'onTagsRemove');
    cy.l('input', {
      multiple: true,
      value: [1, 2, 3],
      ...handlers,
    });

    // input should be focused
    cy.deepActive(true).should('have.prop', 'tagName', 'INPUT');
    cy.deepActive().realPress('ArrowLeft');
    // arrow left should move to previous tag
    cy.deepActive()
      .parent()
      .should('have.prop', 'tagName', 'L-TAG')
      .and('have.prop', 'label', '3')
      .realPress('ArrowLeft');
    // moved to tag2, then delete
    cy.deepActive()
      .parent()
      .should('have.prop', 'tagName', 'L-TAG')
      .and('have.prop', 'label', '2')
      .realPress('Backspace')
      .then(() => {
        expect(updateSpy).be.calledOnce;
        expect(removeSpy).be.calledOnce;
        expect(removed).be.deep.equal([2]);
        expect(value).be.deep.equal([1, 3]);
      });
    // after delete, tag3 should be focused
    cy.deepActive()
      .parent()
      .should('have.prop', 'tagName', 'L-TAG')
      .and('have.prop', 'label', '3')
      .realPress('ArrowRight');
    // arrow right should move to input
    cy.deepActive().should('have.prop', 'tagName', 'INPUT');
  });
});
