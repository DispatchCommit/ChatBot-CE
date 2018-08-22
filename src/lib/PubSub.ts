export class PubSub {
    private topics: { [index: string] : Array<any>} = {};

    public subscribe(topic: string, listener: Function) {
        if (!this.topics.hasOwnProperty.call(this.topics, topic)) {
            this.topics[topic] = [];
        }

        let index = this.topics[topic].push(listener) - 1;

        return {
            remove: () => {
                delete this.topics[topic][index];
            }
        }
    }

    public publish(topic: string, data: Object) {
        if (!this.topics.hasOwnProperty.call(this.topics, topic)) {
            return;
        }

        data = ((data !== undefined && data !== null) ? data : {});

        if (this.topics[topic].length === 1) {
            return this.topics[topic][0](data);
        }

        this.topics[topic].forEach((listener: Function) => {
            listener(data);
        });
    }
}