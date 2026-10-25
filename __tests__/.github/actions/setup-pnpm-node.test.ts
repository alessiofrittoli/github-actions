import { resolveToolVersions } from '#/.github/actions/setup-pnpm-node/scripts/resolve-tool-versions'
import { describe, it, vi } from 'vitest'

vi.mock('#/.github/actions/setup-pnpm-node/scripts/resolve-tool-versions', importActual => importActual())

describe('resolveToolVersions', () => {
	it('testing', () => {
		// execSync('node .github/actions/setup-pnpm-node/scripts/resolve-tool-versions.ts')
		resolveToolVersions()
	})
})
