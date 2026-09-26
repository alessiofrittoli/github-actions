import { execSync } from 'child_process'

const setupAdditionalPnpmConfigs = () => {

	const { ADDITIONAL_PNPM_CONFIGS } = process.env

	if ( ! ADDITIONAL_PNPM_CONFIGS ) {
		return
	}

	const configs = (
		ADDITIONAL_PNPM_CONFIGS
			.split( ';' )
			.filter( Boolean )
			.map( kv => kv.trim().split( '=' ) )
	)

	configs.forEach( ( [ config, value ] ) => {
		try {
			execSync( `pnpm config set "${ config }" ${ value }` )
			console.log( 'Successfully set pnpm config', { config, value } )
			const result = JSON.stringify( { config, value }, undefined, '\n' )
			process.stdout.write( `Successfully set pnpm config.\n${ result }` )
		} catch (error) {
			console.error( 'Failed to set pnpm config', { config, value, error } )
			const result = JSON.stringify( { config, value, error }, undefined, '\n' )
			process.stderr.write( `Failed to set pnpm config.\n${ result }` )
		}
	} )
}

setupAdditionalPnpmConfigs()