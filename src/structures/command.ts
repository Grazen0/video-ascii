interface Command {
	name: string;
	description: string;
	usage?: string;
	execute(args: string[]): Promise<void>;
}

export default Command;
