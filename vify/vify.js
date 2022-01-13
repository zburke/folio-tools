import { exec } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

import simpleGit from 'simple-git';
import { Octokit } from '@octokit/core';

class Vify {

  /** GitHub Personal access token; see https://github.com/settings/tokens */
  GITHUB_TOKEN = 'YOUR_TOKEN_HERE';

  /** GitHub username */
  GITHUB_USERNAME = 'YOUR_USERNAME_HERE';

  async main()
  {
    try {
      const git = simpleGit({
        baseDir: process.cwd(),
        binary: 'git',
        maxConcurrentProcesses: 6,
      });

      // get origin URL, e.g. git@github.com:folio-org/ui-users.git
      const origin = (await git.getRemotes(true)).find(r => r.name == 'origin');
      const originUrl = origin.refs.fetch;

      // get repo from originUrl, e.g. ui-users
      const slashOffset = originUrl.lastIndexOf('/') + 1;
      const dotOffset = originUrl.lastIndexOf('.git');
      const repo = originUrl.substring(slashOffset, dotOffset);

      // get current repo branch, e.g. UIU-123
      const br = (await git.branchLocal()).current;

      // get current module by removing "ui-" prefix, e.g. users
      const module = repo.substring(3);

      // github username
      const user = this.GITHUB_USERNAME;

      const tempdir = await fs.mkdtemp(os.tmpdir());
      console.log(`cloning into ${tempdir} ...`)
      await git.clone(`git@github.com:${user}/platform-complete.git`, tempdir, { '--single-branch': true, '--branch': 'snapshot' });

      // git: clone @user/platform-complete
      const pgit = simpleGit({
        baseDir: tempdir,
        binary: 'git',
        maxConcurrentProcesses: 6,
      });
      // git: branch platform-complete, e.g. /zburke/platform-complete/tree/UIU-123
      await pgit.checkoutLocalBranch(br);

      // patch platform-branch's okapi URL in stripes.config.js to folio-snapshot-okapi.dev.folio.org
      console.log(`updating package.json ...`)
      const pkgPath = path.join(tempdir, 'package.json');
      const pkg = await fs.readFile(pkgPath, 'utf-8');
      const re = new RegExp(`"@folio/${module}": "([^"]+)"`, 'm');
      const pkgUpdated = pkg.replace(re, `"@folio/${module}": "folio-org/ui-${module}#${br}"`);
      await fs.writeFile(pkgPath, pkgUpdated);

      // patch platform-branch's okapi URL in stripes.config.js to folio-snapshot-okapi.dev.folio.org
      console.log('updating stripes.config.js ...')
      const stripesPath = path.join(tempdir, 'stripes.config.js');
      const stripes = await fs.readFile(stripesPath, 'utf-8');
      const stripesUpdated = stripes.replace("http://localhost:9130", "https://folio-snapshot-okapi.dev.folio.org");
      await fs.writeFile(stripesPath, stripesUpdated);

      console.log('committing changes ...')
      await pgit.add(['package.json', 'stripes.config.js']);
      await pgit.commit(`committing ${repo}#${br}`, ['package.json', 'stripes.config.js']);

      console.log('pushing the branch ...')
      await pgit.push('origin', br);

      // git: open PR against @user/platform-complete
      console.log('creating PR ...')
      const octokit = new Octokit({
        auth: this.GITHUB_TOKEN,
      });

      await octokit.request(`POST /repos/{owner}/{repo}/pulls`, {
        owner: user,
        repo: 'platform-complete',
        head: br,
        base: 'snapshot',
        title: br
      })

      // cleanup
      console.log('cleaning up ...')
      await fs.rm(tempdir, { recursive: true });
      console.log('done!')
    }
    catch(e) {
      console.error(e);
    };
  }
}

(new Vify()).main();
