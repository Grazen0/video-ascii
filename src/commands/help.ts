import Command from '../structures/command';

export const help: Command = {
	name: 'help',
	description: 'Shows help',
	usage: '(command)',
	execute(args) {
		console.log('Help command');
	},
};
