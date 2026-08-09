# apps deployment

This profile runs Cloudflare OS in Wrangler local `workerd` mode inside an isolated Docker
container on the `apps` server. The upstream project's native self-hosted production workflow is
not yet documented as complete, so this remains a self-hosted evaluation deployment even though it
is exposed through the production edge.

## Runtime

- SSH path: local → `Kuaixiong01` → `cddao@100.96.0.6`
- Remote directory: `/home/cddao/Projects/cloudflare-os`
- Container: `cloudflare-os-apps`
- Image: `cloudflare-os-apps:latest`
- Rollback image: `cloudflare-os-apps:rollback`
- Persistent volume: `cloudflare-os-apps-data`
- Upstream: `10.168.10.101:8787`
- Public hostname: `https://cloudflare-os.cddao.com`

## Deploy

```bash
./deploy/apps/deploy.sh
```

The script creates the source tree with `git archive HEAD`, builds the `linux/amd64` image on the
operator machine, then sends both immutable artifacts to apps. This keeps Docker build CPU, memory,
and I/O away from the shared production server and excludes every ignored local credential or
generated file by construction. It preserves the image ID actually used by the prior healthy
container as the rollback tag and verifies the apps-LAN endpoint plus protected Auto containers and
business endpoints before and after activation. A first-run administrator with a random,
non-predictable username and password is created before edge activation, then public account
registration is closed. Protected credentials stay on apps at
`/home/cddao/Projects/cloudflare-os/shared/admin-credentials` with mode `0600`; they are never placed
in the repository, rsync payload, Docker build context, or image.

The deploy script only reports the application phase healthy. A release is complete only after the
Nginx configuration, Cloudflare DNS, Let's Encrypt certificate, and final public HTTPS check pass.

The Nginx bootstrap configuration lives at
`deploy/apps/nginx/cloudflare-os.cddao.com.bootstrap.conf`. Install it before requesting the first
Let's Encrypt certificate, then let Certbot add the managed HTTPS server blocks.

## Rollback

An unhealthy update is stopped unconditionally. If a prior healthy image exists it is restored and
must pass the same container and LAN health gates; on a failed first deployment the unhealthy stack
is removed. The named data volume is retained in both cases.
