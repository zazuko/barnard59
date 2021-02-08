function dateToId (date) {
  return (new Date(date)).toISOString()
    .split('-').join('')
    .split(':').join('')
    .split('.').join('')
  // [^0-9Z]
}

module.exports = dateToId
