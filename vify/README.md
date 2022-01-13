## vify.js: publish a UI app's branch on platform-complete to vercel

## details

Given that you have a fork of platform-complete connected to Vercel,
this script opens a PR against that fork, which causes Vercel to
auto-deploy a build with a predictable and publicly-accessible URL
related to the branch-name, allowing others to preview the changes
before they are committed to `#master`.

## usage

### setup

```
git clone git@github.com:folio-org/ui-some-project.git
cd ui-some-project
git checkout -b some-branch
...
git push -u origin head
```
### actual usage

```
node path/to/vify.js
```
Given the following:
* your Vercel username is `javert`
* your Vercel project is `platform-complete`
* your application branch is `ABC-24601`

Vercel will publish to
```
https://platform-complete-git-abc-24601-javert.vercel.app
```

## one-time setup

- get clone this repo and `yarn` or `npm i` to install its dependencies.
- in GitHub, fork folio-org/platform-complete.
- in GitHub > Settings > Developer settings, create a new personal access
  token. Paste it into `vify.js`, along with your GitHub username.
- in Vercel > Settings > Login Connections, connect to GitHub.
- in Vercel, create a new project importing the fork above, and configure it:
  - Build & Development Settings
    - framework preset: Other
    - build command (override):
      ```
      yarn stripes build stripes.config.js output --tenant diku --okapi https://folio-snapshot-okapi.dev.folio.org
      ```
    - output directory (override):
      ```
      output
      ```
    - install command (override):
      ```
      yarn install
      ```
  - Root Directory
    - Tick the box for "Include source files outside of the Root Directory in the Build Step."

## sample output

```
$ pwd
/Users/zburke/projects/folio-org/ui-users

$ git br | grep '*'
* UIU-2036

$ node ~/temp/zburke-folio-tools/vify/vify.js
cloning into /var/folders/s8/jb_phxyn5vvcrx61_6f1qkn80000gn/THTTlVK ...
updating package.json ...
updating stripes.config.js ...
committing changes ...
pushing the branch ...
creating PR ...
cleaning up ...
done!
```

