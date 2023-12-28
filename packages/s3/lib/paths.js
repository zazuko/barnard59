// @ts-check
import { dirname } from 'node:path'
import { mkdirp } from 'mkdirp'

/**
 * Ensure the directory of a file exists.
 * It will create the directory if it does not exist.
 *
 * @param {string} filePath Path to file.
 */
export const ensureFileDirectoryExists = async (filePath) => {
  const destinationPathDirectory = dirname(filePath)
  await mkdirp(destinationPathDirectory)
}
