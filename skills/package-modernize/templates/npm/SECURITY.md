# Security policy

## Reporting a problem

Open an issue or a pull request{{DISCUSSIONS_CLAUSE}} and I'll take a look. Hardening ideas, dependency bumps and doc fixes all belong there.

If the problem could hurt the package's users before a fix is out (a way to exploit it, or a leaked token), don't post the details in public. Open the repository's **Security** tab and choose **Report a vulnerability** instead. Only the maintainer sees those reports. A confirmed problem is fixed in a new release, and the advisory is published once the fix is on npm.

This is a one-person project with no bug bounty and no response deadline. I'll reply when I can and say what I plan to do.

## Supported versions

Only the latest major version ({{MAJOR}}.x) gets security fixes.

## What this package is not

{{TEMPLATE: one paragraph on the package's limits that a reader could mistake for a vulnerability, for example "not a cryptographic random number generator", "does not sanitize HTML", "fetches whatever URL it is given, so callers must guard against server-side request forgery". Delete the section if there is nothing to say.}}
