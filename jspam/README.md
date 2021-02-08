## jspam: create jira tickets for many projects

## details

Given a summary, description, JIRA ticket, and the path to a `package.json`
file, create matching JIRA tickets for all `@folio/...` modules all linked
to the given ticket.

JIRA username and password will be retrieved from the Mac OS keychain entry
`jira-password`, if available; otherwise, they may be passed on the command
line.

## usage

```
./jspam.js --summary <s> --description <d> --link <JIRA-123> --package
<package.json>

Options:
  -u, --username     username (jira username)
  -p, --password     password (jira password)
  -s, --summary      issue summary (title)                            [required]
  -d, --description  issue description                                [required]
  -l, --link         jira issue[s] to link to                         [required]
      --package      path to a package.json file to parse             [required]
  -h, --help         Show help                                         [boolean]
```

## sample output

```
$ JDESC=$(cat ./elaborate-summary.txt)
$ ./jspam.js -s "Update stripes-cli to v2" -d "$JDESC" -l STCLI-169 --package ~/temp/platform-complete/package.json
could not find a jira project matching ui-agreements
could not find a jira project matching ui-erm-comparisons
created UIPFU-38 (ui-plugin-find-user)
created UIORGS-226 (ui-organizations)
```
