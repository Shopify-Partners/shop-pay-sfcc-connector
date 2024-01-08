const { I, pageDesigner } = inject();

Then('shopper should see the photo tile component', () => {
    I.waitForElement(pageDesigner.locators.photo);
    I.seeElement(pageDesigner.locators.photo);
});
