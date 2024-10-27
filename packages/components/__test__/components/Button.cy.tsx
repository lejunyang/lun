import { delay } from '@lun/utils';

describe('Button', () => {
  it('asyncHandler', () => {
    const props = { label: 'Button', asyncHandler: () => delay(20), onValidClick() {} };
    const spy = cy.spy(props, 'asyncHandler'),
      clickSpy = cy.spy(props, 'onValidClick');
    cy.l('button', props).then(([ce]) => {
      const button = ce.shadowRoot.firstElementChild as HTMLButtonElement;
      expect(button.tagName).to.equal('BUTTON');
      expect(ce.shadowRoot.querySelector('l-spin')).to.be.null;
      button.click();
      expect(spy).to.be.calledOnce;
      expect(clickSpy).to.be.calledOnce;
      button.click();
      expect(spy).to.be.calledOnce;
      expect(clickSpy).to.be.calledOnce;
      cy.wait(10).then(() => {
        expect(ce.shadowRoot.querySelector('l-spin')?.tagName).to.equal('L-SPIN');
        button.click();
        expect(spy).to.be.calledOnce;
        expect(clickSpy).to.be.calledOnce;
      });
      cy.wait(10).then(() => {
        expect(ce.shadowRoot.querySelector('l-spin')).to.be.null;
        button.click();
        expect(spy).to.be.calledTwice;
        expect(clickSpy).to.be.calledTwice;
      });
    });
  });
});
