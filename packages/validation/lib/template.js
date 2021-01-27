// Template helper

module.exports = ([first, ...rest], ...fields) => {
  return (values = {}) => {
    const templated = fields.map(
      (field) => field in values ? values[field] : '${' + field + '}'
    )
    return rest.reduce((acc, str, i) => acc + templated[i] + str, first)
  }
}
