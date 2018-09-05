/**
 * Queue is a TypeScript adapatation of the queue written by Kate Morley - http://code.iamkate.com/
 */

export class Queue {
    private queue: Array<any> = [];
    private offset: number = 0;

    public getLength(): number {
        return (this.queue.length - this.offset);
    }

    public isEmpty(): boolean {
        return (this.queue.length === 0);
    }

    public enqueue(item: any): void {
        this.queue.push(item);
    }

    public dequeue(): any {
        if (this.isEmpty()) {
            return undefined;
        }

        let item = this.queue[this.offset];

        if (++ this.offset  * 2 >= this.queue.length) {
            this.queue = this.queue.slice(this.offset);
            this.offset = 0;
        }

        return item;
    }

    public peek(): any {
        return (this.isEmpty() ? undefined : this.queue[this.offset]);
    }
}