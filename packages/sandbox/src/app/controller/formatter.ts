const digit = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
})
export function ms2Hms(ms: n) {
  const milliseconds = Math.floor(ms / 1000)
  const hours = Math.floor(milliseconds / 3600)
  const minutes = Math.floor((milliseconds % 3600) / 60)
  const seconds = milliseconds % 60
  if (hours === 0) {
    return `${minutes}:${digit.format(seconds)}`
  } else {
    return `${hours}:${digit.format(minutes)}:${digit.format(seconds)}`
  }
}

export function ms2Hm(time: n) {
  const seconds = Math.floor(time % 60)
  const minutes = Math.floor(time / 60) % 60
  const hours = Math.floor(time / 3600)
  if (hours === 0) {
    return `${minutes}:${digit.format(seconds)}`
  } else {
    return `${hours}:${digit.format(minutes)}:${digit.format(seconds)}`
  }
}
