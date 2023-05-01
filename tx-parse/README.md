# tx-parse

calculate completeness of translations in current repo by comparison to en_US

## usage

```
node path/to/tx-parse <repo-name>
```

Run this script at the root of a UI repository to get information about
the completeness of its translations:
```
$ node ~/bin/tx-parse ui-users
    ar  86% 933/1082
   ber   0% 0/1082
    ca   0% 1/1082
 cs_CZ  99% 1079/1082
    da   6% 73/1082
    de  91% 989/1082
 en_GB   1% 20/1082
 en_SE   1% 20/1082
    es  55% 601/1082
es_419  98% 1068/1082
 es_ES  64% 703/1082
    fr   0% 0/1082
 fr_FR  78% 853/1082
    he   0% 0/1082
 hi_IN   0% 0/1082
    hu  16% 183/1082
 it_IT  65% 714/1082
    ja  30% 328/1082
    ko  53% 576/1082
    nb   0% 0/1082
    nn   0% 0/1082
    pl  69% 756/1082
 pt_BR  98% 1071/1082
 pt_PT  18% 205/1082
    ru  30% 330/1082
    sv   0% 0/1082
    ur   0% 7/1082
 zh_CN  99% 1079/1082
 zh_TW  85% 927/1082
```
Pipe it through `sort -k2` to sort by percent-complete instead of by locale.
