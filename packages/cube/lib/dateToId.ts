function dateToId(date: string) {
  return (new Date(date)).toISOString()
    .split('-').join('')
    .split(':').join('')
    .split('.').join('')
  // [^0-9Z]
}

export default dateToId
