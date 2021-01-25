const { exec } = require("child_process");
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const axios = require("axios");
const fs = require('fs');

/**
 * Create tickets for all jira projects associated with packages in
 * the given package.json file. Link them to an existing ticket.
 */
class JSpam {
  /**
   * retrieve an attribute from the MacOS security service
   */
  getAttr(name, field)
  {
    return new Promise((res, rej) => {
      exec(`security find-generic-password -s "${name}" | grep "${field}" | cut -d\\" -f 4`, (error, stdout, stderr) => {
        if (error) {
          rej(error);
        }
        res(stdout);
      });
    });
  }


  /**
   * retrieve a password from the MacOS security service
   */
  getPassword(name, field)
  {
    return new Promise((res, rej) => {
      exec(`security find-generic-password -s "${name}" -a "${field}" -w`, (error, stdout, stderr) => {
        if (error) {
          rej(error);
        }
        res(stdout);
      });
    });
  }


  getSecurityServiceCredentials()
  {
    const credentials = {  };
    return this.getAttr('jira-password', 'acct')
    .then(username => {
      credentials.username = username.trim();
      return credentials.username;
    })
    .then(username => this.getPassword('jira-password', username))
    .then(password => {
      credentials.password = password.trim();
      return credentials;
    });
  }


  /**
   * getCredentials
   * get creds from CLI, or security service
   */
  getCredentials(argv)
  {
    return new Promise((res, rej) => {
      if (argv.username && argv.password) {
        res({
          username: argv.username,
          password: argv.password,
        });
      }
      else {
        return this.getSecurityServiceCredentials()
        .then(credentials => res(credentials))
        .catch(e => {
          rej('could not find credentials', e);
        });
      }
    });
  }


  createTicket(summary, description, project)
  {
    const body = {
      "fields": {
        project: { id: project.id },
        summary,
        description,
        issueType: { id: this.taskType.id },
      }
    };

    return axios.post(`${this.jira}/rest/api/2/issue`, body, {
      auth: this.credentials,
    });
  }


  linkTicket(inward, outward)
  {
    const body = {
      "outwardIssue": {
        "key": outward.key,
      },
      "inwardIssue": {
        "key": inward.key,
      },
    };

    return axios.post(`${this.jira}/rest/api/2/issueLink`, body, {
      auth: this.credentials,
    });
  }


  parseArgv()
  {
    return yargs(hideBin(process.argv))
      .usage('Usage: $0 --summary <s> --description <d> --link <JIRA-123> --package <package.json>')

      .alias('u', 'username')
      .describe('u', 'username')

      .alias('p', 'password')
      .describe('p', 'password')

      .alias('s', 'summary')
      .describe('s', 'issue summary (title)')

      .alias('d', 'description')
      .describe('d', 'issue description')

      .alias('l', 'link')
      .describe('l', 'jira issue[s] to link to')

      .describe('package', 'path to a package.json file to parse')

      .demandOption(['s', 'd', 'l', 'package'])
      .help('h')
      .alias('h', 'help')
      .argv;
  }


  /**
   * eachPromise
   * iterate through an array of items IN SERIES, applying the given async
   * function to each.
   * @arg [] arr array of elements
   * @arg function fn function to apply to each element
   * @return promise
   */
  eachPromise(arr, fn)
  {
    if (!Array.isArray(arr)) return Promise.reject(new Error('Array not found'));
    return arr.reduce((prev, cur) => (prev.then(() => fn(cur))), Promise.resolve());
  };


  async main()
  {
    this.jira = 'https://issues.folio.org';

    // const contents = JSON.parse(fs.readFileSync(filename, { encoding: 'UTF-8'}));
    //
    // jspam --username --password
    //    --link SOME-JIRA -l OTHER-JIRA
    //    --summary "some title"
    //    --description "some description"
    //    --package ./path/to/some/package.json
    try {
      this.argv = this.parseArgv();
      this.credentials = await this.getCredentials(this.argv);

      this.types = await axios.get(`${this.jira}/rest/api/2/issuetype`);
      this.taskType = this.types.data.find(type => type.name === 'Task');

      this.linkTypes = await axios.get(`${this.jira}/rest/api/2/issueLinkType`);
      this.relatesLink = this.linkTypes.data.issueLinkTypes.find(link => link.name === 'Relates');

      // get ticket from Jira
      const link = await axios.get(`${this.jira}/rest/api/2/issue/${argv.link}`)

      // parse package.json file
      const contents = JSON.parse(fs.readFileSync(this.argv.package, { encoding: 'UTF-8'}));
      const deps = Object.keys(contents.dependencies)
        .filter(p => p.startsWith('@folio/'))
        .map(p => `ui-${p.substring(p.indexOf('/') + 1 )}`);

      // get projects from JIRA
      axios.get(`${this.jira}/rest/api/2/project`)
      .then(projects => {
        const pmap = {};
        projects.data.forEach(p => { pmap[p.name] = p; });

        this.eachPromise(deps, d => {
          if (pmap[d]) {
            // this.createTicket(argv.summary, argv.description, pmap[d])
            // .then(ticket => this.linkTicket(ticket, link));

            console.log(`creating a ${d} ticket (${pmap[d].key} / ${pmap[d].id})`)
          }
        });
      })
    }
    catch(e) {
      console.error(e);
    };
  }
}

(new JSpam()).main();
