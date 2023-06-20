const ffi = require('ffi-napi')

let keyMap: Map<number, boolean> = new Map();

const user32 = new ffi.Library('user32', {
	'GetAsyncKeyState': [
		'int32', ['int32']
	]
})

let listeningKeys: Map<number, Array<() => void>> = new Map()
let lastKeyState: Map<number, number> = new Map()

export function isPressed(state: number): boolean {
	// @ts-ignore
	return state > 32767
}

export function isTyping(state: number): boolean {
	// @ts-ignore
	return state == 32769
}


export function onType(key: number, listener: () => void): void {
	if (!listeningKeys.has(key)) {
		listeningKeys.set(key, [])
	}

	listeningKeys.get(key)!.push(listener)
}

export const StandardKeyCodes = {
	A: 65,
	B: 66,
	C: 67,
	D: 68,
	E: 69,
	F: 70,
	G: 71,
	H: 72,
	I: 73,
	J: 74,
	K: 75,
	L: 76,
	M: 77,
	N: 78,
	O: 79,
	P: 80,
	Q: 81,
	R: 82,
	S: 83,
	T: 84,
	U: 85,
	V: 86,
	W: 87,
	X: 88,
	Y: 89,
	Z: 90

}

setInterval(() => {
	for (let k of listeningKeys.keys()) {
		//@ts-ignore

		const status = user32.GetAsyncKeyState(k)
		if (isPressed(status) && !isPressed(lastKeyState.get(k) ?? 0)) {
			listeningKeys.get(k)!.forEach((callback) => {
				callback()
			})
		}

		lastKeyState.set(k, status)
	}

}, 10)