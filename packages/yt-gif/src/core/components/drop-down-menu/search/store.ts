import { writable } from 'svelte/store'

export let stack = writable<s[]>([])
