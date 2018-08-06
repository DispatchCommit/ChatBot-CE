export class Helper {
    /**
     * The Helper constructor.
     * 
     * @constructor
     * @param {string} commandPrefix The prefix that commands will start with.
     */
    constructor(public commandPrefix: string) {}

    /**
     * Get the command from the input.
     * 
     * @param {string} input The input to get command.
     * @returns {string}
     */
    public getCommand(input: string): string {
        return input.replace(this.commandPrefix, "").split(" ")[0];
    }

    /**
     * Check the input to see if a command exists.
     * 
     * @param {string} input The input to check.
     * @returns {boolean}
     */
    public isCommand(input: string): boolean {
        return (input.toLowerCase().substr(0, this.commandPrefix.length) === this.commandPrefix) && (this.getCommand(input).length > 0);
    }

    /**
     * Check and see if input is a number.
     * 
     * @param {any} input The input to check.
     * @returns {boolean}
     */
    public isNumber(input: any): boolean {
        return !isNaN(parseFloat(input)) && isFinite(input);    
    }

    /**
     * Check and see if the input has parameters.
     * 
     * @param {string} input The input to check.
     * @returns {boolean}
     */
    public hasParams(input: string): boolean {
        return this.numParams(input) > 0;
    }

    /**
     * Get the number of parameters from the input.
     * 
     * @param {string} input The input to check.
     * @returns {number}
     */
    public numParams(input: string): number {
        return input.split(" ").length-1;
    }

    /**
     * Get all the parameters from the input.
     * 
     * @param input The input to get parameters from.
     * @returns {string[]}
     */
    public getParams(input: string): string[] {
        let params = input.split(" ").slice(1);

        params = params.filter((element) => {
            return (element.length > 0 && element !== undefined && element !== null);
        });

        return params;
    }
}