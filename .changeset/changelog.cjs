/**
 *
 * @param {import('@changesets/types').NewChangesetWithCommit} changeset
 * @param {import('@changesets/types').VersionType} type
 * @returns
 */
const getReleaseLine = async (changeset) => {
  return changeset.summary;
};

/**
 *
 * @param {import('@changesets/types').NewChangesetWithCommit[]} changesets
 * @param {import('@changesets/types').ModCompWithPackage[]} dependenciesUpdated
 * @returns
 */
const getDependencyReleaseLine = async () => {
  return '';
};

module.exports = {
  getReleaseLine,
  getDependencyReleaseLine,
};
