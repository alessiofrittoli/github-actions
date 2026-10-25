import {
	normalizeVersion,
	resolveToolVersions,
} from '#/.github/actions/setup-pnpm-node/scripts/resolve-tool-versions/functions'
import {
	appendFileSync as _appendFileSync,
	readFileSync as _readFileSync,
	existsSync as _existsSync,
} from 'fs'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { resolve } from 'path'

vi.mock('fs', async importActual => ({
	...(await importActual()),
	existsSync: vi.fn(),
	readFileSync: vi.fn(),
	appendFileSync: vi.fn(),
}))

const appendFileSync = _appendFileSync as Mock<typeof _appendFileSync>
const readFileSync = _readFileSync as Mock<typeof _readFileSync>
const existsSync = _existsSync as Mock<typeof _existsSync>

describe('resolveToolVersions', () => {
	const original_GITHUB_OUTPUT = process.env.GITHUB_OUTPUT

	const stdOutWrite = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
	const stdErrWrite = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)

	beforeEach(() => {
		process.env.GITHUB_OUTPUT = resolve(process.cwd(), 'github-output')
	})

	afterEach(() => {
		process.env.GITHUB_OUTPUT = original_GITHUB_OUTPUT

		if (typeof original_GITHUB_OUTPUT === 'undefined') {
			delete process.env.GITHUB_OUTPUT
		}
	})

	const testingTools = ['pnpm', 'node', 'other-tool']
	const testCases = [
		'.tool-versions file',
		'package.json engines field',
		'package.json packageManager field',
		'.nvmrc file',
	] as const

	it.each([
		['pnpm', undefined, testCases.at(0), '^11.10.0'],
		['pnpm', undefined, testCases.at(1), '^11.10.0'],
		['pnpm', undefined, testCases.at(2), 'pnpm@11.10.0-rc.1+sha256abcd123'],
		['node', undefined, testCases.at(0), '>=26'],
		['node', undefined, testCases.at(1), '>=26'],
		['node', undefined, testCases.at(3), '>=26'],
		['any tool', 'other-tool', testCases.at(0), '~20.0.568'],
		['tool', 'other-tool', testCases.at(1), '~20.0.568'],
	])('resolves $0 version from $2', (toolName, tool = toolName, testCase, expectedVersion) => {
		const expectedNormalizedVersion = normalizeVersion(expectedVersion)

		// const stdOutWrite = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

		if (testCase === testCases.at(0)) {
			// mock `.tool-versions` file `existSync` result
			existsSync.mockImplementation(file => file === '.tool-versions')

			/**
			 * mock `.tool-versions` file content.
			 *
			 * writing content:
			 * ```
			 * pnpm x.x.x
			 * node x.x.x
			 * other-tool x.x.x
			 * ```
			 */
			readFileSync.mockReturnValue(
				testingTools.map(tool => `${tool} ${expectedVersion}`).join('\n') + '\n',
			)

			resolveToolVersions([tool])

			expect(existsSync).toHaveBeenCalledExactlyOnceWith('.tool-versions')

			expect(appendFileSync).toHaveBeenCalledWith(
				process.env.GITHUB_OUTPUT,
				`${tool}=${expectedNormalizedVersion}\n`,
			)

			expect(stdOutWrite).toHaveBeenCalledExactlyOnceWith(
				`✅ Resolved ${tool} version from .tool-versions file: ${expectedNormalizedVersion}\n`,
			)

			return
		}

		if (testCase === testCases.at(1)) {
			// mock `package.json` file `existSync` result
			existsSync.mockImplementation(file => file === 'package.json')

			/**
			 * mock `package.json` file content.
			 *
			 * writing content:
			 * ```
			 * {
			 * 	"engines": {
			 * 		"pnpm": "x.x.x",
			 * 		"node": "x.x.x",
			 * 		"other-tool": "x.x.x"
			 * 	}
			 * }
			 * ```
			 */
			const engines: Record<string, string> = {}

			testingTools.forEach(tool => {
				engines[tool] = expectedVersion
			})

			readFileSync.mockReturnValue(JSON.stringify({ engines }))

			resolveToolVersions([tool])

			if (tool !== 'node') {
				// attemts to resolve from `.tool-versions` first
				expect(existsSync).toHaveBeenNthCalledWith(1, '.tool-versions')
				// then from package.json
				expect(existsSync).toHaveBeenNthCalledWith(2, 'package.json')
			} else {
				// attemts to resolve from `.tool-versions` first
				expect(existsSync).toHaveBeenNthCalledWith(1, '.tool-versions')
				// attemts to resolve from `.nvmrc` first
				expect(existsSync).toHaveBeenNthCalledWith(2, '.nvmrc')
				expect(existsSync).toHaveBeenNthCalledWith(3, 'package.json')
			}

			expect(appendFileSync).toHaveBeenCalledWith(
				process.env.GITHUB_OUTPUT,
				`${tool}=${expectedNormalizedVersion}\n`,
			)

			expect(stdOutWrite).toHaveBeenCalledExactlyOnceWith(
				`✅ Resolved ${tool} version from package.json engines: ${expectedNormalizedVersion}\n`,
			)

			return
		}

		if (testCase === testCases.at(2)) {
			// mock `package.json` file `existSync` result
			existsSync.mockImplementation(file => file === 'package.json')

			/**
			 * mock `package.json` file content.
			 *
			 * writing content:
			 * ```
			 * {
			 * 	"packageManager": "x.x.x"
			 * }
			 * ```
			 */
			readFileSync.mockReturnValue(JSON.stringify({ packageManager: expectedVersion }))

			resolveToolVersions([tool])

			expect(appendFileSync).toHaveBeenCalledWith(
				process.env.GITHUB_OUTPUT,
				`${tool}=${expectedNormalizedVersion}\n`,
			)

			expect(stdOutWrite).toHaveBeenCalledExactlyOnceWith(
				`✅ Resolved ${tool} version from package.json packageManager: ${expectedNormalizedVersion}\n`,
			)

			return
		}

		if (testCase === testCases.at(3)) {
			// mock `.nvmrc` file `existSync` result
			existsSync.mockImplementation(file => file === '.nvmrc')

			/**
			 * mock `.nvmrc` file content.
			 *
			 * writing content:
			 * ```
			 * x.x.x
			 * ```
			 */
			readFileSync.mockReturnValue(expectedVersion + '\n')

			resolveToolVersions([tool])

			expect(appendFileSync).toHaveBeenCalledWith(
				process.env.GITHUB_OUTPUT,
				`${tool}=${expectedNormalizedVersion}\n`,
			)

			expect(stdOutWrite).toHaveBeenCalledExactlyOnceWith(
				`✅ Resolved ${tool} version from .nvmrc file: ${expectedNormalizedVersion}\n`,
			)

			return
		}

		expect.unreachable('Untested tool version resolution')
	})

	// negative testing

	it('prints an error if `GITHUB_OUTPUT` environment variable is not defined', () => {
		delete process.env.GITHUB_OUTPUT

		resolveToolVersions(['pnpm', 'node'])

		expect(stdErrWrite).toHaveBeenCalledExactlyOnceWith(
			'❌ Failed to resolve project tool versions. The script has no output channel available. GITHUB_OUTPUT environment variable is not defined.\n',
		)
	})

	describe('resolveFromPackageEngines', () => {
		it("returns undefined if package.json file doesn't exist", () => {
			// mock `package.json` file `existSync` result
			existsSync
				// attempts to resolve version from `packageManager` field first
				.mockReturnValue(true)
				// attempts to resolve version from `engines` field
				.mockReturnValue(false)

			resolveToolVersions(['pnpm'])

			expect(appendFileSync).toHaveBeenCalledExactlyOnceWith(process.env.GITHUB_OUTPUT, 'pnpm=\n')
		})

		it('returns undefined and prints an error if package.json file parsing fails', () => {
			// mock `package.json` file `existSync` result
			existsSync.mockImplementation(file => file === 'package.json')

			readFileSync
				// attempts to resolve version from `packageManager` field first
				.mockReturnValueOnce(JSON.stringify({}))
				// attempts to resolve version from `engines` field
				.mockReturnValueOnce('invalid JSON')

			resolveToolVersions(['pnpm'])

			expect(stdErrWrite).toHaveBeenCalledExactlyOnceWith(
				'❌ Failed to resolve pnpm version from package.json. Unable to parse the package.json file.\n',
			)
		})
	})

	describe('resolvePnpmFromPackageManager', () => {
		it("returns undefined if package.json file doesn't exist", () => {
			// mock `package.json` file `existSync` result
			existsSync.mockReturnValue(false)

			resolveToolVersions(['pnpm'])

			expect(appendFileSync).toHaveBeenCalledExactlyOnceWith(process.env.GITHUB_OUTPUT, 'pnpm=\n')
		})

		it('returns undefined and prints an error if package.json file parsing fails', () => {
			// mock `package.json` file `existSync` result
			existsSync.mockImplementation(file => file === 'package.json')

			readFileSync
				// attempts to resolve version from `packageManager` field first
				.mockReturnValueOnce('invalid JSON')
				// attempts to resolve version from `engines` field
				.mockReturnValueOnce(JSON.stringify({}))

			resolveToolVersions(['pnpm'])

			expect(stdErrWrite).toHaveBeenCalledExactlyOnceWith(
				'❌ Failed to resolve pnpm version from package.json packageManager. Unable to parse the package.json file.\n',
			)
		})
	})
})
