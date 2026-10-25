import { setupAdditionalPnpmConfigs } from '#/.github/actions/setup-pnpm-node/scripts/setup-additional-pnpm-configs/functions'
import { describe, expect, it, vi, type Mock } from 'vitest'
import { execSync as _execSync } from 'child_process'

vi.mock('child_process', async importActual => ({
	...(await importActual()),
	execSync: vi.fn(),
}))

const execSync = _execSync as Mock<typeof _execSync>

describe('setupAdditionalPnpmConfigs', () => {
	const stdOutWrite = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
	const stdErrWrite = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)

	it('sets additional pnpm configs', () => {
		setupAdditionalPnpmConfigs(
			'//other-registry.com/:_authToken=${{secrets.AUTH_TOKEN_1}};//other-registry-2.com/:_authToken=${{secrets.AUTH_TOKEN_2}}',
		)

		expect(execSync).toHaveBeenNthCalledWith(
			1,
			'pnpm config set "//other-registry.com/:_authToken" ${{secrets.AUTH_TOKEN_1}}',
		)
		expect(execSync).toHaveBeenNthCalledWith(
			2,
			'pnpm config set "//other-registry-2.com/:_authToken" ${{secrets.AUTH_TOKEN_2}}',
		)

		expect(stdOutWrite).toHaveBeenNthCalledWith(
			1,
			`✅ Successfully set pnpm config. ${JSON.stringify({ config: '//other-registry.com/:_authToken', value: '${{secrets.AUTH_TOKEN_1}}' }, undefined, 2)}\n`,
		)
		expect(stdOutWrite).toHaveBeenNthCalledWith(
			2,
			`✅ Successfully set pnpm config. ${JSON.stringify({ config: '//other-registry-2.com/:_authToken', value: '${{secrets.AUTH_TOKEN_2}}' }, undefined, 2)}\n`,
		)
	})

	it('prints out error details if `pnpm config set` fails', () => {
		const error = new Error('Failed to set given config.')

		execSync.mockImplementation(() => {
			throw error
		})

		setupAdditionalPnpmConfigs('//other-registry.com/:_authToken=${{secrets.AUTH_TOKEN_1}}')

		expect(stdErrWrite).toHaveBeenCalledExactlyOnceWith(
			`❌ Failed to set pnpm config. ${JSON.stringify({ config: '//other-registry.com/:_authToken', value: '${{secrets.AUTH_TOKEN_1}}', error }, undefined, 2)}\n`,
		)
	})

	it('does nothing if no config is given', () => {
		setupAdditionalPnpmConfigs()
		setupAdditionalPnpmConfigs('')

		expect(execSync).not.toHaveBeenCalled()
	})
})
