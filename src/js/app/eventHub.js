module.exports = {
    events: {
        
    },

    emit(eventType, data) {
        if (this.events[eventType]) {
            this.events[eventType].map((fn) => {
                return fn.call(undefined, data);
            })
        }
    },

    on(eventType, cb) {
        this.events[eventType] = this.events[eventType]? this.events[eventType] : [];
        this.events[eventType].push(cb);
    }
}
