Feature: Forgot Password
    As a shopper, I want to be able to reset my password if I forgot my
    login information

@loginPage @forgotPassword 
    Scenario: Shopper is able to reset their password
        Given shopper goes to the Login Page
        When shopper clicks forgot password
        And shopper fills out their recovery email address
        Then shopper should see request to change password prompt
        # This is just half of the feature being tested with a dummy email
        # Requires manual testing with a real email