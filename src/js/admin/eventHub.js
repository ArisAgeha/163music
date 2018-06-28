module.exports = {
    events: {
        
    },

    emit(eventType, data) {
        this.events[eventType].map((fn) => {
            fn.call(undefined, data);
        })
    },

    on(eventType, cb) {
        this.events[eventType] = this.events[eventType]? this.events[eventType] : [];
        this.events[eventType].push(cb);
    }
}
