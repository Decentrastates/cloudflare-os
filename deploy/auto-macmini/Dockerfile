FROM node:22-bookworm-slim

ENV PNPM_HOME=/pnpm
ENV PATH=/pnpm:$PATH

RUN corepack enable \
    && corepack prepare pnpm@11.17.0 --activate \
    && pnpm config set fetch-timeout 300000 \
    && pnpm config set fetch-retries 5

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=bug-os-pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm fetch --frozen-lockfile

COPY . .

RUN --mount=type=cache,id=bug-os-pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --offline --frozen-lockfile \
    && pnpm --filter @gadgets/typed-storage build \
    && pnpm --filter @gadgets/workshop-frontend exec vite build \
    && cp deploy/auto-macmini/wrangler.container.jsonc wrangler.jsonc \
    && cp -a /root/.cache/node/corepack/v1/pnpm/11.17.0 /opt/pnpm \
    && cp deploy/auto-macmini/pnpm-wrapper.sh /usr/local/bin/pnpm \
    && chmod +x /usr/local/bin/pnpm \
    && chmod +x deploy/auto-macmini/entrypoint.sh \
    && chown -R node:node /app /opt/pnpm

EXPOSE 8787

ENTRYPOINT ["deploy/auto-macmini/entrypoint.sh"]

CMD ["node", "run-dev-server.js", "--serve-frontend-assets"]
