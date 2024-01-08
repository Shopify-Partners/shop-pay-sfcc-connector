Feature: Use a source code to land on a pdp page
    As a shopper I want to be able land on a pdp page using a sourcecode link


@sourceCodeRedirect
    Scenario: Shopper uses the src code to go to a pdp
        Then shopper lands on the expected pdp
        And shopper sees all the product related information v2
