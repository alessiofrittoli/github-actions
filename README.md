<h1 align="center">Github Actions 🐙</h1>
<h2 align="center">
  Utility library that offers reusable and composable GitHub actions
</h2>
<p align="center">
  <a href="https://coveralls.io/github/alessiofrittoli/github-actions">
    <img src="https://coveralls.io/repos/github/alessiofrittoli/github-actions/badge.svg" alt="Test coverage"/>
  </a>
  <a href="https://github.com/sponsors/alessiofrittoli">
    <img src="https://img.shields.io/static/v1?label=Fund%20this%20package&message=%E2%9D%A4&logo=GitHub&color=%23DB61A2" alt="Fund this package"/>
  </a>
</p>

[sponsor-badge]: https://img.shields.io/static/v1?label=Fund%20this%20package&message=%E2%9D%A4&logo=GitHub&color=%23DB61A2
[sponsor-url]: https://github.com/sponsors/alessiofrittoli

### Table of Content

- [Development](#development)
  - [Local development](#local-development)
  - [Production build](#production-build)
  - [Unit tests](#unit-tests)
    - [Run tests with coverage](#run-tests-with-coverage)
  - [Contributing](#contributing)
  - [Security](#security)
- [API Reference](#api-reference)
- [Credits](#made-with-)

---

### Development

Run the following to start development

```shell
nvm use

pnpm i
```

#### Local development

Run the following

```shell
pnpm dev
```

This will generate unminified output code, sourcemaps and will enable source file watcher.

---

#### Production build

Run the following to create a local production build

```shell
pnpm build
```

This will generate minified output code without sourcemaps.

---

#### Unit tests

Run all the defined test suites by running the following:

```shell
# Run tests and watch file changes.
pnpm test:watch

# Run tests in a CI environment.
pnpm test:ci
```

---

##### Run tests with coverage

An HTTP server is then started to serve coverage files from `./coverage` folder.

⚠️ You may see a blank page the first time you run this command. Simply refresh the browser to see the updates.

```shell
pnpm test:coverage:serve
```

---

#### Contributing

Contributions are truly welcome!

Please refer to the [Contributing Doc](./CONTRIBUTING.md) for more information on how to start contributing to this project.

Help keep this project up to date with [GitHub Sponsor][sponsor-url].

[![GitHub Sponsor][sponsor-badge]][sponsor-url]

---

#### Security

If you believe you have found a security vulnerability, we encourage you to **_responsibly disclose this and NOT open a public issue_**. We will investigate all legitimate reports. Email `security@alessiofrittoli.it` to disclose any security vulnerabilities.

---

### API Reference

#### Actions

##### `setup-pnpm-node`

Easily setup pnpm and Node.js in your GitHub actions.

<details>

<summary style="cursor:pointer">Steps</summary>

- Checkout repository
- Resolve tool versions
- Setup pnpm
- Setup additional pnpm configs
- Setup Node.js
- Install dependencies

</details>

---

<details>

<summary style="cursor:pointer">Automatic tools version detection</summary>

This composite action setup pnpm and Node.js using versions specified by your project configurations. Here is the list of configurations checked ordered by priority:

- pnpm
  - `.tool-versions` file
  - `packageManager` field in `package.json` file
  - `engines` field in `package.json` file
- Node.js
  - `.tool-versions` file
  - `.nvmrc` file
  - `engines` field in `package.json` file

</details>

---

<details>

<summary style="cursor:pointer">Action inputs</summary>

| Parameter                 | Type     | Required | Default | Description                                                                            |
| ------------------------- | -------- | -------- | ------- | -------------------------------------------------------------------------------------- |
| `node_version`            | `string` | `false`  | `24`    | Forcibly use the given Node.js version and skip tool version automatic resolution.     |
| `pnpm_version`            | `string` | `false`  | `11`    | Forcibly use the given pnpm version and skip tool version automatic resolution.        |
| `github_token`            | `string` | `true`   |         | The GITHUB_TOKEN.                                                                      |
| `node_scope`              | `string` | `false`  |         | Optional scope for authenticating against scoped registries.                           |
|                           |          |          |         | Will fall back to the repository owner when using the GitHub Packages registry.        |
| `node_scope_registry`     | `string` | `false`  |         | Optional registry to set up for auth.                                                  |
|                           |          |          |         | Will set the registry in a project level `.npmrc` and `.yarnrc` file,                  |
|                           |          |          |         | and set up auth to read in from given `node_auth_token`.                               |
| `node_auth_token`         | `string` | `false`  |         | The NODE_AUTH_TOKEN used to install private packages.                                  |
| `additional_pnpm_configs` | `string` | `false`  |         | Additional pnpm configurations.                                                        |
|                           |          |          |         | This can be used to set different auth tokens for additional scoped packages.          |
|                           |          |          |         | (e.g. //registry/url/:\_authToken={{token}};//registry/url-2/:\_authToken={{token-2}}) |

</details>

---

<details>

<summary style="cursor:pointer">Example usage</summary>

```yaml
# my-project/.github/workflows/tests-ci.yaml

name: Unit Tests

on: ['push']

jobs:
  test:
    name: Run Unit Tests
    runs-on: ubuntu-latest
    timeout-minutes: 60
    permissions:
      contents: read
      pull-requests: write

    steps:
      - name: Setup environment
        uses: alessiofrittoli/github-actions/.github/actions/setup-pnpm-node@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          node_scope: 'organization-scope-name'
          node_scope_registry: 'https://npm.pkg.github.com'
          node_auth_token: ${{ secrets.PRIVATE_PACKAGE_AUTH_TOKEN }}
          additional_pnpm_configs: '//other-registry.com/:_authToken=${{secrets.AUTH_TOKEN_2}};//other-registry-2.com/:_authToken=${{secrets.AUTH_TOKEN_3}}'

      - name: Linting
        run: pnpm lint

      - name: Type checking
        run: pnpm tsc

      - name: Run unit tests
        run: pnpm test:coverage:ci
```

</details>

---

### Made with ☕

<table style='display:flex;gap:20px;'>
  <tbody>
    <tr>
      <td>
        <img alt="avatar" src='https://avatars.githubusercontent.com/u/35973186' style='width:60px;border-radius:50%;object-fit:contain;'>
      </td>
      <td>
        <table style='display:flex;gap:2px;flex-direction:column;'>
          <tbody>
              <tr>
                <td>
                  <a href='https://github.com/alessiofrittoli' target='_blank' rel='noopener'>Alessio Frittoli</a>
                </td>
              </tr>
              <tr>
                <td>
                  <small>
                    <a href='https://alessiofrittoli.it' target='_blank' rel='noopener'>https://alessiofrittoli.it</a> |
                    <a href='mailto:info@alessiofrittoli.it' target='_blank' rel='noopener'>info@alessiofrittoli.it</a>
                  </small>
                </td>
              </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
