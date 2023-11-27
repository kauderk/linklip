import { removedTargets } from '$lib/utils'
import {
	createElementIntersectionCycle,
	processUnknownTargets,
	validTemplates,
} from './intersection'
import { mutationTargets } from './mutation'
import type { MutationObj, ObserverCallbacks, FuncProcessTarget } from './types'

type Assign = Pick<ObserverCallbacks, 'deploy'> & MutationObj
export async function createObserverAndDeployOnIntersection(
	targetSelectors: s[],
	assign: Assign
) {
	// set up all visible YT GIFs
	const cb = {
		found: [],
		async trackFoundEntry(data) {
			if (!data.params.target.parentElement) return
			const tracks = {
				target: data.params.target.parentElement,
				onRemoved: await this.deploy(data),
			}
			if (Object.values(tracks).every(v => !!v)) {
				// @ts-expect-error
				this.found.push(tracks)
			}
		},
		...assign,
		mutationTargets: assign.mutationTargets ?? mutationTargets,
		processFoundTargets:
			assign.processFoundTargets ?? processUnknownTargets,
	} satisfies ObserverCallbacks & Assign

	// deploy existing elements
	await deployOnIntersection(
		targetSelectors
			.map(s => document.queryAllasArr(s))
			.flat() as HTMLElement[]
	)

	// observe and deploy on intersection
	const observer = new MutationObserver(async mutationsList => {
		await deployOnIntersection(
			cb.mutationTargets(mutationsList, targetSelectors)
		)
		// https://stackoverflow.com/a/15995992
		cb.found = cb.found.filter(
			params => !removedTargets(mutationsList, params)
		)
	})

	const cashedDisconnect = observer.disconnect
	observer.disconnect = () => {
		cashedDisconnect.apply(observer)
		// @ts-expect-error destroy callback
		cb.found.forEach(o => o.onRemoved?.())
	}

	return observer

	async function deployOnIntersection(found: HTMLElement[]) {
		const targets = found.filter(validTemplates)
		const added = await cb.processFoundTargets(targets)

		added.forEach(process => {
			createElementIntersectionCycle(process.target, () =>
				cb.trackFoundEntry(<ReturnType<FuncProcessTarget<any>>>{
					payload: process.payload,
					params: {
						target: process.target,
						message: 'mutation entry',
						targetClass: targetSelectors[0],
					},
				})
			)
		})
	}
}
