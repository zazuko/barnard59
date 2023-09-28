// @ts-check
import { rimraf } from 'rimraf'

export const testResultsDirectory = './test/results'

/**
 * Remove the test results directory.
 *
 * @returns {Promise<void>}
 */
export const removeResultsDirectory = async () => {
  await rimraf(testResultsDirectory)
}
