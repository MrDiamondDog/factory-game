export class EventEmitter {
    events: {
        [key: string]: Function[];
    };

    constructor() {
        this.events = {};
    }

    on(eventName: string, callback: Function) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }

        this.events[eventName].push(callback);
    }

    emit(eventName: string, ...args: any[]) {
        if (!this.events[eventName]) {
            return;
        }

        this.events[eventName].forEach(callback => {
            callback(...args);
        });
    }

    off(eventName: string, callback: Function) {
        if (!this.events[eventName]) {
            return;
        }

        this.events[eventName] = this.events[eventName].filter(cb => {
            return cb !== callback;
        });
    }

    clear() {
        this.events = {};
    }

    once(eventName: string, callback: Function) {
        const onceCallback = (...args: any[]) => {
            callback(...args);
            this.off(eventName, onceCallback);
        };

        this.on(eventName, onceCallback);
    }
}
