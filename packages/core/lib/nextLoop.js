async function nextLoop () {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export default nextLoop
