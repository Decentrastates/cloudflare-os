# AutoMacmini container deployment

This profile runs Bug OS in Wrangler's local `workerd` mode inside Docker and persists
Wrangler state in the `cloudflare-os-data` volume.

It is intended for local-network evaluation only. The upstream project labels `run-local` as a
development experience and its documented self-hosted `workerd` production workflow is still
"COMING SOON".

## Deploy

```bash
./deploy/auto-macmini/deploy.sh
```

The service is exposed at `http://192.168.3.36:8787/`.

## Health and logs

```bash
ssh aos@192.168.3.36 \
  'PATH=/usr/local/bin:/usr/bin:/bin docker compose -f /Users/aos/cloudflare-os/deploy/auto-macmini/compose.yml ps'

ssh aos@192.168.3.36 \
  'PATH=/usr/local/bin:/usr/bin:/bin docker logs --tail=200 cloudflare-os'
```

## Rollback

The deploy script tags the previously deployed image as `cloudflare-os-local:rollback` before a
new build only when the running container is healthy. To restore it, stop the stack, retag that
image as `latest`, and start the stack with `--no-build`. The named volume is deliberately retained.
For the first successful deployment, rollback means stopping the stack while retaining the named
volume; that successful image becomes the baseline for future upgrades.
