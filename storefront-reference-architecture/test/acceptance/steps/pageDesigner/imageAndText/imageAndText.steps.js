const { I, data, pageDesigner, utilities } = inject();

Then('shopper should see the image and text component', () => {
    I.waitForElement(pageDesigner.locators.ITC);
    I.seeElement(pageDesigner.locators.ITC);
});

Then('shopper should see the overlay message', () => {
    let ITCElement = locate(pageDesigner.locators.ITC).at(1);
    let overlayText = ITCElement.find(pageDesigner.locators.ITCOverlay);
    I.see(data.pageDesigner.imageAndTextOverlayText, overlayText);
});

Then('shopper should go to new arrivals page clicking on the image', () => {
    utilities.clickToLoadPage(pageDesigner.locators.ITCImageLink, data.pageDesigner.imageAndTextNewArrival);
});

