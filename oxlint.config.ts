import { oxlintConfig } from '@alessiofrittoli/package-configs/oxlint'

export default oxlintConfig({
	rules: {
		'typescript/no-explicit-any': 'error',
	},
})
