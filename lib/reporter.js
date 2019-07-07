const fs = require('fs');
const ejs = require('ejs');
const semver = require('semver');
const { promisify } = require('util');

const totalOutdatedPackages = (data) => {
    return Object.values(data).reduce((sum, next) => (sum + next.length), 0)
}

const bootstrapClassSeverityMap = {
    Major: 'danger',
    Minor: 'warning',
    Patch: 'secondary',
};

const generateTemplate = async (data, template) => {
    try {
        const readFile = promisify(fs.readFile);
        const htmlTemplate = await readFile(template, 'utf8');
        const reportDate = new Date();

        return ejs.render(htmlTemplate, {
            ...data,
            summary: {
                outdated: totalOutdatedPackages(data),
            },
            severityClass: (severity) => bootstrapClassSeverityMap[ severity ],
            formatDate: (dateStr) => (new Date(dateStr)).toLocaleString(),
            reportDate,
        });
    } catch (err) {
        throw err;
    }
};

const writeReport = async (report, output) => {
    try {
        const writeFile = promisify(fs.writeFile);
        await writeFile(output, report);
    } catch (err) {
        throw err;
    }
};

const sortPackages = packages => {
    const sortedPackages = {
      major : [],
      minor : [],
      patch : [],
    };

    packages.forEach((p) => {
      const current = p[1];
      const latest  = p[3];

      if (semver.major(current) !== semver.major(latest)) {
        sortedPackages.major.push(p);
      } else if (semver.minor(current) !== semver.minor(latest)) {
        sortedPackages.minor.push(p);
      } else if (semver.patch(current) !== semver.patch(latest)) {
        sortedPackages.patch.push(p);
      }
    });

    return sortedPackages;
  }

const extractOutdatedPackages = (json, excludes) => {
    const packages = (json.data && json.data.body) ? json.data.body : extractPackagesFromNpmOutdatedJSON(json);
    return packages
      .filter((p) => !p.slice(1, 3).includes('exotic'))
      .filter((p) => !excludes.includes(p[0]));
}

const extractPackagesFromNpmOutdatedJSON = json => {
    return Object.keys(json).map(packageName => {
      const info = json[packageName];
      return [
        packageName,
        npmVersionToYarnVersion(info.current),
        npmVersionToYarnVersion(info.wanted),
        npmVersionToYarnVersion(info.latest),
        info.type,
        null,
      ];
    });
}

const npmVersionToYarnVersion = version => {
    if (version === 'git') {
      return 'exotic';
    }
    return version;
}

module.exports = async (data, templateFile, outputFile, excludes) => {
    try {
        const packages = sortPackages(extractOutdatedPackages(data, excludes));
        const report = await generateTemplate(packages, templateFile);

        await writeReport(report, outputFile);
    } catch (err) {
        console.error(err);
    }
};