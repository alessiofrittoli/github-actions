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
			console.log( '✅ Successfully set pnpm config.', { config, value } )
		} catch (error) {
			console.error( '❌ Failed to set pnpm config.', { config, value, error } )
		}
	} )
}

setupAdditionalPnpmConfigs()