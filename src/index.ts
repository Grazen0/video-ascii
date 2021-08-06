import minimist from 'minimist';
import * as commands from './commands';
import { RUN_COMMAND } from './constants';
import Command from './structures/command';

const procArgv = process.argv;
const argv = minimist(procArgv.slice(procArgv[0] === RUN_COMMAND ? 1 : 2))._;

const [input = 'help', ...args] = argv;

const command = (commands as Record<string, Command>)[input];

if (!command) {
	console.log(`Incorrect command. Use "${RUN_COMMAND} help" for more info.`);
	process.exit(0);
}

command.execute(args).catch(console.error);
