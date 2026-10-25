import { execSync } from 'child_process'

export const setupAdditionalPnpmConfigs = (pnpmConfigs?: string): void => {
	if (!pnpmConfigs) {
		return
	}

	const configs = pnpmConfigs
		.split(';')
		.filter(Boolean)
		.map(kv => kv.trim().split('='))

	configs.forEach(([config, value]) => {
		try {
			execSync(`pnpm config set "${config}" ${value}`)
			process.stdout.write(
				`✅ Successfully set pnpm config. ${JSON.stringify({ config, value }, undefined, 2)}\n`,
			)
		} catch (error) {
			process.stderr.write(
				`❌ Failed to set pnpm config. ${JSON.stringify({ config, value, error }, undefined, 2)}\n`,
			)
		}
	})
}
