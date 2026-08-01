# Deployment workflow

The repository uses two protected branches:

- `develop` deploys automatically to `dev.fabienhance.com`
- `master` remains the production branch

Create `feature/*` or `fix/*` branches from `develop`, merge them through a pull request, then
promote a tested release with a `develop` to `master` pull request.

Every pull request targeting either branch runs the `validate` job. Configure the GitHub
rulesets for both branches to require this check, dismiss stale approvals and block direct
pushes. If another collaborator can review changes, also require one approval.

## GitHub development environment

Create an environment named `development` with these secrets:

- `DEV_SSH_HOST`
- `DEV_SSH_PORT`
- `DEV_SSH_USER`
- `DEV_SSH_PRIVATE_KEY`
- `DEV_SSH_KNOWN_HOSTS`

The development checkout lives at `/opt/photography-portfolio-dev`. The SSH account only needs
access to that directory and the Docker commands used by the deployment script.

## VPS bootstrap

1. Point `dev.fabienhance.com` and `cms-dev.fabienhance.com` to the VPS.
2. Clone the repository into `/opt/photography-portfolio-dev`.
3. Copy `deploy/development.env.example` to `deploy/.env.development` and generate independent
   development secrets.
4. Ensure the shared `photography-edge` Docker network exists.
5. Load the updated `Caddyfile.portfolio` once on the reverse proxy.
6. Start the development CMS, create its administrator and a read-only API token, then add the
   token to `.env.development`.

After bootstrap, each validated push to `develop` deploys the exact commit SHA, refreshes the
Next.js content cache and warms the gallery, archive and sitemap. A failed build, missing CMS
token or failed content refresh stops the workflow.

## Releases

Release Please runs after validated changes reach `master`. Configure a fine-grained token as
the repository secret `RELEASE_PLEASE_TOKEN` so its release pull requests trigger the normal
quality checks. The token needs read/write access to contents, pull requests and issues.

Use Conventional Commit titles when squash-merging:

- `fix:` creates a patch release
- `feat:` creates a minor release
- `feat!:` or a `BREAKING CHANGE` footer creates a major release

Release Please keeps one release pull request up to date. Merging it updates `CHANGELOG.md` and
`package.json`, creates a `vX.Y.Z` tag and publishes the GitHub Release. It does not publish the
private application to npm.
