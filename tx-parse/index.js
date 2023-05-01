/**
 * tx-parse
 * calculate completeness of translations in current repo by comparison to en_US
 *
 * usage
 * `node path/to/tx-parse <repo-name>`
 * e.g. `node ~/bin/tx-parse ui-users`
 * Run this script at the root of a UI repository. Yes, yes, it's totally
 * possible to get the repo name by parsing the outpt from `git remote`
 * but that hasn't been implemented yet.
 *
 */

import { argv } from 'node:process';
import * as fs from 'node:fs';
import _ from 'lodash';

const repo = argv[2];

const localeFormat = (s) => _.padStart(s.substr(0, s.indexOf('.')), 6);
const nFormat = (n) => _.padStart(Math.floor(n), 3);

const locales = fs.readdirSync(`./translations/${repo}`, { withFileTypes: true });
const en = JSON.parse(fs.readFileSync(`./translations/${repo}/en_US.json`));
const count = Object.values(en).length;

locales.forEach(l => {
  if (l.isFile() && l.name !== 'en.json' && l.name !== 'en_US.json') {
    const locale = JSON.parse(fs.readFileSync(`./translations/${repo}/${l.name}`));
    // count intersecting values
    const int = Object.values(en).filter(v => Object.values(locale).includes(v)).length;

    console.log(`${localeFormat(l.name)} ${nFormat(((count - int) / count) * 100)}% ${count - int}/${count} `);
  }
});
