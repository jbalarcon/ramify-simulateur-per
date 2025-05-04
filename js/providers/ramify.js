export const getNetReturn = profile => {
  switch (profile) {
    case 'defensif': return 0.021;
    case 'equilibré': return 0.061;
    case 'équilibré': return 0.061; // Explicitly handle accented key
    case 'agressif': return 0.1051;
    default: return undefined; // Or a default value/error
  }
};

export const getGrossReturn = profile => {
  switch (profile) {
    case 'defensif': return 0.028;
    case 'equilibré': return 0.0723;
    case 'équilibré': return 0.0723; // Explicitly handle accented key
    case 'agressif': return 0.1166;
    default: return undefined;
  }
}; 