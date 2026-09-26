import { appendFileSync, existsSync, readFileSync } from 'fs'

/**
 * Resolve given tool version from `.tool-versions` file.
 *
 */
const resolveFromToolVersions = ( tool: string ): string | undefined => {
	if ( ! existsSync( '.tool-versions' ) ) return

	const toolVersions	= readFileSync( '.tool-versions', 'utf-8' )
	const toolVersion	= toolVersions.split( /\n/ ).find( declaration => declaration.startsWith( `${ tool } ` ) )
	const version		= toolVersion?.split( /\s+/ )[ 1 ]

	if ( version ) {
		process.stdout.write( `Resolved ${ tool } version from .tool-versions file: ${ version }\n` )
	}

	return version
}

/**
 * Resolve given tool version from `engines` field in `package.json`.
 *
 */
const resolveFromPackageEngines = ( tool: string ): string | undefined => {

	if ( ! existsSync( 'package.json' ) ) return

	try {
		const { engines } = JSON.parse( readFileSync( 'package.json', 'utf-8' ) )
		const version = engines[ tool ]?.match( /\d+(?:\.\d+){0,2}/ )?.[ 0 ]?.toString()

		if ( version ) {
			process.stdout.write( `Resolved ${ tool } version from package.json engines: ${version}\n` )
		}

		return version
	} catch {
		process.stderr.write(
			`Failed to resolve ${ tool } version from package.json. Unable to parse the package.json file.\n`
		)
	}
}

/**
 * Resolve pnpm version from `packageManager` field in `package.json`.
 *
 */
const resolvePnpmFromPackageManager = (): string | undefined => {

	if ( ! existsSync( 'package.json' ) ) return

	try {
		const { packageManager } = JSON.parse( readFileSync( 'package.json', 'utf-8' ) )
		/**
		 * Extract version from:
		 * 
		 * - pnpm@11				-> 11
		 * - pnpm@11.9				-> 11.9
		 * - pnpm@11.9.0			-> 11.9.0
		 * - pnpm@11.9.0+sha256...	-> 11.9.0
		 */
		const version = packageManager?.match( /^pnpm@(\d+(?:\.\d+){0,2})(?:\+.*)?$/ )?.[ 1 ]?.toString()

		if ( version ) {
			process.stdout.write(
				`Resolved pnpm version from package.json packageManager: ${version}\n`
			)
		}

		return version;
	} catch {
		process.stderr.write(
			`Failed to resolve pnpm version from package.json packageManager. Unable to parse the package.json file.\n`
		)
	}
};

/**
 * Resolve node version from `.nvmrc` file.
 *
 */
const resolveNodeFromNvmrc = (): string | undefined => {
	if ( ! existsSync( '.nvmrc' ) ) return

	const version = readFileSync( '.nvmrc', 'utf-8' ).replace( /\n|\s/gi, '' )

	if ( version ) {
		process.stdout.write( `Resolved node version from .nvmrc file: ${version}\n` )
	}

	return version
};

const resolvers = {
	pnpm: [
		// resolve pnpm version from `.tool-versions` file
		() => resolveFromToolVersions( 'pnpm' ),
		// resolve pnpm version from `packageManager` field in `package.json`
		resolvePnpmFromPackageManager,
		// resolve pnpm version from `engines` field in `package.json`
		() => resolveFromPackageEngines( 'pnpm' ),
	],
	node: [
		// resolve node version from `.tool-versions` file
		() => resolveFromToolVersions( 'node' ),
		// resolve node version from `.nvmrc` file
		resolveNodeFromNvmrc,
		// resolve node version from `engines` field in `package.json`
		() => resolveFromPackageEngines( 'node' ),
	],
}

/**
 * Resolve tool version.
 *
 * @param tool The name of the tool for which to resolve the version.
 * @returns The resolved tool version.
 */
const resolve = ( tool: keyof typeof resolvers ): string | undefined => {
	for ( const resolver of resolvers[ tool ] ) {
		const value = resolver()
		if ( value ) return value
	}
}

const resolveToolVersions = () => {

	if ( ! process.env.GITHUB_OUTPUT ) {
		process.stderr.write(
			`Failed to resolve project tool versions. The script has no output channel available. GITHUB_OUTPUT environment variable is not defined.\n`
		)
		return
	}

	// write result to `GITHUB_OUTPUT` so it can be read by the next action step.
	appendFileSync(
		process.env.GITHUB_OUTPUT,
		[
			`pnpm=${ resolve( 'pnpm' ) || '' }`,
			`node=${ resolve( 'node' ) || '' }`
		].join( '\n' ) + '\n',
	)
}

resolveToolVersions()