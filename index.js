#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const { promisify } = require('util');
const reporter = require('./lib/reporter');
const parse = require('./lib/parse');
const pkg = require('./package.json');

program
    .version(pkg.version)
    .option('-o, --output [output]', 'output file')
    .option('-t, --template [ejs file]', 'ejs template file')
    .option('-e, --excludes <items>', 'comma seperated package names to exclude');

const genReport = async (stdin, output = 'yarn-outdated.html', template, excludes = '') => {
    if (!stdin) {
      const readFile = promisify(fs.readFile);
      stdin = await readFile(`${__dirname}/templates/outdated.json`, 'utf8');
    }
    const json = parse(stdin);
    if (!json) {
      process.stderr.write('JSON parse failed...\n');
      process.exit(1);
    }

    const templateFile = template || `${__dirname}/templates/template.ejs`;

    reporter(json, templateFile, output, excludes)
        .then(() => {
            console.log(`Outdated snapshot saved at ${output}`);
            process.exit(0);
        })
        .catch((error) => {
            console.log('An error occurred!');
            console.error(error);
            process.exit(1);
        });
};

if (process.stdin.isTTY) {
    program.parse(process.argv);
} else {
    let stdin = '';
    process.stdin.on('readable', function () {
        const chunk = this.read();

        if (chunk !== null) {
            stdin += chunk;
        }
    });
    process.stdin.on('end', function () {
        program.parse(process.argv);

        genReport(stdin, program.output, program.template, program.excludes);
    });
}