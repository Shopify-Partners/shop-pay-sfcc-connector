Feature: Use a source code to land on a content page
    As a shopper I want to be able land on a content page using a sourcecode link


@sourceCodeRedirect
    Scenario: Shopper uses the src code to go to a content page
        Then shopper lands on the expected content page
        And shopper sees the expected content page
