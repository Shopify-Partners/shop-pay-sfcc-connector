class Calendar {
    constructor(date = new Date()) {
        this.date = date
    }
    static get DAY_OF_MONTH() { return 5 }
    static get HOUR_OF_DAY() { return 1 }
    static get MINUTE() { return 12 }
    static get SECOND() { return 13 }

    add(field, value) {
        switch (field) {
            case Calendar.DAY_OF_MONTH:
                this.date.setDate(this.date.getDate() + value);
                break;
            case Calendar.HOUR_OF_DAY:
                this.date.setHours(this.date.getHours() + value);
                break;
            case Calendar.MINUTE:
                this.date.setMinutes(this.date.getMinutes() + value);
                break;
            case Calendar.SECOND:
                this.date.setSeconds(this.date.getSeconds() + value);
                break;

            default:
                throw new Error(`Unsupported field: ${field}`)
        }
    }

    get(field) {
        switch (field) {
            case Calendar.HOUR_OF_DAY:
                return this.date.getHours();
            default:
                return null;
        }
    }

    set(field, value) {
        switch (field) {
            case Calendar.HOUR_OF_DAY:
                this.date.setHours(value);
                break;
            case Calendar.MINUTE:
                this.date.setMinutes(value);
                break;
            case Calendar.SECOND:
                this.date.setSeconds(value);
                break;
            default:
        }
    }

    formatDate() {
        const year = this.date.getFullYear()
        const month = String(this.date.getMonth() + 1).padStart(2, '0')
        const day = String(this.date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    getTime() {
        return this.date;
    }

    setFirstDayOfWeek() {
        this.firstDayOfWeek = 2;
    }
}

module.exports = Calendar;
