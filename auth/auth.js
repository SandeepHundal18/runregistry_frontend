export default function(getState) {
    const state = getState();
    const email =
        process.env.ENV === 'development'
            ? 'fespinos@cern.ch'
            : state.info.adfs_email;
    return {
        headers: {
            egroups: state.info.adfs_group,
            email
        }
    };
}
