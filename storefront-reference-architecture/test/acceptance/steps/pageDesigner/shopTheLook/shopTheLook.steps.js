const { I, data, pageDesigner } = inject();

Then('shopper should see the shop the look component', () => {
    I.waitForElement(pageDesigner.locators.shopTheLookContainer);
    I.seeElement(pageDesigner.locators.shopTheLookContainer);
});

Then('shopper should see the title when hover over image', () => {
    I.moveCursorTo(pageDesigner.locators.shopTheLookImage);
    I.see(data.pageDesigner.shopTheLookOverlayText, pageDesigner.locators.shopTheLookOverlayText);
    I.see(data.pageDesigner.shopTheLookSetItems, pageDesigner.locators.shopTheLookSetItems);
    I.see(data.pageDesigner.shopTheLookButton, pageDesigner.locators.shopTheLookButton);
});

Then('shopper should not see the setItem when hover over image on product', () => {
    I.moveCursorTo(pageDesigner.locators.shopTheLook4thImage);
    I.see(data.pageDesigner.shopTheLookProductName, pageDesigner.locators.shopTheLookProductName);
    I.dontSeeElement(pageDesigner.locators.shopTheLook4thSetItems);
    I.see(data.pageDesigner.shopTheLookButton, pageDesigner.locators.shopTheLook4thButton);
});
