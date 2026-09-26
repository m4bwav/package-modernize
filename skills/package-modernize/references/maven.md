# Maven Central: how each phase is done

Coverage: **unverified until a run uses it.** Facts read on central.sonatype.org, maven.apache.org, docs.github.com and the plugin pages on 2026-09-25; RESEARCH.md keeps the sources. Phases and shared rules: [../SKILL.md](../SKILL.md). Maven Central differs from the others in two ways: there is no OIDC trusted publishing (the Portal uses user tokens), and the registry itself has the human gate the others lack (a deployment waits in VALIDATED until someone publishes it).

| Concern | Maven Central |
|---|---|
| Survey | `https://repo1.maven.org/maven2/GROUP/PATH/ARTIFACT/maven-metadata.xml` (latest, release, versions); `https://search.maven.org/solrsearch/select?q=g:GROUP+AND+a:ARTIFACT&core=gav&rows=20&wt=json`; the GitHub side with `scripts/survey-github.sh`. |
| Baseline | `mvn -q verify` or `./gradlew build` with the JDK the old build names; record the Java target. |
| Golden capture | A scratch project depending on the exact old version, a main class that calls every public method with normal, edge and odd inputs and writes JSON. |
| Package shape | POM with `groupId`, `artifactId`, `version` (no `-SNAPSHOT`), `name`, `description`, `url`, `licenses`, `developers`, `scm`; main jar plus `-sources.jar` and `-javadoc.jar`; each file with `.asc`, `.md5` and `.sha1` (sha256 and sha512 optional); a `module-info.java` or `Automatic-Module-Name`; the Java release target (11 or 17 for broad reach in 2026, decided per package). |
| Namespace | Verified once on the Central Publisher Portal (DNS TXT record for a domain, or a GitHub-derived `io.github.USER` namespace); OSSRH ended 2025-06-30, the Portal is its successor (an OSSRH staging API shim exists at `ossrh-staging-api.central.sonatype.com`). |
| Build and check | Maven: `org.sonatype.central:central-publishing-maven-plugin` 0.11.0 with `<extensions>true</extensions>`, `<publishingServerId>central</publishingServerId>`, `<autoPublish>false</autoPublish>` (the gate) and `<waitUntil>validated</waitUntil>`; `maven-gpg-plugin` 3.2.8 signing in `verify`; `maven-source-plugin` and `maven-javadoc-plugin`. Gradle: no official plugin; JReleaser or `com.vanniktech.maven.publish` 0.37.0 (`publishToMavenCentral`, `signAllPublications`). API compatibility: `japicmp` or `revapi` against the previous release. |
| Dependency audit | Dependabot `maven` (pom.xml) or `gradle` (needs `gradle.lockfile`); `org.owasp:dependency-check-maven` 12.1.0 (NVD; an API key speeds it up); `versions-maven-plugin` 2.22.0 `display-dependency-updates`. |
| CI matrix | Ubuntu, Windows, macOS on the supported JDKs (`actions/setup-java@v4` with the `central` server id and GPG inputs). |
| Release trigger | A `v*` tag; `mvn --batch-mode deploy` with the Portal token pair and the GPG key from secrets. |
| Trusted publishing | None (checked 2026-09-25). Publishing needs a Portal user token (username and password pair from `central.sonatype.com/usertoken`, named, expiring, shown once) and a GPG key pair, all held as GitHub secrets; scope them to the environment. |
| Human gate | Built into the registry: a deployment moves PENDING, VALIDATING, VALIDATED, PUBLISHING, PUBLISHED, FAILED; with `publishingType=USER_MANAGED` (the default) it waits in VALIDATED for the Publish button on the Portal or `POST /api/v1/publisher/deployment/ID`, and can be dropped with DELETE. Combine with a GitHub environment reviewer if the deploy step should also wait. |
| Provenance and signing | GPG signatures mandatory (`gpg --verify file.asc`; keys on keyserver.ubuntu.com or keys.openpgp.org); no Sigstore or SLSA in the Portal docs; GitHub artifact attestations can be added on the jars for the run's artifacts. |
| Verify from the registry | `maven-metadata.xml` on repo1 lists the version (10 to 30 minutes after publishing; search index within a few minutes); a fresh project depending on the exact version builds and gets the golden answers; `gpg --verify` on the downloaded `.asc`. |
| Deprecate, delete | Nothing published to Central can be altered or removed; a relocation POM or a final version with a deprecation notice in the README is the convention. `-SNAPSHOT` versions go to the Portal's snapshot repository (about 90 days retention) and never to Central. |
| Account | Portal login through GitHub or Google or a username; no native MFA documented on the registration page; the token pair and GPG key are the secrets to protect. |
| Dependabot | `package-ecosystem: maven` or `gradle`, plus `github-actions`. |

Open points for the first run: the Portal's exact waiting behaviour with `waitUntil validated` from a workflow, japicmp versus revapi, and how the two secrets and the GPG key are rotated.

Related: builds on [../SKILL.md](../SKILL.md); see also [npm.md](npm.md).
