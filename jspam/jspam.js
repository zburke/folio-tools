import { exec } from 'child_process';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import axios from 'axios';
import fs from 'fs';
import { parse } from 'node-html-parser';
import { exit } from 'process';

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
    return this.getAttr('jira-apitoken', 'acct')
    .then(username => {
      credentials.username = username.trim();
      return credentials.username;
    })
    .then(username => this.getPassword('jira-apitoken', username))
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

  /**
   * getMatrix
   * retrieve and parse the team-project responsibility matrix from the given URL.
   * transpose it to an object keyed by the project's github name.
   * @param {*} matrixUrl
   */
  async getMatrix(matrixUrl)
  {
    const modules = {};
//     const matrix = (await axios.get(matrixUrl)).data;
//
//     console.log( matrix );
    const matrix = fs.readFileSync('./matrix.html', { encoding: 'UTF-8' });

    const userFromTd = (td) => {
      let name = td.querySelector ? td.querySelector('a')?.getAttribute('data-username')?.trim() : null;
      if (name) {
        name = name.replace(/\s+/g, ' ');
      }
      return name;
    }

    const container = parse(matrix).querySelector('.confluenceTable');
    const rows = Array.from(container.querySelectorAll('tbody tr'));
    rows.forEach((tr, i) => {
      const tds = Array.from(tr.querySelectorAll('td'));
      const team = { team: '', po: '', tl: '', github: '', jira: '' };
      // I don't really know what kind of data structure `tds` is.
      // iterating with (td, j) works just fine, but trying to access tds[j] fails.
      tds.forEach((td, j) => {
        if (j == 0) team.jira = td.text?.trim();
        if (j == 1) team.team = (td.text?.trim()).split(/\n/)[0].trim();
        if (j == 2) team.po = userFromTd(td);
        if (j == 3) team.tl = userFromTd(td);
        // there is no rule 4
        if (j == 5) team.github = td.text?.trim();
      });

      if (team.github) {
        modules[team.github] = team;
      }
    });

    return modules;
  }

  /**
   * timeout
   * Resolve after 200ms to avoid Atlassian rate limiting
   * https://developer.atlassian.com/cloud/jira/platform/rate-limiting/
   *
   * @return Promise
   */
  timeout()
  {
    return new Promise(res => {
      setTimeout(() => res(), 200);
    });
  }

  /**
   * teamForName
   * provide a map from team-name (in the team-project responsibility matrix)
   * to its ID in Jira.
   *
   * astonishingly, custom-field value-lists are not accessible via the API
   * without admin-level access. I don't get it.
   * @param {*} name
   */
  teamForName(name)
  {
    const teams = {
      "@cult": 10138,
      "Aggies": 10139,
      "Bama": 10140,
      "Bienenvolk": 10141,
        "Bienenvolk (fka ERM)": 10141,
        "Bienenvolk (fka ERM Delivery)": 10141,
        "ERM Subgroup Dev Team": 10141,
        "ERM Delivery": 10141,
      "Citation": 10142,
      "Core: Platform": 10144,
        "Core Platform": 10144,
      "Corsair": 10145,
      "EBSCO - FSE": 10147,
      "Eureka": 10149,
      "Dreamliner": 10150,
      "Firebird": 10152,
        "Firebird team": 10152,
      "Folijet": 10153,
        "Folijet team": 10153,
      "FOLIO DevOps": 10155,
      "Frontside": 10156,
      "Gutenberg": 10158,
      "K-Int": 10159,
      "Kinetics": 10160,
      "Kitfox": 10161,
      "Lehigh": 10162,
        "NSIP(Lehigh)": 10162,
      "Leipzig": 10163,
      "Mjolnir": 10164,
      "MOL": 10165,
      "Mriya": 10166,
      "NLA": 10167,
      "Odin": 10169,
      "Other dev": 10170,
      "PTF": 10172,
      "Qulto": 10173,
      "Reporting": 10174,
      "Reservoir Dogs": 10175,
      "Scanbit": 10176,
      "Scout": 10177,
      "Sif": 10178,
      "Siphon": 10179,
      "Spitfire": 10180,
        "Spitfire Team": 10180,
      "Spring Force": 10181,
      "Stacks": 10182,
      "Stripes Force": 10183,
      "Thor": 10184,
      "Thunderjet": 10185,
        "Thunderjet Team": 10185,
      "UNAM": 10186,
      "Vega": 10187,
        "Vega Team": 10187,
      "Volaris": 10188,
      "Nighthawk": 10495,

//       "Prokopovych": 10302,
//         "Core functional team": 10302,
//         "Prokopovych (Core: Functional)": 10302,
//         "Prokopovych (Core functional) team": 10302,
//         "Core: Functional": 10302,
//         "Prokopovych Team": 10302,
//         "Prokopovych team": 10302,
    };

    let team = null;

    // even if we _don't_ have a project for the given name, we still
    // resolve, not reject, because we still want to create the ticket;
    // it just won't be assignable to a team.
    return this.timeout().then(() => {
      return new Promise((resolve, reject) => {
        if (teams[name]) {
          axios.get(`${this.jira}/rest/api/2/customFieldOption/${teams[name]}`)
            .then(res => {
              const team = res.data;
              team.id = `${teams[name]}`;

              resolve(team);
            });
        }
        else {
          console.warn(`Could not match team "${name}"`);
          resolve(null);
        }
      });
    });


  }


  createTicket({summary, description, project, epic, labels, team, cc, assignee})
  {
    const body = {
      "fields": {
        "project": { id: project.id },
        summary,
        description,
        issuetype: { id: this.taskType.id },
      }
    };

    if (epic) {
      body.fields.parent = { key: epic };
    }

    if (labels) {
      if (Array.isArray(labels)) {
        body.fields.labels = labels;
      } else {
        body.fields.labels = [labels];
      }
    }

    if (team) {
      body.fields.customfield_10057 = team;
    }

    if (cc && cc.length) {
      const attn = cc.map(i => `[~${i}]`).join(', ');
      body.fields.description += `\n\nAttn: ${attn}`;
    }

    if (assignee) {
      body.fields.assignee = assignee;
    }

    return axios.post(`${this.jira}/rest/api/2/issue`, body, {
      auth: this.credentials,
    })
  }


  linkTicket(inward, outward)
  {
    const body = {
      "outwardIssue": {
        "key": outward.data.key,
      },
      "inwardIssue": {
        "key": inward.data.key,
      },
      "type": this.relatesLink,
    };

    return axios.post(`${this.jira}/rest/api/2/issueLink`, body, {
      auth: this.credentials,
    });
  }


  parseArgv()
  {
    return yargs(hideBin(process.argv))
      .usage('Usage: $0 --summary <s> --description <d> --link <JIRA-123> --package <package.json>')

      .option('s', {
        alias: 'summary',
        describe: 'issue summary (title)',
        type: 'string',
      })

      .option('d', {
        alias: 'description',
        describe: 'issue description',
        type: 'string',
      })

      .option('p', {
        alias: 'package',
        describe: 'path to a package.json file to parse',
        type: 'string',
      })

      .option('l', {
        alias: 'link',
        describe: 'jira issue[s] to link to',
        type: 'string',
      })

      .option('e', {
        alias: 'epic',
        describe: 'jira parent issue (formerly epic)',
        type: 'string',
      })

      .option('a', {
        alias: 'assignee',
        describe: 'Jira user to assign the ticket to',
        type: 'string',
      })

      .option('label', {
        describe: 'jira label[s] to apply',
        type: 'string',
      })

      .option('team', {
        describe: 'assign tickets to teams per team-module-responsibility matrix',
        type: 'boolean',
      })

      .option('ccpo', {
        describe: 'CC the product owner per team-module-responsibility matrix in the ticket description',
        type: 'boolean',
      })

      .option('cctl', {
        describe: 'CC the tech lead per team-module-responsibility matrix in the ticket description',
        type: 'boolean',
      })

      .option('username', {
        describe: 'jira username',
        type: 'string',
      })

      .option('password', {
        describe: 'jira password',
        type: 'string',
      })

      .demandOption(['s', 'd', 'package'])
      .help('h')
      .alias('h', 'help')
      .argv;
  }


  /**
   * eachPromise
   * iterate through an array of items IN SERIES, applying the given async
   * function to each, with a delay between each element.
   * @arg [] arr array of elements
   * @arg function fn function to apply to each element
   * @return promise
   */
  eachPromise(arr, fn)
  {
    //
    if (!Array.isArray(arr)) return Promise.reject(new Error('Array not found'));
    return arr.reduce((prev, cur) => {
      return prev
        .then(this.timeout)
        .then(() => fn(cur))
    }, Promise.resolve());
  };


  async main()
  {
    this.jira = 'https://folio-org.atlassian.net';

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

      const matrix = await this.getMatrix('https://folio-org.atlassian.net/wiki/spaces/REL/pages/5210256/FOLIO+Module+JIRA+project-Team-PO-Dev+Lead+responsibility+matrix');

      // get ticket from Jira
      let link;
      if (this.argv.link) {
        link = await axios.get(`${this.jira}/rest/api/2/issue/${this.argv.link}`);
      }

      // map dependencies:
      // @folio/stripes-lib => stripes-lib
      // @folio/some-app => ui-some-app
      // @okapi/some-app => some-app
      const contents = JSON.parse(fs.readFileSync(this.argv.package, { encoding: 'UTF-8'}));
      const deps = Object.keys(contents.dependencies)
        .map(p => {
          if (p.startsWith('@folio/stripes-')) {
            return p.substring(p.indexOf('/') + 1);
          }
          if (p.startsWith('@folio')) {
            return `ui-${p.substring(p.indexOf('/') + 1)}`;
          }
          if (p.startsWith('@okapi')) {
            return p.substring(p.indexOf('/') + 1);
          }
        })
        .filter(Boolean)
        .sort();

      // get projects from JIRA
      axios.get(`${this.jira}/rest/api/2/project`)
      .then(projects => {
        // map the array of projects into a hash keyed by name, e.g. ui-some-app
        const pmap = {};
        projects.data.forEach(p => { pmap[p.name] = p; });

        // stupidass ERM projects think they're special
        // ERM projects don't exist individually in Jira, but they do in the matrix.
        // So: if there isn't a Jira entry given the project by name,
        // see if there's an entry for the project by its "jira" attribute.
        Object.values(matrix).forEach(matrixProject => {
          if (matrixProject.github && !pmap[matrixProject.github]) {
            const p = Object.values(pmap).find(project => project.key === matrixProject.jira);
            if (p) {
              pmap[matrixProject.github] = p;
            }
          }
        });

        this.eachPromise(deps, d => {
          if (pmap[d] && matrix[d]) {
            this.teamForName(matrix[d].team)
            .then(team => {
              // only assign the team if we received --team
              const t = this.argv.team ? team : null;
              const cc = [];
              if (this.argv.ccpo && matrix[d].po) {
                cc.push(matrix[d].po)
              }

              if (this.argv.cctl && matrix[d].tl) {
                cc.push(matrix[d].tl)
              }

              return this.createTicket({
                summary: this.argv.summary,
                description: this.argv.description,
                project: pmap[d],
                epic: this.argv.epic,
                labels: this.argv.label,
                team: t,
                cc: cc,
              })
            })
            .then(ticket => {
              if (link) {
                this.linkTicket(ticket, link);
              }
              return ticket;
            })
            .then((ticket) => {
              console.log(`created ${ticket.data.key} (${d})`)
            })
            .catch(e => {
              console.error('err', e.response ? e.response.statusText : e.statusText);
            });
          }
          else {
            console.warn(`could not find a jira project or matrix entry matching >>${d}<<`);
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
