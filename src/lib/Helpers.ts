export class Helper {
    constructor(public commandPrefix: string) {}

    public getCommand(input: string): string {
        return input.replace(this.commandPrefix, "").split(" ")[0];
    }

    public isCommand(input: string): boolean {
        return (input.toLowerCase().substr(0, this.commandPrefix.length) === this.commandPrefix) && (this.getCommand(input).length > 0);
    }

    public isNumber(input: any): boolean {
        return !isNaN(parseFloat(input)) && isFinite(input);    
    }
}