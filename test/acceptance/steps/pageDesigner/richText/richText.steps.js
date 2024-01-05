const { I, data, pageDesigner } = inject();

Then('shopper should see the rich text component', () => {
    I.waitForElement(pageDesigner.locators.richText);
    I.seeElement(pageDesigner.locators.richText);
});

Then('shopper should see the title', () => {
    let richTextElement = locate(pageDesigner.locators.richText).at(1);
    let title = richTextElement.find(pageDesigner.locators.richTextTitle);
    I.see(data.pageDesigner.richTextTitle, title);
});
