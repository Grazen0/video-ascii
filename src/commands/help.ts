import { RUN_COMMAND } from '../constants';
import Command from '../structures/command';
import * as commands from './index';

export const help: Command = {
	name: 'help',
	description: 'Shows help',
	usage: '(command)',
	execute(args) {
		if (args.length === 0) {
			const list = Object.values(commands)
				.map(cmd => cmd.name)
				.sort();

			console.log(`Available commands: ${list.join(', ')}`);
		} else {
			const command = (commands as Record<string, Command>)[args[0]];
			if (!command) {
				console.log('Invalid command selected');
			} else {
				console.log(`${command.name} command`.toUpperCase());
				console.log(command.description);
				console.log(`Usage: ${RUN_COMMAND} ${command.name} ${command.usage}`);
			}
		}
	},
};
