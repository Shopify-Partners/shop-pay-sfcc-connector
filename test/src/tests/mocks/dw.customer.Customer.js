class Customer {
    constructor() {
        this.ID = 8575309;
        this.authenticated = 'true';
        this.registered = true;
        this.profile = {
            custom: {
                vipAccountId: '6298769367750939',
                isEmployee: false
            },
            email: 'qa-test@gmail.com',
            firstName: 'John',
            lastName: 'Snow',
            credentials: {
                createResetPasswordToken: () => {
                    return 'token';
                },
                setPasswordWithToken: () => {
                    return true;
                }
            },
            getEmail: () => {
                return this.email;
            }
        };
        this.authenticated = false;
        this.isAuthenticated = () => {
            return this.authenticated;
        };
    }
    getProfile() {
        return this.profile;
    }
}

module.exports = Customer;
