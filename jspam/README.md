## jspam: create jira tickets for many projects

## details

Given a summary and description, and the path to a `package.json`
file, create matching JIRA tickets for entries listed as dependencies
that start with `@folio/...` or `@okapi/...`. Optionally:

* create links to existing tickets
* create an epic link
* add labels
* assign a team based on the wiki's team-module matrix
* CC the PO and/or tech lead based on the wiki's team-module matrix

JIRA username and password will be retrieved from the Mac OS keychain entry
`jira-password`, if available; otherwise, they may be passed on the command
line.

## usage

```
jspam --summary <s> --description <d> --link <JIRA-123> --package <package.json>

Options:
  -u, --username     username
  -p, --password     password
  -s, --summary      issue summary (title)                            [required]
  -d, --description  issue description                                [required]
      --package      path to a package.json file to parse             [required]
  -l, --link         jira issue[s] to link to
  -e, --epic         jira epic to link to
      --label        jira labels to apply
      --team         assign tickets to teams per team-module-responsibility
                     matrix
      --ccpo         CC the product owner per team-module-responsibility matrix
                     in the ticket description
      --cctl         CC the tech lead per team-module-responsibility matrix in
                     the ticket description
  -h, --help         Show help                                         [boolean]
```

## sample output

```
$ JDESC=$(cat ./elaborate-summary.txt)
$ node ./jspam.js -s "Update stripes-cli to v2" -d "$JDESC" -l STCLI-169 --package ~/temp/platform-complete/package.json
could not find a jira project matching ui-agreements
could not find a jira project matching ui-erm-comparisons
created UIPFU-38 (ui-plugin-find-user)
created UIORGS-226 (ui-organizations)
```
