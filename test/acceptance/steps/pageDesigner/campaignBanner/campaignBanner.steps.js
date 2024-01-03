const { I, data, pageDesigner } = inject();

Then('shopper should see the campaign banner', () => {
    I.waitForElement(pageDesigner.locators.campaignBanner);
    I.seeElement(pageDesigner.locators.campaignBannerMessage);
});

Then('shopper should see the campaign banner message', () => {
    I.see(data.pageDesigner.campaignBannerMessage, pageDesigner.locators.campaignBannerMessage);
});


Then('shopper should see a close button on campaign banner', () => {
    I.seeElement(pageDesigner.locators.campaignBannerCloseButton);
});

Then('shopper should be able to close the campaign banner', () => {
    I.click(pageDesigner.locators.campaignBannerCloseButton);
});

Then('shopper should no longer see the campaign banner', () => {
    I.dontSeeElement(pageDesigner.locators.campaignBanner);
});
