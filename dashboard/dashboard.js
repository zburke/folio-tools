'use strict';

const e = React.createElement;

class Dashboard extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
            stripes: {
              'stripes-cli': {},
              'stripes-components': {},
              'stripes-connect': {},
              'stripes-core': {},
              'stripes-final-form': {},
              'stripes-form': {},
              'stripes-logger': {},
              'stripes-smart-components': {},
              'stripes-util': {},
            },
            core: {
              'ui-calendar': {},
              'ui-checkin': {},
              'ui-checkout': {},
              'ui-circulation': {},
              'ui-developer': {},
              'ui-inventory': {},
              'ui-myprofile': {},
              'ui-plugin-find-instance': {},
              'ui-plugin-find-user': {},
              'ui-requests': {},
              'ui-search': {},
              'ui-servicepoints': {},
              'ui-tags': {},
              'ui-tenant-settings': {},
              'ui-users': {},

            },
            complete: {
              'ui-acquisition-units': {},
              'ui-agreements': {},
              'ui-data-import': {},
              'ui-data-export': {},
              'ui-eholdings': {},
              'ui-erm-usage': {},
              'ui-finance': {},
              'ui-finc-config': {},
              'ui-finc-select': {},
              'ui-invoice': {},
              'ui-licenses': {},
              'ui-local-kb-admin': {},
              'ui-marccat': {},
              'ui-notes': {},
              'ui-orders': {},
              'ui-organizations': {},
              'ui-plugin-find-agreement': {},
              'ui-plugin-find-contact': {},
              'ui-plugin-find-erm-usage-data-provider': {},
              'ui-plugin-find-interface': {},
              'ui-plugin-find-license': {},
              'ui-plugin-find-organization': {},
              'ui-plugin-find-po-line': {},
              'ui-receiving': {},
              'ui-vendors': {},
              'stripes-erm-components': {},
              'stripes-data-transfer-components': {},
            },
            platforms: {
              'platform-complete': { branch: 'snapshot' },
              'platform-core': { branch: 'snapshot' },
              'platform-erm': { branch: 'snapshot' },
              'build-platform-complete-snapshot': { jobRoot: 'Automation', branch: 'snapshot' },
              'build-platform-core-snapshot': { jobRoot: 'Automation', branch: 'snapshot' },
            }
          };
    }

    componentDidMount() {
        this.fetchStatus('stripes');
        this.fetchStatus('core');
        this.fetchStatus('complete');
        this.fetchStatus('platforms');
    }

    fetchStatus = (repoGroup) => {
        const repos = this.state[repoGroup];
        Object.keys(repos).forEach(key => {
            if (typeof repos[key].stable === "undefined") {
                fetch(`proxy.php?module=${key}&branch=${repos[key].branch ? repos[key].branch : 'master' }&jobRoot=${repos[key].jobRoot ? repos[key].jobRoot : ''}`)
                .then(response => response.json())
                .then(data => {
                    if (data.lastCompletedBuild.number == data.lastSuccessfulBuild.number) {
                        repos[key].stable = true;
                        repos[key].comp = `${data.lastCompletedBuild.number} == ${data.lastSuccessfulBuild.number}`
                    } else {
                        repos[key].stable = false;
                        repos[key].comp = `${data.lastCompletedBuild.number} != ${data.lastSuccessfulBuild.number}`
                    }

                    this.setState({ [repoGroup] : repos });
                });
            } else {
                console.log(`${key} was already defined: ${repos[key].stable} `)
            }

        });
    }

    buildTable = (repoGroup) =>
    {
        const rows = this.state[repoGroup];
        return Object.keys(rows).sort((a, b) => a.localeCompare(b)).map(key => {
            let css = '';
            if (typeof rows[key].stable !== 'undefined') {
                css = rows[key].stable ? 'good' : 'bad';
            }

            let href = `https://jenkins-aws.indexdata.com/job/folio-org/job/${key}/job/${rows[key].branch ? rows[key].branch : 'master'}`;
            if (rows[key].jobRoot && rows[key].jobRoot == 'Automation') {
              href = `https://jenkins-aws.indexdata.com/job/Automation/job/${key}/`;
            }
            return (<div className={css} key={key}>
              <a href={href}>{key} {rows[key].comp}</a>
            </div>);
        });
    }

    render () {
        return (
          <div>
            <div className="column"><h2>stripes</h2>{this.buildTable('stripes')} <h2>platforms</h2>{this.buildTable('platforms')}</div>
            <div className="column"><h2>platform-core</h2>{this.buildTable('core')}</div>
            <div className="column"><h2>platform-complete</h2>{this.buildTable('complete')}</div>
          </div>
        )
    }
}


const domContainer = document.querySelector('#dashboard');
ReactDOM.render(e(Dashboard), domContainer);
