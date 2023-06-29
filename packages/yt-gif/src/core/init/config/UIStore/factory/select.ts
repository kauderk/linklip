import { settingsTask } from '$v3/settings-page/task'
import type { DeepWritable } from '$lib/types/utilities'
import { writable } from 'svelte/store'
import {
	tryGetDirectSetting,
	TryUpdateSettingsBlockValue,
} from '$v3/init/dom/ui/update'
import type { Lookup } from '../types'
import type { ExcludeRecord, ExcludeStoreKeys, IChange } from './types'

type SelectStore<T> = ExcludeStoreKeys<T> &
	ExcludeRecord<'update' | 'subscribeTo' | 'selectedOptions'>
export function createSelectStore<L extends SelectStore<Lookup>>(lookup: L) {
	const keys = Object.keys(lookup.options)
	const isSelected = (k: s) => lookup.options[k].selected
	let currentValue: Value =
		keys.reduce((prev, crr) => {
			return isSelected(crr) ? crr : prev
		}, '') || keys[0]
	let previousValue: Value
	const selectedOptions = () => keys.filter(isSelected) as Value[]

	//#region types
	type Mutable = DeepWritable<L>
	type Value = keyof L['options']
	type Change<V extends s | Value> = Partial<L['options'][V]> & IChange<V>
	type subscribeTo = <V extends Value>(
		value: V,
		action: (
			payload: ReturnType<typeof getPayload<V, Value>> & {
				changeValue: V
			}
		) => void
	) => void
	//#endregion

	// prettier-ignore
	const getPayload = <V extends Value, P extends Value>(newValue: V, previousValue?: P) => ({
		previousValue: previousValue ?? newValue,
		value: newValue,
		options: lookup.options as Mutable['options'],
	});

	//#region internalStore
	var unsubscribeInternalStore: () => void
	const store = writable(getPayload(currentValue), () => {
		return () => unsubscribeInternalStore?.()
	})
	// @ts-expect-error
	const single = lookup.attributes?.includes('single') || !lookup.attributes

	settingsTask.promise
		.then(() => {
			// @ts-expect-error
			const id = lookup.id ?? lookup.label?.id
			if (typeof id != 'string') {
				return
			}
			// READ
			const sessionValue = tryGetDirectSetting(id)?.sessionValue as Value
			const sessionValues = sessionValue.toString().split(',')
			let lastStep: Change<s> | undefined
			Object.entries(lookup.options).forEach(([value, option]) => {
				option.selected = sessionValues.includes(value)
				const step = { ...option, value } as Change<s>
				if (option.selected) {
					lastStep = step
				}
				change({ ...step, invalidate: false })
			})
			if (lastStep) {
				change(lastStep)
			}

			// WRITE
			unsubscribeInternalStore = store.subscribe(async payload => {
				const replaceWith = single
					? payload.value.toString()
					: selectedOptions().join(',')
				await TryUpdateSettingsBlockValue(id, replaceWith)
			})
		})
		.catch(console.error)
	//#endregion

	function change<V extends Value>(newChange: Change<V>) {
		const { value, invalidate, ...assign } = newChange
		if (single) {
			Object.keys(lookup.options).forEach(value => {
				lookup.options[value].selected = false
			})
		}
		Object.assign(lookup.options[value as s], assign)
		if (invalidate !== false) {
			store.set(getPayload(value, currentValue))
		}
		currentValue = value
	}
	return {
		...(lookup as Mutable),
		get value() {
			return currentValue
		},
		change,
		subscribe: store.subscribe,
		update() {
			store.set(getPayload(currentValue, previousValue))
		},
		subscribeTo(value, action) {
			return store.subscribe(payload => {
				if (
					payload.value == value ||
					previousValue == payload.previousValue
				) {
					action({
						...getPayload(value, previousValue),
						changeValue: value,
					})
				}
				previousValue = payload.value
			})
		},
		//
		get options() {
			return lookup.options
		},
		get selectedOptions() {
			return selectedOptions()
		},
	} satisfies { subscribeTo: subscribeTo; value: Value }
}
