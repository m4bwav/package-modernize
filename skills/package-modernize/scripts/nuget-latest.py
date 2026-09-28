"""Latest listed stable version of each NuGet id with its publish date and age, from the registration index.

Usage: python nuget-latest.py ID [ID ...]
Flags a version younger than three days (the install cooldown: use the previous one, printed beside it), and shows
whether the version carries a vulnerability or a deprecation. Reads the registration index, not the flat container,
which also lists unlisted versions (FSharp.Core 11.0.100 on 2026-09-27). First used on CachingServiceWithAOPSupport,
2026-09-27, where it caught NUnit 5.0.0 published that day (L-081 `nuget-latest-cooldown`).
"""
import datetime
import gzip
import json
import sys
import urllib.request


def fetch(url):
    raw = urllib.request.urlopen(url).read()
    try:
        raw = gzip.decompress(raw)
    except OSError:
        pass
    return json.loads(raw)


def main():
    today = datetime.date.today()
    for pid in sys.argv[1:]:
        index = fetch("https://api.nuget.org/v3/registration5-gz-semver2/%s/index.json" % pid.lower())
        rows = []
        for page in index["items"]:
            items = page.get("items") or fetch(page["@id"])["items"]
            for it in items:
                c = it["catalogEntry"]
                if "-" in c["version"] or not c.get("listed", True):
                    continue
                rows.append((c["published"][:10], c["version"], bool(c.get("vulnerabilities")), c.get("deprecation") is not None))
        rows.sort(key=lambda r: [int(x) if x.isdigit() else x for x in r[1].replace("+", ".").split(".")])
        pub, ver, vuln, dep = rows[-1]
        age = (today - datetime.date.fromisoformat(pub)).days
        flag = "  COOLDOWN (<3 days)" if age < 3 else ""
        prev = rows[-2][1] + " " + rows[-2][0] if len(rows) > 1 else ""
        print("%-45s %-12s %s  age %4dd vuln=%s deprecated=%s  prev %s%s" % (pid, ver, pub, age, vuln, dep, prev, flag))


main()
