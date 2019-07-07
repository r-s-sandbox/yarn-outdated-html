# yarn-outdated-html

## Generate a HTML report for Yarn Outdated

## Install

```
$ yarn global add yarn-outdated-html
```

> This package uses async/await and requires Node.js 7.6

## Usage

To generate a report, run the following:

```
$ yarn outdated --json | yarn-outdated-html
```

By default the report will be saved to `yarn-outdated.html`

If you want to specify the output file, add the `--output` option:

```bash
yarn outdated --json | yarn-outdated-html --output report.html
```

If you want to exclude packages, add the `--excludes` option:

```bash
yarn outdated --json | yarn-outdated-html --excludes 'gulp, semver'
```

Inspired by [yarn-audit-html](https://github.com/davityavryan/yarn-audit-html) package.

## License

[MIT](LICENSE.md)